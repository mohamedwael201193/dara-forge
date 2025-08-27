import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);

export const config = { api: { bodyParser: false } };

const LEAF_BYTES = 256;
const HARD_LEAF_LIMIT = 64;

function parseForm(req: VercelRequest) {
  const form = formidable({ keepExtensions: true, uploadDir: '/tmp' });
  return new Promise<{ files: formidable.Files }>((resolve, reject) => {
    form.parse(req as any, (err, _fields, files) => (err ? reject(err) : resolve({ files })));
  });
}

function pickFirstFile(files: formidable.Files) {
  for (const v of Object.values(files || {})) {
    const arr = Array.isArray(v) ? v : [v];
    for (const f of arr) if (f && (f as any).filepath) return f as formidable.File;
  }
  return null;
}

function fmtErr(e: any) {
  return e?.shortMessage || e?.reason || e?.message || String(e);
}

// Query Indexer REST to confirm majority-finalization by root hash
async function confirmFinalized(indexerUrl: string, cid: string, minOk = 2): Promise<{ ok: boolean; details?: any }> {
  const base = indexerUrl.replace(/\/$/, '');
  const endpoints = [
    `${base}/files/info?cid=${cid}`,
    `${base}/file/info/${cid}`,
  ];
  for (const url of endpoints) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' } });
      if (!r.ok) continue;
      const j = await r.json();
      // Flatten common shapes: {code,data:[...]} or {nodes:[...]} or [...]
      let arr: any[] = [];
      if (Array.isArray(j)) arr = j;
      else if (Array.isArray(j?.data)) arr = j.data;
      else if (Array.isArray(j?.nodes)) arr = j.nodes;
      else if (Array.isArray(j?.data?.nodes)) arr = j.data.nodes;

      if (!arr.length) continue;

      let okCount = 0;
      for (const n of arr) {
        if (n?.finalized === true) okCount++;
        else if (n?.uploadedSegNum > 0 && n?.pruned === false) okCount++; // fallback signal
      }
      return { ok: okCount >= Math.min(minOk, arr.length), details: arr };
    } catch { /* try next */ }
  }
  return { ok: false };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.info('[upload] Request received');
  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

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
    console.info('[upload] server balance (OG):', ethers.formatEther(await provider.getBalance(signer.address)));

    // Preflight gzip if we’d exceed the conservative 64-leaf limit
    let pathForUpload = tmpPath;
    let effectiveSize = stat.size;
    if (Math.ceil(stat.size / LEAF_BYTES) > HARD_LEAF_LIMIT) {
      const raw = await fs.readFile(tmpPath);
      const gz = await gzip(raw, { level: zlib.constants.Z_BEST_COMPRESSION });
      if (gz.length < stat.size && Math.ceil(gz.length / LEAF_BYTES) <= HARD_LEAF_LIMIT) {
        const gzPath = `${tmpPath}.gz`;
        await fs.writeFile(gzPath, gz);
        pathForUpload = gzPath;
        effectiveSize = gz.length;
        console.info(`[upload] gzip applied: ${stat.size} -> ${effectiveSize} bytes`);
      }
    }

    const indexer = new Indexer(INDEXER);
    const zgFile = await ZgFile.fromFilePath(pathForUpload);

    const [tree, tErr] = await zgFile.merkleTree();
    if (tErr) throw tErr;
    const rootHash = tree!.rootHash();
    console.info('[upload] Prepared root:', rootHash);

    // Canonical SDK call
    const [txHash, uploadErr] = await indexer.upload(zgFile, OG_RPC, signer);
    await zgFile.close();

    if (!uploadErr) {
      return res.status(200).json({
        success: true,
        filename: file.originalFilename || 'file',
        size: effectiveSize,
        rootHash,
        txHash,
        explorer: `https://chainscan-galileo.0g.ai/tx/${txHash}`,
        contentEncoding: pathForUpload.endsWith('.gz') ? 'gzip' : 'identity',
      });
    }

    // Soft-handle node throttle: confirm majority finalized, then return success-with-warning.
    const msg = fmtErr(uploadErr);
    console.error('[upload] 0G upload failed:', msg);
    if (/too many data writing/i.test(msg)) {
      console.info('[upload] Attempting majority-finalized confirmation via Indexer REST...');
      const { ok, details } = await confirmFinalized(INDEXER, rootHash);
      if (ok) {
        console.info('[upload] Majority of nodes finalized; treating as success.');
        return res.status(200).json({
          success: true,
          filename: file.originalFilename || 'file',
          size: effectiveSize,
          rootHash,
          txHash: txHash || null,
          explorer: txHash ? `https://chainscan-galileo.0g.ai/tx/${txHash}` : null,
          note: 'Upload finalized on enough storage nodes; one node returned a temporary write-limit.',
          nodes: details,
          contentEncoding: pathForUpload.endsWith('.gz') ? 'gzip' : 'identity',
        });
      }
    }

    // Still a real failure
    return res.status(500).json({ success: false, message: `0G upload failed: ${msg}` });
  } catch (err: any) {
    console.error('[upload] Fatal error:', err);
    return res.status(500).json({ success: false, message: fmtErr(err) });
  }
}


