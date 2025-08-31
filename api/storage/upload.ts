import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ethers } from 'ethers';

export const config = { api: { bodyParser: false } };

const RPC = process.env.OG_RPC!;
const INDEXER = process.env.OG_INDEXER_RPC!;
const PRIV = process.env.OG_STORAGE_PRIVATE_KEY!;
const EXPLORER = process.env.VITE_OG_EXPLORER ?? 'https://chainscan-galileo.0g.ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!RPC || !INDEXER || !PRIV) return res.status(500).json({ error: 'Missing OG_RPC / OG_INDEXER_RPC / OG_STORAGE_PRIVATE_KEY' });

  try {
    const ct = String(req.headers['content-type'] || '');
    let buf: Buffer | null = null;

    if (ct.includes('multipart/form-data')) {
      // Manual multipart parse (single field: "file")
      const boundary = ct.split('boundary=')[1];
      if (!boundary) return res.status(400).json({ error: 'Multipart request missing boundary. Do not set Content-Type manually; let the browser add it.' });

      const chunks: Buffer[] = [];
      for await (const c of (req as any)) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('binary');
      const part = raw.split(`--${boundary}`).find(p => p.includes('name="file"'));
      if (!part) return res.status(400).json({ error: 'No "file" part in multipart form-data.' });

      const idx = part.indexOf('\r\n\r\n');
      if (idx === -1) return res.status(400).json({ error: 'Malformed multipart body.' });

      const binary = Buffer.from(part.slice(idx + 4), 'binary');
      buf = binary.subarray(0, binary.length - 2); // trim trailing \r\n
    } else if (ct.startsWith('application/octet-stream')) {
      // Raw binary upload (e.g., curl --data-binary with x-filename)
      const chunks: Buffer[] = [];
      for await (const c of (req as any)) chunks.push(c);
      buf = Buffer.concat(chunks);
    } else {
      return res.status(400).json({
        error: 'Invalid Content-Type. Send multipart/form-data with FormData("file", ...) and do not set Content-Type manually.'
      });
    }

    if (!buf || buf.length === 0) return res.status(400).json({ error: 'Empty file buffer' });

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), '0g-'));
    const p = path.join(dir, 'upload.bin');
    await fs.writeFile(p, buf);

    // 0G SDK upload (documented pattern)
    const provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIV, provider);
    const indexer = new Indexer(INDEXER);

    const zg = await ZgFile.fromFilePath(p);
    const [tree, terr] = await zg.merkleTree();
    if (terr) throw terr;

    const [tx, uerr] = await indexer.upload(zg, RPC, signer as any);
    await zg.close();
    await fs.rm(dir, { recursive: true, force: true });
    if (uerr) throw uerr;

    const rootHash = tree!.rootHash();
    return res.status(200).json({
      ok: true,
      rootHash,
      txHash: tx,
      explorer: `${EXPLORER}/tx/${tx}`
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}


