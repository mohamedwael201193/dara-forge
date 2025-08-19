import { Indexer } from '@0glabs/0g-ts-sdk';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile, unlink } from 'node:fs/promises';

const DEFAULT_INDEXER = 'https://indexer-storage-testnet-turbo.0g.ai';

async function gatewayReady(indexerBase: string, root: string) {
  const url = `${indexerBase.replace(/\/$/, '')}/file?root=${encodeURIComponent(root)}`;
  try {
    const r = await fetch(url, { headers: { 'Cache-Control': 'no-cache', Accept: '*/*' } });
    if (!r.ok) return false;
    const textProbe = r.headers.get('content-type')?.includes('application/json') ? await r.clone().text() : '';
    if (textProbe && (/"code"\s*:\s*101/.test(textProbe) || /file not found/i.test(textProbe))) return false;
    return true;
  } catch { return false; }
}

export default async function handler(req: any, res: any) {
  try {
    const root = String(req.query?.root || '').trim();
    const name = String(req.query?.name || 'file.bin').trim() || 'file.bin';
    if (!root) return res.status(400).send('root required');

    const INDEXER_RPC = (process.env.OG_INDEXER_RPC || DEFAULT_INDEXER).replace(/\/$/, '');

    const t0 = Date.now();
    while (!(await gatewayReady(INDEXER_RPC, root))) {
      if (Date.now() - t0 > 12000) { // ~12s budget
        res.setHeader('Retry-After', '4');
        return res.status(404).send('not ready');
      }
      await new Promise(r => setTimeout(r, 800));
    }

    const outPath = join(tmpdir(), `og-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`);
    const indexer = new Indexer(INDEXER_RPC);
    const err = await (indexer as any).download(root, outPath, true); // with proof
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


