import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";

// Note: In production, this would use 0G KV storage or a proper database
// For now, we'll use a simple in-memory store (would need Redis/DB for production)
const attestations = new Map<string, any>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      // Get attestation by root
      const { root } = req.query;
      if (!root || typeof root !== "string") {
        return res.status(400).json({ ok: false, error: "root parameter required" });
      }
      
      const attestation = attestations.get(`attest:${root}`);
      if (!attestation) {
        return res.status(404).json({ ok: false, error: "Attestation not found" });
      }
      
      return res.status(200).json({ ok: true, ...attestation });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { root, message, signature } = req.body || {};
    if (!root || !message || !signature) {
      return res.status(400).json({ ok: false, error: "root, message, signature required" });
    }

    // Verify the signature
    const recovered = ethers.verifyMessage(message, signature);
    
    // Store the attestation (in production, use 0G KV or proper database)
    const attestation = { 
      root, 
      message, 
      signature, 
      address: recovered, 
      timestamp: Date.now() 
    };
    
    attestations.set(`attest:${root}`, attestation);
    
    return res.status(200).json({ 
      ok: true, 
      address: recovered,
      message: "Attestation stored successfully" 
    });
  } catch (e: any) {
    console.error("Attestation error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "attest failed" });
  }
}