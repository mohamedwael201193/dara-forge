import type { VercelRequest, VercelResponse } from '@vercel/node';

const IDX_DEFAULTS = [
  'https://indexer-storage-testnet-turbo.0g.ai',
  'https://indexer-storage-testnet-standard.0g.ai',
];

async function probe(url: string, timeoutMs = 3000): Promise<boolean> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, signal: ac.signal });
    return res.status === 200 || res.status === 206;
  } catch { return false; } finally { clearTimeout(t); }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || '').trim();
    const path = String(req.query.path || '').trim(); // optional for folder
    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) return res.status(400).json({ ok: false, error: 'Invalid root' });

    const envList = (process.env.OG_INDEXER_LIST || process.env.OG_INDEXER || process.env.OG_INDEXER_RPC || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    const indexers = [...envList, ...IDX_DEFAULTS].filter((v, i, a) => a.indexOf(v) === i);

    for (const base of indexers) {
      const clean = base.replace(/\/$/, '');
      const url = path
        ? `${clean}/file/${root}/${encodeURI(path)}`
        : `${clean}/file?root=${encodeURIComponent(root)}&name=__probe`;
      if (await probe(url)) return res.status(200).json({ ok: true, indexer: clean });
    }
    return res.status(200).json({ ok: true, indexer: null });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}

