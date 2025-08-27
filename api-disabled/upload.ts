import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';

export const config = { api: { bodyParser: false } };

const gzip = promisify(zlib.gzip);

// Galileo testnet facts from docs
const GALILEO = {
  chainId: 16601,
  flow: '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628',
};

const LEAF_BYTES = 256;
const HARD_LEAF_LIMIT = 64;

// Optional built-in fallback indexer (you can also provide OG_INDEXER_ALT in Vercel)
const DEFAULT_INDEXER_FALLBACK = 'https://indexer-storage-testnet-turbo.0g.ai/';

function fmt(e: any) {
  return e?.shortMessage || e?.reason || e?.message || String(e);
}

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

async function confirmFinalized(indexerUrl: string, cid: string, minOk = 2) {
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
  return { ok: false, nodes: [] as any[] };
}

async function canonicalUpload(indexerUrl: string, rpc: string, signer: ethers.Wallet, filePath: string) {
  const indexer = new Indexer(indexerUrl.replace(/\/$/, ''));
  const zgFile = await ZgFile.fromFilePath(filePath);
  try {
    const [tree, tErr] = await zgFile.merkleTree();
    if (tErr) throw tErr;
    const rootHash = tree!.rootHash();
    const [txHash, uploadErr] = await indexer.upload(zgFile, rpc, signer);
    return { rootHash, txHash: txHash || null, err: uploadErr || null };
  } finally {
    await zgFile.close();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  console.info('[upload] Request received');

  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    // Server-only envs (do not read VITE_* here)
    const OG_RPC = process.env.OG_RPC; // https://16601.rpc.thirdweb.com/
    const INDEXER = process.env.OG_INDEXER; // https://indexer-storage-testnet-standard.0g.ai/
    const INDEXER_ALT = process.env.OG_INDEXER_ALT || DEFAULT_INDEXER_FALLBACK;
    const PRIV = process.env.OG_STORAGE_PRIVATE_KEY;

    console.info('[upload] Env check:', {
      OG_RPC: OG_RPC ? 'SET' : 'MISSING',
      INDEXER: INDEXER ? 'SET' : 'MISSING',
      PRIV: PRIV ? 'SET' : 'MISSING',
    });
    if (!OG_RPC || !INDEXER || !PRIV) {
      return res.status(500).json({ success: false, message: 'Missing OG_RPC / OG_INDEXER / OG_STORAGE_PRIVATE_KEY' });
    }

    // Parse form and pick file
    const { files } = await parseForm(req);
    const file = pickFirstFile(files);
    if (!file?.filepath) return res.status(400).json({ success: false, message: 'No file provided' });

    const tmpPath = (file as any).filepath as string;
    const stat = await fs.stat(tmpPath);
    console.info('[upload] File on disk:', tmpPath, 'bytes:', stat.size);
    console.info('[upload] ethers version:', (ethers as any).version || 'unknown');

    // RPC preflight: must be Galileo and Flow must have bytecode
    const provider = new ethers.JsonRpcProvider(OG_RPC);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== GALILEO.chainId) {
      return res.status(400).json({ success: false, message: `Wrong RPC chainId: ${net.chainId}. Expected ${GALILEO.chainId} (Galileo)` });
    }
    const code = await provider.getCode(GALILEO.flow);
    if (!code || code === '0x') {
      return res.status(400).json({ success: false, message: `No Flow bytecode at ${GALILEO.flow} on this RPC` });
    }

    const signer = new ethers.Wallet(PRIV, provider);
    console.info('[upload] server signer:', signer.address);
    console.info('[upload] server balance (OG):', ethers.formatEther(await provider.getBalance(signer.address)));

    // Gzip preflight to stay <= 64 leaves for tiny text files
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

    // Try primary indexer
    let { rootHash, txHash, err } = await canonicalUpload(INDEXER, OG_RPC, signer, pathForUpload);

    // If 503/overload or “too many data writing”, try fallback indexer once
    const msg = err ? fmt(err) : '';
    if (err && (/503|Service Unavailable/i.test(msg) || /too many data writing/i.test(msg))) {
      console.warn('[upload] Primary indexer busy; retrying with fallback indexer...');
      ({ rootHash, txHash, err } = await canonicalUpload(INDEXER_ALT, OG_RPC, signer, pathForUpload));
    }

    if (!err) {
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

    // If a node throttled, accept success when majority finalized on any indexer
    if (/too many data writing/i.test(fmt(err))) {
      const primary = await confirmFinalized(INDEXER, rootHash);
      const secondary = INDEXER_ALT && INDEXER_ALT !== INDEXER ? await confirmFinalized(INDEXER_ALT, rootHash) : { ok: false, nodes: [] };
      if (primary.ok || secondary.ok) {
        return res.status(200).json({
          success: true,
          filename: file.originalFilename || 'file',
          size: effectiveSize,
          rootHash,
          txHash: txHash || null,
          explorer: txHash ? `https://chainscan-galileo.0g.ai/tx/${txHash}` : null,
          note: 'Upload finalized on enough storage nodes; one node hit a temporary write-limit.',
          nodes: primary.ok ? primary.nodes : secondary.nodes,
          contentEncoding: pathForUpload.endsWith('.gz') ? 'gzip' : 'identity',
        });
      }
    }

    // Propagate the failure
    return res.status(500).json({ success: false, message: `0G upload failed: ${fmt(err)}` });
  } catch (e: any) {
    console.error('[upload] Fatal error:', e);
    return res.status(500).json({ success: false, message: fmt(e) });
  }
}


