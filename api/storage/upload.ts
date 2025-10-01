import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';
import formidable from 'formidable';
import { unlink } from 'node:fs/promises';

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

    // --- DEBUGGING CODE ADDED HERE ---
    console.log('--- DEBUGGING PRIVATE KEY ---');
    console.log('The API received this private key:', priv);
    console.log('--- END DEBUGGING ---');
    // ---------------------------------

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