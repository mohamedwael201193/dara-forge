import type { VercelRequest, VercelResponse } from '@vercel/node';
import os from 'os'; import fs from 'fs'; import path from 'path';
import { Indexer } from '@0glabs/0g-ts-sdk';

const IDX_DEFAULTS = [
  'https://indexer-storage-testnet-turbo.0g.ai',
  'https://indexer-storage-testnet-standard.0g.ai',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || '').trim();
    const name = String(req.query.name || 'download.bin');
    const withProof = String(req.query.proof || 'true') !== 'false';
    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) return res.status(400).json({ ok: false, error: 'Invalid root' });

    // choose an indexer that serves the file (reuse resolve logic client-side first for better UX)
    const envList = (process.env.OG_INDEXER_LIST || process.env.OG_INDEXER || process.env.OG_INDEXER_RPC || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    const indexers = [...envList, ...IDX_DEFAULTS].filter((v, i, a) => a.indexOf(v) === i);

    const outPath = path.join(os.tmpdir(), `${Date.now()}_${name}`);
    let lastErr: unknown = null;

    for (const base of indexers) {
      try {
        const indexer = new Indexer(base);
        const err = await indexer.download(root, outPath, withProof);
        if (err) throw err;
        // stream file to client
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        fs.createReadStream(outPath)
          .on('close', () => fs.unlink(outPath, () => {}))
          .pipe(res);
        return;
      } catch (e) { lastErr = e; }
    }
    return res.status(502).json({ ok: false, error: `All indexers failed for proof-download: ${String(lastErr)}` });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}

