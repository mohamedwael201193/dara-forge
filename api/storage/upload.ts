import type { VercelRequest, VercelResponse } from '@vercel/node';
import os from 'os';
import fs from 'fs';
import path from 'path';
import Busboy from 'busboy';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';

const FLOW_DEFAULT = '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628';
const INDEXER_FALLBACKS = [
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
      const ws = fs.createWriteStream(tmpPath);
      file.on('data', (d: Buffer) => (size += d.length));
      file.pipe(ws);
      ws.on('close', () => resolve({ filePath: tmpPath, filename, size }));
      ws.on('error', reject);
    });
    bb.on('error', reject);
    req.pipe(bb);
  });
}

const isTransient = (m: string) => /too many data writing|timeout|ECONNRESET|ETIMEDOUT|503|rate/i.test(m);

async function probeIndexer(indexer: string, root: string, timeoutMs = 3000): Promise<boolean> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const u = `${indexer.replace(/\/$/, '')}/file?root=${encodeURIComponent(root)}&name=__probe`;
    const res = await fetch(u, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal: ac.signal,
    });
    return res.status === 206 || res.status === 200;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

async function quickExists(root: string, indexers: string[]) {
  for (const ind of indexers) {
    const exists = await probeIndexer(ind, root);
    if (exists) {
      return { exists: true, indexer: ind };
    }
  }
  return { exists: false, indexer: null as string | null };
}

async function uploadWithBackoff(
  file: ZgFile,
  rpc: string,
  signer: ethers.Wallet,
  indexers: string[]
) {
  let lastErr: unknown = null;
  for (const ind of indexers) {
    const indexer = new Indexer(ind);
    let delay = 1500;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const [tx, err] = await indexer.upload(file, rpc, signer as any);
        if (err) throw err;
        return { tx: String(tx), indexer: ind };
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
      ...INDEXER_FALLBACKS,
    ].filter((v, i, a) => a.indexOf(v) === i);

    const { filePath, filename, size } = await parseMultipart(req);

    const provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(OG_STORAGE_PRIVATE_KEY, provider);
    const bal = await provider.getBalance(signer.address);
    if (bal === 0n) {
      throw new Error('Server wallet has 0 OG. Use the Galileo faucet and retry.');
    }

    const zgFile = await ZgFile.fromFilePath(filePath);
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr || !tree) throw new Error(String(treeErr || 'Failed to generate merkle tree'));
    const root = tree.rootHash();
    if (!root) throw new Error('Failed to generate root hash');

    // Fast path: if the file already exists, don't re-upload or re-anchor.
    const exists = await quickExists(root, indexers);
    if (exists.exists) {
      await zgFile.close();
      fs.unlink(filePath, () => {});
      return res.status(200).json({
        ok: true,
        file: filename,
        size,
        root,
        tx: null,
        indexer: exists.indexer,
        flow: FLOW,
        status: 'exists',
        explorer: process.env.OG_EXPLORER || 'https://chainscan-galileo.0g.ai'
      });
    }

    // Otherwise, upload (SDK handles Flow interaction). May run >60s under load.
    const { tx, indexer } = await uploadWithBackoff(zgFile, RPC, signer, indexers);
    await zgFile.close();
    fs.unlink(filePath, () => {});

    return res.status(200).json({
      ok: true,
      file: filename,
      size,
      root,
      tx,
      indexer,
      flow: FLOW,
      status: 'uploaded',
      explorer: (process.env.OG_EXPLORER || 'https://chainscan-galileo.0g.ai') + `/tx/${tx}`,
    });

  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.shortMessage || err?.message || String(err) });
  }
}

