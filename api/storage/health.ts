import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

export default async function handler(_: VercelRequest, res: VercelResponse) {
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

