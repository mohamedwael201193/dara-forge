import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

// Storage health check
async function handleHealth(_: VercelRequest, res: VercelResponse) {
  const out: any = { ok: true, rpc: [], indexers: [] };
  const RPCLIST = (process.env.OG_RPC_LIST || process.env.OG_RPC || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const url of RPCLIST) {
    try {
      const p = new ethers.JsonRpcProvider(url);
      const net = await p.getNetwork();
      const bn = await p.getBlockNumber();
      out.rpc.push({ url, chainId: Number(net.chainId), block: bn, ok: true });
    } catch (e: any) {
      out.rpc.push({ url, ok: false, err: e?.message || String(e) });
    }
  }
  const INDEXERLIST = (process.env.OG_INDEXER_LIST || process.env.OG_INDEXER_RPC || process.env.OG_INDEXER || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  out.indexers = INDEXERLIST.map(u => ({ url: u }));
  res.status(200).json(out);
}

// Storage status check
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
    return res.status === 206 || res.status === 200;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

const INDEXER_FALLBACKS = [
  'https://indexer-storage-testnet-turbo.0g.ai',
  'https://indexer-storage-testnet-standard.0g.ai',
];

async function handleStatus(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || '').trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) {
      return res.status(400).json({ ok: false, error: 'Invalid root' });
    }
    const fromEnv = process.env.OG_INDEXER_LIST || process.env.OG_INDEXER || process.env.OG_INDEXER_RPC || '';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  switch (action) {
    case 'health':
      return handleHealth(req, res);
    case 'status':
      return handleStatus(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action. Use ?action=health or ?action=status' });
  }
}