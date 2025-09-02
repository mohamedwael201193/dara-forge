import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const fileData = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!name || !fileData) {
      res.status(400).json({ error: 'Missing name or file data' });
      return;
    }

    const tempPath = fileData.filepath;

    const evmRpc = process.env.OG_RPC!;
    const indexerRpc = process.env.OG_INDEXER_RPC!;
    const priv = process.env.OG_STORAGE_PRIVATE_KEY!;

    const provider = new ethers.JsonRpcProvider(evmRpc);
    const signer = new ethers.Wallet(priv, provider);

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

    await unlink(tempPath).catch(() => {});
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}


