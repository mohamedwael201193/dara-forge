import type { VercelRequest, VercelResponse } from "@vercel/node";
const BASE = (process.env.VITE_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai/").replace(/\/$/, "");

function contentDisposition(filename?: string) {
  if (!filename) return undefined;
  // RFC 5987
  return `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || "");
    const proof = String(req.query.proof || "");
    const name = String(req.query.name || "");

    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) return res.status(400).send("Invalid root");

    const url = `${BASE}/file?root=${encodeURIComponent(root)}${proof ? `&proof=${encodeURIComponent(proof)}` : ""}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).send(await r.text());

    const type = r.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", type);

    const len = r.headers.get("content-length");
    if (len) res.setHeader("Content-Length", len);

    const forced = contentDisposition(name);
    if (forced) {
      res.setHeader("Content-Disposition", forced);
    } else {
      const upstream = r.headers.get("content-disposition");
      res.setHeader("Content-Disposition", upstream || contentDisposition(root) || "attachment");
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.status(200).send(buf);
  } catch (e: any) {
    res.status(500).send(e?.message || "proxy error");
  }
}


