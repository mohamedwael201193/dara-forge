import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple wrapper that forwards to the main compute API
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Forward to main compute API
  const computeAPI = await import("../compute.js");
  return computeAPI.default(req, res);
}
