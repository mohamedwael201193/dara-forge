import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "Minimal API function is working!"
      });
    }
    return res.status(200).json({
      ok: true,
      message: "Minimal API function received a POST request!"
    });
  } catch (e: any) {
    console.error("Minimal function caught an error:", e);
    return res.status(500).send(`Minimal function error: ${e?.message || String(e)}`);
  }
}


