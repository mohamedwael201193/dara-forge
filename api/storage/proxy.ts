import type { VercelRequest, VercelResponse } from "@vercel/node";

const TURBO = (process.env.VITE_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai/").replace(/\/$/, "");
const STANDARD = (process.env.OG_INDEXER || "https://indexer-storage-testnet-standard.0g.ai/").replace(/\/$/, "");

function contentDisposition(filename?: string) {
  if (!filename) return undefined;
  // RFC 5987
  return `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

async function fetchFrom(base: string, root: string, proof: string) {
  const url = `${base}/file?root=${encodeURIComponent(root)}${proof ? `&proof=${encodeURIComponent(proof)}` : ""}`;
  const r = await fetch(url);
  return { r, url };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || "");
    const proof = String(req.query.proof || "");
    const name = String(req.query.name || "");

    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) return res.status(400).send("Invalid root");

    // Try turbo first, then standard as fallback
    let fr = await fetchFrom(TURBO, root, proof);
    if (!fr.r.ok) {
      console.log(`Turbo failed (${fr.r.status}), trying standard fallback...`);
      const backup = await fetchFrom(STANDARD, root, proof);
      if (backup.r.ok) fr = backup;
    }
    
    if (!fr.r.ok) return res.status(fr.r.status).send(await fr.r.text());

    // Headers
    const type = fr.r.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", type);

    const len = fr.r.headers.get("content-length");
    if (len) res.setHeader("Content-Length", len);

    // Cache control for better performance
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");

    const forced = contentDisposition(name);
    if (forced) {
      res.setHeader("Content-Disposition", forced);
    } else {
      const upstream = fr.r.headers.get("content-disposition");
      res.setHeader("Content-Disposition", upstream || contentDisposition(root) || "attachment");
    }

    const buf = Buffer.from(await fr.r.arrayBuffer());
    res.status(200).send(buf);
  } catch (e: any) {
    console.error("Proxy error:", e);
    res.status(500).send(e?.message || "proxy error");
  }
}


