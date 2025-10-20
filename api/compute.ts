import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeWithAI } from "../src/server/compute/broker.js";

function coalesceText(body: any): string {
  const candidates = [
    body?.text,
    body?.prompt,
    body?.content,
    body?.message,
    body?.input?.text,
    body?.input,
  ];
  const v = candidates.find(
    (x) => typeof x === "string" && x.trim().length > 0
  );
  return v ? v.trim() : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const text = coalesceText(req.body);
    const { datasetRoot, model } = req.body;

    // Validate input
    if (!text) {
      return res.status(400).json({
        ok: false,
        code: "INVALID_INPUT",
        error: "Text is required",
      });
    }

    console.log("[API] Starting real 0G Compute analysis...");
    console.log("[API] Text length:", text.length);
    if (datasetRoot) {
      console.log("[API] Dataset root:", datasetRoot);
    }

    // Call REAL 0G Compute (no fallback)
    const result = await analyzeWithAI(text.trim(), datasetRoot);

    console.log("[API] ✅ Analysis complete");
    console.log("[API] Provider:", result.provider);
    console.log("[API] Model:", result.model);
    console.log("[API] Verified:", result.verified);
    console.log("[API] Answer length:", result.answer.length);

    return res.status(200).json({
      ok: true,
      answer: result.answer,
      provider: result.provider,
      model: result.model,
      verified: result.verified,
      chatID: result.chatID,
      attestation: result.attestation,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] ❌ 0G Compute error:", error);

    // Provider unfunded or infra issues
    if (
      /insufficient balance|response reservation|available balance/i.test(
        String(error?.message)
      )
    ) {
      return res.status(503).json({
        ok: false,
        code: "PROVIDER_UNFUNDED",
        error: "0G provider temporarily unfunded",
        details: error.message,
      });
    }

    // No services available
    if (/no services|no compute services/i.test(String(error?.message))) {
      return res.status(503).json({
        ok: false,
        code: "NO_SERVICES",
        error: "No compute services available",
      });
    }

    // General compute failure
    return res.status(500).json({
      ok: false,
      code: "INTERNAL",
      error: error.message || "Compute failed",
      details:
        process.env.NODE_ENV === "development"
          ? {
              stack: error.stack,
              name: error.name,
            }
          : undefined,
    });
  }
}
