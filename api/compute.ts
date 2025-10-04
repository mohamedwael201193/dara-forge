import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { brokerDiagnostics, ensureLedger, getBroker } from "../src/lib/zgBroker.js";

const store: Record<string, any> =
  (globalThis as any).__OGC_STORE__ || ((globalThis as any).__OGC_STORE__ = {});

function bad(res: VercelResponse, code: number, msg: string) {
  return res.status(code).json({ ok: false, error: msg });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action || "health");
    console.log(`[Compute API] ${req.method} request with action: ${action}`);

    if (req.method === "GET" && action === "diagnostics") {
      const info: any = {
        ok: true,
        env: {
          has_RPC: !!(process.env.OG_RPC_URL || process.env.OG_COMPUTE_RPC),
          has_COMPUTE_PK: !!(
            process.env.OG_COMPUTE_PRIVATE_KEY ||
            process.env.OG_COMPUTE_API_KEY ||
            process.env.OG_STORAGE_PRIVATE_KEY
          ),
        },
        module: brokerDiagnostics(),
      };
      try {
        const b = await getBroker();
        const ledger = await b.ledger.getLedger().catch(() => ({ balance: "0" }));
        info.ledger = ledger;
      } catch (e: any) {
        info.error = e?.message || String(e);
      }
      return res.status(200).json(info);
    }

    if (req.method === "GET" && action === "health") {
      try {
        const b = await getBroker();
        const ledger = await b.ledger.getLedger().catch(() => ({ balance: "0" }));
        const services = await b.inference.listService().catch(() => []);
        return res.status(200).json({
          ok: true,
          ledger,
          servicesCount: services?.length ?? 0,
          module: brokerDiagnostics(),
        });
      } catch (e: any) {
        return res.status(500).json({
          ok: false,
          error: "Failed to load compute module",
          details: e?.message || String(e),
          module: brokerDiagnostics(),
        });
      }
    }

    if (req.method === "GET" && action === "result") {
      const id = String(req.query.id || "");
      if (!id) return bad(res, 400, "Missing job id");
      const data = store[id];
      if (!data) return bad(res, 404, "Not found");
      return res.status(200).json({ ok: true, ...data });
    }

    if (req.method !== "POST" || action !== "analyze") {
      res.setHeader("Allow", "GET, POST");
      return bad(res, 405, "Method Not Allowed");
    }

    // Analyze: exact flow from SDK docs
    const { text, root, model = "deepseek-r1-70b", temperature = 0.2 } = req.body || {};
    if (!text && !root) return bad(res, 400, "Provide text and/or root");

    // Try to ensure ledger is funded, but don't fail if it can't be funded
    await ensureLedger();
    const b = await getBroker();

    // Discover services
    const services = await b.inference.listService();
    const svc =
      services.find((s: any) =>
        (s.model || "").toLowerCase().includes(String(model).toLowerCase())
      ) || services[0];
    if (!svc) return bad(res, 503, "No compute services available");

    const providerAddress: string = svc.provider;

    // Metadata: endpoint + model (must pass provider address)
    const meta = await b.inference.getServiceMetadata(providerAddress);
    const endpoint = meta?.endpoint || meta?.url || svc?.url;
    const resolvedModel = meta?.model || svc?.model || model;
    if (!endpoint) return bad(res, 500, "Provider endpoint not found");

    // Messages & body (OpenAI-compatible)
    const messages = [
      {
        role: "user",
        content: [root ? `Dataset Merkle Root: ${root}` : null, text || null]
          .filter(Boolean)
          .join("\n\n"),
      },
    ];
    const body = { messages, model: resolvedModel, temperature };

    // Single-use signed headers (pass provider address and JSON-stringified messages)
    const headers = await b.inference.getRequestHeaders(
      providerAddress,
      JSON.stringify(messages)
    );

    // Call provider (OpenAI-compatible)
    const r = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      return bad(res, r.status, `Provider error: ${t}`);
    }
    const data: any = await r.json();
    const answer =
      data?.choices?.[0]?.message?.content ||
      data?.text ||
      JSON.stringify(data);
    const chatID = data?.id;

    // Verify response (pass provider address and received content)
    const v = await b.inference.processResponse(providerAddress, data, chatID);

    const jobId = randomUUID();
    store[jobId] = {
      ok: true,
      model: resolvedModel,
      provider: providerAddress,
      root: root || null,
      verified: !!v?.verified,
      content: answer,
      usage: v?.usage || data?.usage || null,
      ts: Date.now(),
    };

    return res
      .status(200)
      .json({ ok: true, jobId, module: brokerDiagnostics() });
  } catch (e: any) {
    console.error("compute error:", e?.stack || e?.message || e);
    return res
      .status(500)
      .json({ ok: false, error: e?.message || "compute failed" });
  }
}