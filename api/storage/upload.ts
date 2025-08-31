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
    const ct = req.headers['content-type'] || '';
    const boundary = ct.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ error: 'No multipart boundary' });

    const chunks: Buffer[] = [];
    for await (const c of (req as any)) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('binary');

    const part = raw.split(`--${boundary}`).find(p => p.includes('name="file"'));
    if (!part) return res.status(400).json({ error: 'No file part' });

    const idx = part.indexOf('\r\n\r\n');
    const bin = Buffer.from(part.slice(idx + 4), 'binary');
    const buf = bin.subarray(0, bin.length - 2);

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), '0g-'));
    const p = path.join(dir, 'upload.bin');
    await fs.writeFile(p, buf);

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


