import type { VercelRequest, VercelResponse } from "@vercel/node";
const BASE = (process.env.VITE_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai/").replace(/\/$/, "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || "");
    const proof = String(req.query.proof || "");
    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) return res.status(400).send("Invalid root");

    const url = `${BASE}/file?root=${encodeURIComponent(root)}${proof ? `&proof=${encodeURIComponent(proof)}` : ""}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).send(await r.text());

    r.headers.forEach((v, k) => {
      const kl = k.toLowerCase();
      if (kl === "content-length" || kl === "content-type" || kl === "content-disposition") res.setHeader(k, v);
    });

    const buf = Buffer.from(await r.arrayBuffer());
    res.status(200).send(buf);
  } catch (e: any) {
    res.status(500).send(e?.message || "proxy error");
  }
}


