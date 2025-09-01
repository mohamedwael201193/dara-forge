import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ethers } from 'ethers';
const FLOW_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_merkleRoot",
        "type": "bytes32"
      }
    ],
    "name": "submit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const FLOW_CONTRACT_ADDRESS = '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628';

export const config = { api: { bodyParser: false } };

// ---- envs & helpers ----
const trim = (s?: string) => (s || '').replace(/\/+$/, '');
const PRIV = process.env.OG_STORAGE_PRIVATE_KEY || '';
const CHAIN_ID = Number(process.env.OG_CHAIN_ID || 16601); // Galileo
const RPCLIST = (process.env.OG_RPC_LIST || process.env.OG_RPC || 'https://evmrpc-testnet.0g.ai')
  .split(',').map(s => trim(s)).filter(Boolean);
const INDEXERLIST = (process.env.OG_INDEXER_LIST || process.env.OG_INDEXER_RPC || process.env.OG_INDEXER || '')
  .split(',').map(s => trim(s)).filter(Boolean);
const EXPLORER = trim(process.env.OG_EXPLORER || 'https://chainscan-galileo.0g.ai');

// Temporary small cap while storage network is hot (can raise/remove later)
const MAX_SAFE_BYTES = Number(process.env.OG_MAX_SAFE_BYTES || 1 * 1024 * 1024);

function isRateLimit(e: any) {
  const s = String(e?.message || e).toLowerCase();
  return s.includes('429') || s.includes('rate limit') || s.includes('too many requests');
}
function isInsufficientFunds(e: any) {
  return String(e?.message || e).toLowerCase().includes('insufficient funds');
}
function isTooManyWriting(e: any) {
  const s = String(e?.message || e).toLowerCase();
  return s.includes('too many data writing') || s.includes('too many writing');
}
function isTxRevertedOnUploadingSegments(e: any) {
  const s = String(e?.message || e).toLowerCase();
  return s.includes('transaction reverted') && s.includes('uploading segments');
}

async function pickProvider() {
  const errs: string[] = [];
  for (const url of RPCLIST) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      const net = await provider.getNetwork();
      if (Number(net.chainId) !== CHAIN_ID) {
        throw new Error(`Wrong chainId ${net.chainId} (expected ${CHAIN_ID}).`);
      }
      await provider.getBlockNumber();
      return { url, provider };
    } catch (e: any) {
      errs.push(`${url}: ${e?.message || String(e)}`);
    }
  }
  throw new Error(`No working RPC. Tried:\n${errs.join('\n')}`);
}

async function parseBody(req: VercelRequest): Promise<Buffer> {
  const ct = String(req.headers['content-type'] || '');
  const chunks: Buffer[] = [];
  if (ct.includes('multipart/form-data')) {
    const boundary = ct.split('boundary=')[1];
    if (!boundary) throw new Error('Multipart missing boundary. Do not set Content-Type manually.');
    for await (const c of (req as any)) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('binary');
    const part = raw.split(`--${boundary}`).find(p => p.includes('name="file"'));
    if (!part) throw new Error('No "file" field in multipart form-data.');
    const idx = part.indexOf('\r\n\r\n');
    if (idx === -1) throw new Error('Malformed multipart body.');
    const binary = Buffer.from(part.slice(idx + 4), 'binary');
    return binary.subarray(0, binary.length - 2); // trim trailing CRLF
  }
  if (ct.startsWith('application/octet-stream')) {
    for await (const c of (req as any)) chunks.push(c);
    return Buffer.concat(chunks);
  }
  throw new Error('Invalid Content-Type. Use multipart/form-data or application/octet-stream.');
}

