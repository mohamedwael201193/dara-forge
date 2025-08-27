import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';

export const config = { api: { bodyParser: false } };

function parseForm(req: VercelRequest) {
  const form = formidable({ keepExtensions: true, uploadDir: '/tmp' });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

function pickFirstFile(files: formidable.Files) {
  for (const v of Object.values(files || {})) {
    const arr = Array.isArray(v) ? v : [v];
    for (const f of arr) if (f && (f as any).filepath) return f as formidable.File;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.info('[upload] Request received');
  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    // Accept multiple env names you already have in Vercel
    const OG_RPC =
      process.env.OG_RPC ||
      process.env.OG_RPC_URL ||
      process.env.VITE_OG_RPC ||
      process.env.VITE_OG_RPC_ALT;
    const INDEXER =
      process.env.OG_INDEXER ||
      process.env.OG_INDEXER_RPC ||
      process.env.VITE_OG_INDEXER;
    const PRIV = process.env.OG_STORAGE_PRIVATE_KEY;

    console.info('[upload] Env check:', {
      OG_RPC: OG_RPC ? 'SET' : 'MISSING',
      INDEXER: INDEXER ? 'SET' : 'MISSING',
      PRIV: PRIV ? 'SET' : 'MISSING',
    });
    if (!OG_RPC || !INDEXER || !PRIV) {
      return res.status(500).json({ success: false, message: 'Missing OG_RPC / INDEXER / OG_STORAGE_PRIVATE_KEY' });
    }

    const { files } = await parseForm(req);
    const file = pickFirstFile(files);
    if (!file?.filepath) return res.status(400).json({ success: false, message: 'No file provided' });

    const tmpPath = (file as any).filepath as string;
    const stat = await fs.stat(tmpPath);
    console.info('[upload] File on disk:', tmpPath, 'bytes:', stat.size);
    console.info('[upload] ethers version:', (ethers as any).version || 'unknown');

    const provider = new ethers.JsonRpcProvider(OG_RPC);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 16601) {
      return res.status(400).json({ success: false, message: `Wrong RPC chainId: ${net.chainId}, expected 16601 (Galileo)` });
    }

    const signer = new ethers.Wallet(PRIV, provider);
    console.info('[upload] server signer:', signer.address);
    const bal = await provider.getBalance(signer.address);
    console.info('[upload] server balance (OG):', ethers.formatEther(bal));

    // Use the documented pattern: 1-arg constructor + upload(file, rpc, signer)
    const indexer = new Indexer(INDEXER);
    const zgFile = await ZgFile.fromFilePath(tmpPath);

    const [tree, tErr] = await zgFile.merkleTree();
    if (tErr) throw tErr;
    const rootHash = tree!.rootHash();
    console.info('[upload] Prepared root:', rootHash);

    const [txHash, uploadErr] = await indexer.upload(zgFile, OG_RPC, signer);
    await zgFile.close();

    if (uploadErr) {
      console.error('[upload] 0G upload failed:', uploadErr);
      return res.status(500).json({
        success: false,
        message: `0G upload failed: ${uploadErr?.shortMessage || uploadErr?.reason || String(uploadErr)}`,
      });
    }

    return res.status(200).json({
      success: true,
      filename: file.originalFilename || 'file',
      size: stat.size,
      rootHash,
      txHash,
      explorer: `https://chainscan-galileo.0g.ai/tx/${txHash}`,
    });
  } catch (err: any) {
    console.error('[upload] Fatal error:', err);
    return res.status(500).json({ success: false, message: err?.shortMessage || err?.reason || err?.message || String(err) });
  }
}


