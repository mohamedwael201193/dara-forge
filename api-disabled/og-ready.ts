export default async function handler(req: any, res: any) {
try {
const root = (req.query.root || req.query.r || ").toString();
if (!root) return res.status(400).json({ ok: false, error: "root required" });
const base = (process.env.OG_INDEXER || ").replace(/\/$/, ");
const url = `${base}/file?root=${encodeURIComponent(root)}`;
const resp = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
if (resp.ok || resp.status === 206) return res.status(200).json({ ok: true, ready: true });
return res.status(200).json({ ok: true, ready: false, status: resp.status });
} catch (e: any) {
return res.status(200).json({ ok: true, ready: false, error: String(e?.message || e) });
}
}

