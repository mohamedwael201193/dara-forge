import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);

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

    // Gzip compression logic
    let pathForUpload = tmpPath;
    let effectiveSize = stat.size;
    const LEAF_BYTES = 256;
    const hardLeafLimit = 64;

    // Only gzip if we’d exceed 64 leaves on conservative math
    if (Math.ceil(stat.size / LEAF_BYTES) > hardLeafLimit) {
      const raw = await fs.readFile(tmpPath);
      const gz = await gzip(raw, { level: zlib.constants.Z_BEST_COMPRESSION });
      // If compression helps, use it; otherwise fall back to original
      if (gz.length < stat.size && Math.ceil(gz.length / LEAF_BYTES) <= hardLeafLimit) {
        const gzPath = `${tmpPath}.gz`;
        await fs.writeFile(gzPath, gz);
        pathForUpload = gzPath;
        effectiveSize = gz.length;
        console.info(`[upload] gzip applied: ${stat.size} -> ${effectiveSize} bytes`);
      } else {
        console.info(`[upload] gzip skipped (no benefit): would be ${gz.length} bytes`);
      }
    }

    // Use the documented pattern: 1-arg constructor + upload(file, rpc, signer)
    const indexer = new Indexer(INDEXER);
    const zgFile = await ZgFile.fromFilePath(pathForUpload);

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
      size: effectiveSize,
      rootHash,
      txHash,
      explorer: `https://chainscan-galileo.0g.ai/tx/${txHash}`,
      contentEncoding: pathForUpload.endsWith('.gz') ? 'gzip' : 'identity',
    });
  } catch (err: any) {
    console.error('[upload] Fatal error:', err);
    return res.status(500).json({ success: false, message: err?.shortMessage || err?.reason || err?.message || String(err) });
  }
}


