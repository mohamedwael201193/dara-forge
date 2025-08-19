import { Indexer } from '@0glabs/0g-ts-sdk';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile, unlink } from 'node:fs/promises';

const DEFAULT_INDEXER = 'https://indexer-storage-testnet-turbo.0g.ai';

export default async function handler(req: any, res: any) {
  try {
    const root = String(req.query?.root || '').trim();
    const name = String(req.query?.name || 'file.bin').trim() || 'file.bin';
    if (!root) return res.status(400).send('root required');

    const INDEXER_RPC = (process.env.OG_INDEXER_RPC || DEFAULT_INDEXER).replace(/\/$/, '');
    const outPath = join(tmpdir(), `og-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`);

    const indexer = new Indexer(INDEXER_RPC);
    // with_proof = true → proof-verified download
    const err = await (indexer as any).download(root, outPath, true);
    if (err !== null) return res.status(502).send(String(err));

    const buf = await readFile(outPath);
    await unlink(outPath).catch(() => {});
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('Content-Length', String(buf.length));
    return res.status(200).send(buf);
  } catch (e: any) {
    return res.status(500).send(e?.message || String(e));
  }
}

