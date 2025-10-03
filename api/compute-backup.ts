import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";
import { randomUUID } from "node:crypto";

let broker: any = null;
const store: Record<string, any> = (globalThis as any).__OGC_STORE__ || ((globalThis as any).__OGC_STORE__ = {});

function mustEnv(name: string, val?: string) {
  if (!val) throw new Error(`Missing env ${name}`);
  return val;
}

async function getBroker() {
  if (broker) return broker;
  const rpc = process.env.OG_RPC_URL || process.env.OG_COMPUTE_RPC || "https://evmrpc-testnet.0g.ai";
  const pk =
    process.env.OG_COMPUTE_PRIVATE_KEY ||
    process.env.OG_COMPUTE_API_KEY ||
    process.env.OG_STORAGE_PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(mustEnv("OG_RPC_URL/OG_COMPUTE_RPC", rpc));
  const wallet = new ethers.Wallet(mustEnv("OG_COMPUTE_PRIVATE_KEY/OG_COMPUTE_API_KEY/OG_STORAGE_PRIVATE_KEY", pk), provider);
  broker = await createZGComputeNetworkBroker(wallet as any);
  return broker;
}

async function ensureLedger(minBalance = 0.05) {
  const b = await getBroker();
  const led = await b.ledger.getLedger().catch(() => null);
  const bal = Number((led as any)?.balance || "0");
  if (bal < minBalance) {
    await b.ledger.addLedger(minBalance);
  }
  return { before: bal };
}

function bad(res: VercelResponse, code: number, msg: string) {
  return res.status(code).json({ ok: false, error: msg });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action || "health");

    if (req.method === "GET" && action === "health") {
      const b = await getBroker();
      const ledger = await b.ledger.getLedger().catch(() => ({ balance: "0" }));
      const services = await b.inference.listService().catch(() => []);
      return res.status(200).json({ ok: true, ledger, servicesCount: services?.length ?? 0 });
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

    const { text, root, model = "llama-3.3-70b-instruct", temperature = 0.2 } = req.body || {};
    if (!text && !root) return bad(res, 400, "Provide text and/or root");

    await ensureLedger();
    const b = await getBroker();

    const services = await b.inference.listService();
    const svc =
      services.find((s: any) => (s.model || "").toLowerCase().includes(String(model).toLowerCase())) ||
      services[0];
    if (!svc) return bad(res, 503, "No compute services available");

    const meta = await b.inference.getServiceMetadata(svc.provider);

    const content = {
      messages: [
        { role: "system", content: "You are a research assistant. Produce concise, factual summaries." },
        {
          role: "user",
          content: [
            root ? `Dataset Merkle Root: ${root}` : null,
            text ? `User text:\n${text}` : null
          ].filter(Boolean).join("\n\n")
        }
      ],
      temperature
    };

    const headers = await b.inference.getRequestHeaders(svc.provider, content);

    const rr = await fetch((meta as any).endpoint, { 
      method: "POST", 
      headers: { "Content-Type": "application/json", ...(headers as any) }, 
      body: JSON.stringify({ model: (meta as any).model, ...content })
    });
    if (!rr.ok) {
      const t = await rr.text();
      return bad(res, rr.status, `Provider error: ${t}`);
    }
    const payload = await rr.json() as any;

    const verified = await b.inference.processResponse(svc.provider, payload).catch(() => null);
    const resultText = payload?.choices?.[0]?.message?.content || payload?.text || JSON.stringify(payload);
    const jobId = randomUUID();
    store[jobId] = {
      model: svc.model,
      provider: svc.provider,
      root: root || null,
      verified: !!verified,
      content: resultText,
      usage: payload?.usage || null,
      ts: Date.now()
    };

    return res.status(200).json({ ok: true, jobId });
  } catch (e: any) {
    console.error("compute error:", e?.stack || e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || "compute failed" });
  }
}