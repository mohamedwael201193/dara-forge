// api/storage/upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { name, contentBase64 } = req.body as { name?: string; contentBase64?: string };
    if (!name || !contentBase64) {
      res.status(400).json({ error: 'Missing name or contentBase64' });
      return;
    }

    // Prepare temp file for SDK
    const bytes = Buffer.from(contentBase64, 'base64');
    const tempPath = join(tmpdir(), name);
    await writeFile(tempPath, bytes);

    // Build signer (ethers v6)
    const evmRpc = process.env.OG_EVM_RPC!;
    const indexerRpc = process.env.OG_INDEXER_RPC!;
    const priv = process.env.OG_PRIVATE_KEY!;

    const provider = new ethers.JsonRpcProvider(evmRpc);
    const signer = new ethers.Wallet(priv, provider);

    // v0.3.x API: one-arg constructor, three-arg upload
    const indexer = new Indexer(indexerRpc);

    const file = await ZgFile.fromFilePath(tempPath);
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr) throw treeErr;

    const [tx, uploadErr] = await indexer.upload(file, evmRpc, signer);
    await file.close();

    if (uploadErr) throw uploadErr;

    res.status(200).json({
      ok: true,
      tx,
      root: tree?.rootHash(),
    });

    // Cleanup temp file
    await unlink(tempPath).catch(() => {});
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}


