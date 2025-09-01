// api/storage/upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import os from 'os';
import fs from 'fs';
import path from 'path';
import Busboy from 'busboy';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';

// Galileo Flow (docs) and default endpoints
const FLOW_DEFAULT = '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628';
const INDEXER_DEFAULTS = [
  'https://indexer-storage-testnet-turbo.0g.ai',
  'https://indexer-storage-testnet-standard.0g.ai',
];

function parseMultipart(req: VercelRequest): Promise<{ filePath: string; filename: string; size: number }> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    let tmpPath = '';
    let filename = '';
    let size = 0;
    bb.on('file', (_name, file, info) => {
      filename = info.filename || `upload_${Date.now()}`;
      tmpPath = path.join(os.tmpdir(), `${Date.now()}_${filename}`);
      const writeStream = fs.createWriteStream(tmpPath);
      file.on('data', (d: Buffer) => (size += d.length));
      file.pipe(writeStream);
      writeStream.on('close', () => resolve({ filePath: tmpPath, filename, size }));
      writeStream.on('error', reject);
    });
    bb.on('error', reject);
    req.pipe(bb);
  });
}

const isTransient = (msg: string) =>
  /too many data writing|timeout|ECONNRESET|ETIMEDOUT|503|rate/i.test(msg);

async function uploadViaIndexer(
  zgFile: ZgFile,
  rpc: string,
  signer: ethers.Wallet,
  indexers: string[]
): Promise<{ tx: string; root: string; usedIndexer: string }> {
  const [tree, treeErr] = await zgFile.merkleTree();
  if (treeErr || !tree) throw new Error(`Merkle tree error: ${String(treeErr)}`);
  const root = tree.rootHash();
  if (!root) throw new Error('Failed to generate root hash');

  let lastErr: unknown = null;

  for (const ind of indexers) {
    const indexer = new Indexer(ind);

    // up to 5 attempts with exponential backoff if the node is overloaded
    let delay = 1500;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const [tx, err] = await indexer.upload(zgFile, rpc, signer as any); // single source of truth
        if (err) throw err;
        return { tx: String(tx), root, usedIndexer: ind };
      } catch (e: any) {
        const msg = e?.message || String(e);
        if (isTransient(msg) && attempt < 5) {
          await new Promise(r => setTimeout(r, delay + Math.floor(Math.random() * 400)));
          delay *= 2;
          continue;
        }
        lastErr = e;
        break; // try next indexer
      }
    }
  }
  throw new Error(`All indexers failed. Last error: ${String(lastErr)}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const OG_STORAGE_PRIVATE_KEY = process.env.OG_STORAGE_PRIVATE_KEY;
    if (!OG_STORAGE_PRIVATE_KEY) {
      return res.status(500).json({ ok: false, error: 'Missing OG_STORAGE_PRIVATE_KEY' });
    }

    const RPC = process.env.OG_RPC || 'https://evmrpc-testnet.0g.ai/';
    const FLOW = process.env.OG_FLOW_CONTRACT || FLOW_DEFAULT;

    const fromEnv =
      process.env.OG_INDEXER_LIST ||
      process.env.OG_INDEXER ||
      process.env.OG_INDEXER_RPC ||
      '';
    const indexers = [
      ...fromEnv.split(',').map(s => s.trim()).filter(Boolean),
      ...INDEXER_DEFAULTS,
    ].filter((v, i, a) => a.indexOf(v) === i);

    const { filePath, filename, size } = await parseMultipart(req);

    // provider + signer (use EIP-1559 fees if available)
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(OG_STORAGE_PRIVATE_KEY, provider);
    const bal = await provider.getBalance(wallet.address);
    if (bal === 0n) {
      throw new Error('Server wallet has 0 OG. Fund it via the faucet and retry.');
    }

    const zgFile = await ZgFile.fromFilePath(filePath);

    // Important: Do NOT call Flow.submit yourself. indexer.upload handles that.
    const { tx, root, usedIndexer } = await uploadViaIndexer(zgFile, RPC, wallet, indexers);

    await zgFile.close();
    fs.unlink(filePath, () => {});

    return res.status(200).json({
      ok: true,
      file: filename,
      size,
      root,
      tx,
      indexer: usedIndexer,
      flow: FLOW,
      explorer: (process.env.OG_EXPLORER || 'https://chainscan-galileo.0g.ai') + `/tx/${tx}`,
    });
  } catch (err: any) {
    const msg = err?.shortMessage || err?.message || String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
}

// For Node-style Vercel functions: silence "typeless package.json" perf warning by using ESM.
// Add: { "type": "module" } in package.json

