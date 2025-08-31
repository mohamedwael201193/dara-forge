import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ethers } from 'ethers';

export const config = { api: { bodyParser: false } };

const INDEXER = process.env.OG_INDEXER_RPC!;
const EXPLORER = process.env.VITE_OG_EXPLORER ?? 'https://chainscan-galileo.0g.ai';
const PRIV = process.env.OG_STORAGE_PRIVATE_KEY!;
const RPCLIST = (process.env.OG_RPC_LIST || process.env.OG_RPC || 'https://evmrpc-testnet.0g.ai')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Temporary safety cap while the storage network is being upgraded
const MAX_SAFE_BYTES = Number(process.env.OG_MAX_SAFE_BYTES || 1 * 1024 * 1024); // 1 MiB

function isRateLimitLike(e: any) {
  const s = String(e?.message || e);
  return s.includes('429') || s.toLowerCase().includes('rate limit') || s.includes('Too Many Requests');
}
function isInsufficientFunds(e: any) {
  return String(e?.message || e).toLowerCase().includes('insufficient funds');
}
function isTooManyWriting(e: any) {
  const s = String(e?.message || e);
  return s.includes('too many data writing') || s.includes('too many writing');
}

async function pickProvider() {
  const errs: string[] = [];
  for (const url of RPCLIST) {
    try {
      const p = new ethers.JsonRpcProvider(url);
      await p.getBlockNumber();
      return { url, provider: p };
    } catch (e: any) {
      errs.push(`${url}: ${e?.message || e}`);
    }
  }
  throw new Error(`No working RPC. Tried:\n${errs.join('\n')}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!INDEXER || !PRIV) return res.status(500).json({ error: 'Missing OG_INDEXER_RPC / OG_STORAGE_PRIVATE_KEY' });

  try {
    // ---- parse body (multipart or octet-stream) ----
    const ct = String(req.headers['content-type'] || '');
    let buf: Buffer | null = null;

    if (ct.includes('multipart/form-data')) {
      const boundary = ct.split('boundary=')[1];
      if (!boundary) return res.status(400).json({ error: 'Multipart missing boundary. Do not set Content-Type manually.' });
      const chunks: Buffer[] = [];
      for await (const c of (req as any)) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('binary');
      const part = raw.split(`--${boundary}`).find(p => p.includes('name="file"'));
      if (!part) return res.status(400).json({ error: 'No "file" field in multipart form-data.' });
      const idx = part.indexOf('\r\n\r\n');
      if (idx === -1) return res.status(400).json({ error: 'Malformed multipart body.' });
      const binary = Buffer.from(part.slice(idx + 4), 'binary');
      buf = binary.subarray(0, binary.length - 2); // trim CRLF
    } else if (ct.startsWith('application/octet-stream')) {
      const chunks: Buffer[] = [];
      for await (const c of (req as any)) chunks.push(c);
      buf = Buffer.concat(chunks);
    } else {
      return res.status(400).json({
        error: 'Invalid Content-Type. Send multipart/form-data using FormData("file", ...) or application/octet-stream.'
      });
    }

    if (!buf || buf.length === 0) return res.status(400).json({ error: 'Empty file buffer' });

    // Safe mode while 0G storage nodes are under maintenance
    if (buf.length > MAX_SAFE_BYTES) {
      return res.status(413).json({
        ok: false,
        error: `TEMPORARY_LIMIT: File is ${buf.length} bytes; max allowed during network maintenance is ${MAX_SAFE_BYTES} bytes. Try a smaller file for now.`
      });
    }

    // write to /tmp, build ZgFile
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), '0g-'));
    const filePath = path.join(dir, 'upload.bin');
    await fs.writeFile(filePath, buf);

    const { url: chosenRpc, provider } = await pickProvider();
    const signer = new ethers.Wallet(PRIV, provider);
    const indexer = new Indexer(INDEXER);

    const zg = await ZgFile.fromFilePath(filePath);
    const [tree, terr] = await zg.merkleTree();
    if (terr) {
      await zg.close(); await fs.rm(dir, { recursive: true, force: true });
      return res.status(400).json({ ok: false, error: `Failed to build merkle tree: ${String(terr)}` });
    }

    // upload with backoff (handles rate limits and the current “too many data writing”)
    let txHash: string | null = null;
    let lastErr: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [tx, uerr] = await indexer.upload(zg, chosenRpc, signer as any);
        if (uerr) throw uerr;
        txHash = tx.txHash;
        break;
      } catch (e: any) {
        lastErr = e;
        if (isInsufficientFunds(e)) {
          await zg.close(); await fs.rm(dir, { recursive: true, force: true });
          return res.status(402).json({
            ok: false,
            error: 'INSUFFICIENT_FUNDS: Fund OG_STORAGE_PRIVATE_KEY at https://faucet.0g.ai and retry.'
          });
        }
        if (isTooManyWriting(e) || isRateLimitLike(e)) {
          // exponential-ish backoff
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    await zg.close();
    await fs.rm(dir, { recursive: true, force: true });

    if (!txHash) {
      const msg = String(lastErr?.message || lastErr || 'unknown');
      if (isTooManyWriting(lastErr)) {
        return res.status(503).json({
          ok: false,
          error: 'NETWORK_CONCURRENCY_LIMIT: The storage network is currently rejecting batched writes ("too many data writing"). Use a smaller file and retry shortly while nodes are being upgraded.'
        });
      }
      return res.status(500).json({ ok: false, error: `Failed after 3 attempts: ${msg}` });
    }

    const rootHash = tree!.rootHash();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      ok: true,
      rootHash,
      txHash,
      explorer: `${EXPLORER}/tx/${txHash}`
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}


