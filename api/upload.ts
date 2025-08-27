import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

// Vercel + Vite: this is fine to leave here (Next-specific config is ignored, harmless)
export const config = { api: { bodyParser: false } };

function parseForm(req: VercelRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      multiples: false,
      // sanitize filenames
      filename: (name, ext, part) => `${Date.now()}-${(part.originalFilename || 'upload').replace(/[^\w.\-]+/g, '_')}`,
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

// Normalize across 'file', 'files', 'file[]', etc.
function pickFirstFile(fsObj: formidable.Files): FormidableFile | null {
  for (const v of Object.values(fsObj)) {
    const arr = Array.isArray(v) ? v : [v];
    for (const f of arr) {
      if (f && (f as any).filepath) return f as any;
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    console.log('[upload] Request received');

    const OG_RPC = (process.env.OG_RPC_URL || process.env.VITE_OG_RPC || 'https://evmrpc-testnet.0g.ai/').replace(/\/+$/, '/');
    const INDEXER = (process.env.OG_INDEXER || process.env.OG_INDEXER_RPC || process.env.VITE_OG_INDEXER || 'https://indexer-storage-testnet-turbo.0g.ai').replace(/\/+$/, '');
    const PRIV = process.env.OG_STORAGE_PRIVATE_KEY;

    console.log('[upload] Env check:', { OG_RPC: OG_RPC ? 'SET' : 'MISSING', INDEXER: INDEXER ? 'SET' : 'MISSING', PRIV: PRIV ? 'SET' : 'MISSING' });
    if (!PRIV) return res.status(500).json({ success: false, message: 'Missing OG_STORAGE_PRIVATE_KEY' });

    // Parse multipart with Formidable (waits until file fully written)
    const { fields, files } = await parseForm(req);
    const fileKeys = Object.keys(files || {});
    console.log('[upload] files keys:', fileKeys);

    const fileField = pickFirstFile(files);

    if (!fileField) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
        receivedKeys: fileKeys,
      });
    }

    const filepath = fileField.filepath;
    const stat = await fs.stat(filepath).catch(() => null);
    if (!stat || stat.size === 0) {
      return res.status(500).json({ success: false, message: 'Failed to persist file' });
    }
    console.log('[upload] File on disk:', filepath, 'bytes:', stat.size);

    // Build metadata if provided
    let metadata: any = {};
    if (fields.metadata && typeof fields.metadata === 'string') {
      try { metadata = JSON.parse(fields.metadata); } catch {}
    }

    // 0G SDK usage
    const provider = new ethers.JsonRpcProvider(OG_RPC);
    const signer = new ethers.Wallet(PRIV.startsWith('0x') ? PRIV : `0x${PRIV}`, provider);

    // 1) Confirm chain
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 16601) {
      console.error('[upload] Wrong chain:', net.chainId);
      return res.status(400).json({
        success: false,
        message: `Wrong EVM RPC: expected 16601 (Galileo), got ${net.chainId}. Set OG_RPC to https://evmrpc-testnet.0g.ai or https://16601.rpc.thirdweb.com.`,
      });
    }

    // 2) Log server wallet
    console.log('[upload] server signer:', signer.address);

    // 3) Show balance and soft-guard
    const bal = await provider.getBalance(signer.address);
    console.log('[upload] server balance (OG):', ethers.formatEther(bal));
    if (bal < ethers.parseEther('0.005')) {
      return res.status(402).json({
        success: false,
        message: `Server wallet (${signer.address}) has low OG balance (${ethers.formatEther(bal)}). Use the faucet, then retry.`,
      });
    }

    const indexer = new Indexer(INDEXER); // IMPORTANT: use Indexer instance, not "uploader"
    const zgFile = await ZgFile.fromFilePath(filepath);

    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr) {
      await zgFile.close();
      await fs.unlink(filepath).catch(() => {});
      return res.status(500).json({ success: false, message: `Merkle error: ${treeErr}` });
    }

    const rootHash = tree?.rootHash();
    if (!rootHash) {
      await zgFile.close();
      await fs.unlink(filepath).catch(() => {});
      return res.status(500).json({ success: false, message: 'No root hash produced' });
    }

    const [txHash, uploadErr] = await indexer.upload(zgFile, OG_RPC, signer);
    await zgFile.close();
    await fs.unlink(filepath).catch(() => {});

    if (uploadErr) {
      return res.status(500).json({ success: false, message: `0G upload failed: ${uploadErr}` });
    }

    return res.status(200).json({
      success: true,
      rootHash,
      txHash,
      filename: (fileField.originalFilename || 'file'),
      size: stat.size,
      metadata,
      timestamp: new Date().toISOString(),
      handler: 'vercel-function',
    });
  } catch (e: any) {
    console.error('[upload] error:', e);
    return res.status(500).json({ success: false, message: e?.message || 'Upload failed' });
  }
}


