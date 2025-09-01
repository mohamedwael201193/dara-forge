import type { VercelRequest, VercelResponse } from '@vercel/node';

const INDEXER_FALLBACKS = [
  'https://indexer-storage-testnet-turbo.0g.ai',
  'https://indexer-storage-testnet-standard.0g.ai',
];

async function probeIndexer(indexer: string, root: string, timeoutMs = 3000): Promise<boolean> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const u = `${indexer.replace(/\/$/, '')}/file?root=${encodeURIComponent(root)}&name=__probe`;
    const res = await fetch(u, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal: ac.signal,
    });
    // 206 (partial) or 200 (OK) both indicate the file is retrievable
    return res.status === 206 || res.status === 200;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || '').trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) {
      return res.status(400).json({ ok: false, error: 'Invalid root' });
    }
    const fromEnv =
      process.env.OG_INDEXER_LIST ||
      process.env.OG_INDEXER ||
      process.env.OG_INDEXER_RPC ||
      '';
    const indexers = [
      ...fromEnv.split(',').map(s => s.trim()).filter(Boolean),
      ...INDEXER_FALLBACKS,
    ].filter((v, i, a) => a.indexOf(v) === i);

    for (const ind of indexers) {
      const ok = await probeIndexer(ind, root);
      if (ok) return res.status(200).json({ ok: true, root, status: 'available', indexer: ind });
    }
    return res.status(200).json({ ok: true, root, status: 'pending' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}