// ---- handler ----
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("Function handler started.");
  if (req.method !== 'POST') {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!PRIV) {
    console.log("Missing OG_STORAGE_PRIVATE_KEY");
    return res.status(500).json({ error: 'Missing OG_STORAGE_PRIVATE_KEY' });
  }
  if (INDEXERLIST.length === 0) {
    console.log("Missing OG_INDEXER_LIST / OG_INDEXER_RPC");
    return res.status(500).json({ error: 'Missing OG_INDEXER_LIST / OG_INDEXER_RPC' });
  }

  try {
    console.log("Parsing request body...");
    const buf = await parseBody(req);
    if (!buf.length) return res.status(400).json({ error: 'Empty file buffer' });

    if (buf.length > MAX_SAFE_BYTES) {
      return res.status(413).json({
        ok: false,
        error: `TEMPORARY_LIMIT: File is ${buf.length} bytes; temporary cap is ${MAX_SAFE_BYTES} bytes during network maintenance.`
      });
    }

    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), '0g-'));
    const filePath = path.join(tmp, 'upload.bin');
    await fs.writeFile(filePath, buf);

    const { url: chosenRpc, provider } = await pickProvider();
    const signer = new ethers.Wallet(PRIV, provider);

    let lastErr: any = null;

    for (const idxUrl of INDEXERLIST) {
      const indexer = new Indexer(idxUrl); // official SDK pattern
      const zg = await ZgFile.fromFilePath(filePath);
      const [tree, terr] = await zg.merkleTree();
      if (terr) {
        await zg.close(); await fs.rm(tmp, { recursive: true, force: true });
        return res.status(400).json({ ok: false, error: `Failed to build merkle tree: ${String(terr)}` });
      }

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const [tx, uerr] = await indexer.upload(zg, chosenRpc, signer as any);
          if (uerr) throw uerr;

          const rootHash = tree!.rootHash();
          if (!rootHash) {
            throw new Error("Root hash is null.");
          }
          console.log("Root Hash (raw) to be submitted to Flow contract:", rootHash);
          console.log("Root Hash (hex) to be submitted to Flow contract:", ethers.hexlify(rootHash));
          console.log("Root Hash (length) to be submitted to Flow contract:", rootHash.length);

          // Anchor on 0G Flow contract
          console.log("Attempting to interact with Flow contract...");
          console.log("Flow Contract Address:", FLOW_CONTRACT_ADDRESS);
          console.log("Signer Address:", signer.address);
          console.log("Flow ABI:", JSON.stringify(FLOW_ABI));
          const flowContract = new ethers.Contract(FLOW_CONTRACT_ADDRESS, FLOW_ABI as any, signer);
          console.log("Calling flowContract.submit with rootHash:", rootHash);
          let flowTx;
          try {
            flowTx = await flowContract.submit(rootHash);
            console.log("Flow contract transaction sent, hash:", flowTx.hash);
            await flowTx.wait();
            console.log("Flow contract transaction confirmed.");
          } catch (flowError: any) {
            console.error("Error interacting with Flow contract:", flowError);
            throw flowError;
          }

          await zg.close();
          await fs.rm(tmp, { recursive: true, force: true });
          res.setHeader("Cache-Control", "no-store");
          console.log("Upload successful, returning response.");
          return res.status(200).json({
            ok: true,
            rootHash,
            txHash: flowTx.hash,
            explorer: `${EXPLORER}/tx/${flowTx.hash}`
          });
        } catch (e: any) {
          lastErr = e;
          if (isInsufficientFunds(e)) {
            await zg.close(); await fs.rm(tmp, { recursive: true, force: true });
            return res.status(402).json({
              ok: false,
              error: 'INSUFFICIENT_FUNDS: Fund OG_STORAGE_PRIVATE_KEY at https://faucet.0g.ai and retry.'
            });
          }
          if (isRateLimit(e) || isTooManyWriting(e) || isTxRevertedOnUploadingSegments(e)) {
            await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
            continue;
          }
          break;
        }
      }

      await zg.close(); // try next indexer
    }

    await fs.rm(tmp, { recursive: true, force: true });
    const msg = String(lastErr?.message || lastErr || 'unknown');

    if (isTooManyWriting(lastErr)) {
      return res.status(503).json({
        ok: false,
        error: 'NETWORK_CONCURRENCY_LIMIT: Storage nodes are rejecting batched writes; try a smaller file or retry shortly.'
      });
    }
    if (isTxRevertedOnUploadingSegments(lastErr)) {
      return res.status(503).json({
        ok: false,
        error: 'TX_REVERTED_ON_UPLOAD: Commit reverted while uploading segments. Retry or switch between Standard/Turbo indexers.'
      });
    }

    return res.status(500).json({ ok: false, error: `Failed after retries: ${msg}` });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}


