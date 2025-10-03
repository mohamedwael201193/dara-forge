// Simple fallback compute handler without 0G SDK for now
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";

const store: Record<string, any> = (globalThis as any).__OGC_STORE__ || ((globalThis as any).__OGC_STORE__ = {});

function bad(res: VercelResponse, code: number, msg: string) {
  return res.status(code).json({ ok: false, error: msg });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action || "health");

    if (req.method === "GET" && action === "health") {
      // Mock health response
      return res.status(200).json({ 
        ok: true, 
        ledger: { balance: "1.0" }, 
        servicesCount: 1,
        message: "0G Compute temporarily using mock responses - SDK integration in progress"
      });
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

    const { text, root, model = "llama-3.3-70b-instruct" } = req.body || {};
    if (!text && !root) return bad(res, 400, "Provide text and/or root");

    // Mock analysis response
    const jobId = randomUUID();
    
    // Simulate processing time
    setTimeout(() => {
      const mockResult = {
        model: model,
        provider: "mock-provider",
        root: root || null,
        verified: true,
        content: `Mock AI Analysis:\n\nThis is a simulated analysis response for the provided ${text ? 'text' : 'dataset'}. The 0G Compute integration is temporarily using mock responses while we resolve SDK compatibility issues.\n\n${text ? `Input text: "${text.slice(0, 100)}${text.length > 100 ? '...' : ''}"` : ''}\n${root ? `Dataset root: ${root}` : ''}\n\nOnce the 0G SDK integration is complete, this will be replaced with actual verifiable compute results from decentralized providers.`,
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        ts: Date.now()
      };
      
      store[jobId] = mockResult;
    }, 2000); // 2 second delay to simulate processing

    return res.status(200).json({ ok: true, jobId });
  } catch (e: any) {
    console.error("compute error:", e?.stack || e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || "compute failed" });
  }
}