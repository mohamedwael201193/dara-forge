import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';

export const config = { api: { bodyParser: false } };

const gzip = promisify(zlib.gzip);

// Galileo constants from docs
const GALILEO = {
  chainId: 16601,
  flow: '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628',
};

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
const fmt = (e: any) => e?.shortMessage || e?.reason || e?.message || String(e);

// Query Indexer REST to confirm majority-finalization by root hash
async function confirmFinalized(indexerUrl: string, cid: string, minOk = 2): Promise<{ ok: boolean; nodes: any[] }> {
  const base = indexerUrl.replace(/\/$/, '');
  const paths = [`/files/info?cid=${cid}`, `/file/info/${cid}`];
  for (const path of paths) {
    try {
      const r = await fetch(`${base}${path}`, { headers: { accept: 'application/json' } });
      if (!r.ok) continue;
      const j = await r.json();
      const nodes =
        Array.isArray(j) ? j :
        Array.isArray(j?.data) ? j.data :
        Array.isArray(j?.nodes) ? j.nodes :
        Array.isArray(j?.data?.nodes) ? j.data.nodes : [];
      let okCount = 0;
      for (const n of nodes) {
        if (n?.finalized === true) okCount++;
        else if (n?.uploadedSegNum > 0 && n?.pruned === false) okCount++;
      }
      if (okCount >= Math.min(minOk, nodes.length || minOk)) return { ok: true, nodes };
    } catch { /* try next */ }
  }
  return { ok: false, nodes: [] };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.info('[upload] Request received');

  // Prevent caching of responses
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    // Strict, server-only envs. Do NOT read VITE_* here.
    const OG_RPC = process.env.OG_RPC;                    // e.g., https://16601.rpc.thirdweb.com/
    const INDEXER = process.env.OG_INDEXER;               // e.g., https://indexer-storage-testnet-standard.0g.ai/
    const PRIV = process.env.OG_STORAGE_PRIVATE_KEY;

    console.info('[upload] Env check:', { OG_RPC: OG_RPC ? 'SET' : 'MISSING', INDEXER: INDEXER ? 'SET' : 'MISSING', PRIV: PRIV ? 'SET' : 'MISSING' });
    if (!OG_RPC || !INDEXER || !PRIV) {
      return res.status(500).json({ success: false, message: 'Missing OG_RPC / OG_INDEXER / OG_STORAGE_PRIVATE_KEY' });
    }

    const { files } = await parseForm(req);
    const file = pickFirstFile(files);
    if (!file?.filepath) return res.status(400).json({ success: false, message: 'No file provided' });

    const tmpPath = (file as any).filepath as string;
    const stat = await fs.stat(tmpPath);
    console.info('[upload] File on disk:', tmpPath, 'bytes:', stat.size);
    console.info('[upload] ethers version:', (ethers as any).version || 'unknown');

    // Preflight RPC: must be Galileo and Flow must have bytecode
    const provider = new ethers.JsonRpcProvider(OG_RPC);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== GALILEO.chainId) {
      return res.status(400).json({ success: false, message: `Wrong RPC chainId: ${net.chainId}. Expected ${GALILEO.chainId} (Galileo)` });
    }
    const flowCode = await provider.getCode(GALILEO.flow);
    if (!flowCode || flowCode === '0x') {
      return res.status(400).json({ success: false, message: `No Flow bytecode at ${GALILEO.flow} on this RPC` });
    }

    const signer = new ethers.Wallet(PRIV, provider);
    console.info('[upload] server signer:', signer.address);
    console.info('[upload] server balance (OG):', ethers.formatEther(await provider.getBalance(signer.address)));

    // Gzip preflight to stay under conservative 64-leaf limit for small text files
    const LEAF_BYTES = 256, HARD_LEAF_LIMIT = 64;
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

    const indexer = new Indexer(INDEXER.replace(/\/$/, ''));
    const zgFile = await ZgFile.fromFilePath(pathForUpload);

    const [tree, tErr] = await zgFile.merkleTree();
    if (tErr) throw tErr;
    const rootHash = tree!.rootHash();
    console.info('[upload] Prepared root:', rootHash);

    // Canonical SDK call (TS SDK docs/starter kit pattern)
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

    const msg = fmt(uploadErr);
    console.error('[upload] 0G upload failed:', msg);

    // If a storage node throttled, accept success when majority finalized
    if (/too many data writing/i.test(msg)) {
      const { ok, nodes } = await confirmFinalized(INDEXER, rootHash);
      if (ok) {
        return res.status(200).json({
          success: true,
          filename: file.originalFilename || 'file',
          size: effectiveSize,
          rootHash,
          txHash: txHash || null,
          explorer: txHash ? `https://chainscan-galileo.0g.ai/tx/${txHash}` : null,
          note: 'Upload finalized on enough storage nodes; one node hit a temporary write-limit.',
          nodes,
          contentEncoding: pathForUpload.endsWith('.gz') ? 'gzip' : 'identity',
        });
      }
    }

    // If you ever see "data: ''", it means the RPC or Flow preflight failed; but we already check those above.
    return res.status(500).json({ success: false, message: `0G upload failed: ${msg}` });
  } catch (err: any) {
    console.error('[upload] Fatal error:', err);
    return res.status(500).json({ success: false, message: fmt(err) });
  }
}


