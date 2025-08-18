import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import Busboy from 'busboy';
import os from 'node:os';
import path from 'node:path';
import { createWriteStream, promises as fs } from 'node:fs';

const ABI = [
{ anonymous:false, inputs:[
{ indexed:true,  internalType:'uint256', name:'logId', type:'uint256' },
{ indexed:true,  internalType:'address', name:'creator', type:'address' },
{ indexed:false, internalType:'string',  name:'fileId', type:'string' },
{ indexed:false, internalType:'uint256', name:'timestamp', type:'uint256' }
], name:'LogCreated', type:'event' },
{ inputs:[{ internalType:'string', name:'_fileId', type:'string' }], name:'logData', outputs:[], stateMutability:'nonpayable', type:'function' },
{ inputs:[], name:'logCounter', outputs:[{ internalType:'uint256', name:'', type:'uint256' }], stateMutability:'view', type:'function' }
];

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

async function gatewayHasFile(indexerBase: string, root: string) {
  const base = indexerBase.replace(/\/$/, ");
  const url  = `${base}/file?root=${encodeURIComponent(root)}`;
  try {
    const resp = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
    return resp.ok || resp.status === 206;
  } catch {
    return false;
  }
}

async function waitForGateway(indexerBase: string, root: string, budgetMs = 60000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < budgetMs) {
    if (await gatewayHasFile(indexerBase, root)) return true;
    await sleep(intervalMs);
  }
  return false;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      route: 'og-upload',
      hasPK: !!process.env.OG_STORAGE_PRIVATE_KEY,
      rpc: process.env.OG_RPC_URL,
      indexer: process.env.OG_INDEXER
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const OG_RPC_URL    = must('OG_RPC_URL');
  const OG_INDEXER    = must('OG_INDEXER');
  const DARA_CONTRACT = must('DARA_CONTRACT');
  const PRIV          = must('OG_STORAGE_PRIVATE_KEY');

  let tmpPath: string | null = null;
  let filename = 'upload.bin';
  let mimetype = 'application/octet-stream';

  try {
    // 1) Save upload to /tmp (expects field name "file")
    await new Promise<void>((resolve, reject) => {
      const bb = Busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } });
      let gotFile = false;
      bb.on('file', (name, file, info) => {
        if (name !== 'file') return;
        gotFile  = true;
        filename = info.filename || filename;
        mimetype = info.mimeType || mimetype;
        const safe = filename.replace(/[^\w.\-]/g, '_');
        tmpPath = path.join(os.tmpdir(), `${Date.now()}-${safe}`);
        const ws = createWriteStream(tmpPath);
        file.pipe(ws);
        ws.on('finish', resolve);
        ws.on('error', reject);
        file.on('error', reject);
      });
      bb.on('error', reject);
      bb.on('finish', () => { if (!tmpPath || !gotFile) reject(new Error('No file provided (expected field name "file")')); });
      req.pipe(bb);
    });

    // 2) Setup
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const signer   = new ethers.Wallet(PRIV, provider);
    const indexer  = new Indexer(OG_INDEXER);

    // 3) Build ZgFile and root
    const zgFile = await ZgFile.fromFilePath(tmpPath!); // <= this is supported in Node
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`);
    const rootHash = tree!.rootHash();
    const downloadUrl = `${OG_INDEXER.replace(/\/$/, '')}/file?root=${rootHash}`;

    // 4) Skip upload if already present, otherwise upload
    let alreadyStored = await gatewayHasFile(OG_INDEXER, rootHash);
    let storageTx: any = null;

    if (!alreadyStored) {
      const TIME_BUDGET_MS = 120_000; // you set maxDuration=180, keep margin
      const uploadPromise = (async () => {
        const [tx, upErr] = await indexer.upload(zgFile, OG_RPC_URL, signer);
        if (upErr) {
          const msg = String(upErr?.message || upErr);
          if (/already exists/i.test(msg) || /exists on node/i.test(msg)) {
            alreadyStored = true;
            return null;
          }
          throw new Error(`0G upload error: ${msg}`);
        }
        return tx;
      })();

      const result = await Promise.race([uploadPromise, sleep(TIME_BUDGET_MS).then(() => 'TIMEOUT')]);
      if (result === 'TIMEOUT') {
        // As a fallback, check gateway; if available, treat as stored
        alreadyStored = await gatewayHasFile(OG_INDEXER, rootHash);
        if (!alreadyStored) throw new Error('0G upload taking too long; please retry.');
      } else {
        storageTx = result;
      }
    }

    await zgFile.close().catch(() => {});
    if (tmpPath) await fs.unlink(tmpPath).catch(() => {});

    // 4) Ensure it’s visible on the gateway (best effort)
    const gatewayReady = await waitForGateway(OG_INDEXER, rootHash, 120000, 2000);

    // 5) Log on-chain regardless (idempotent provenance)
    const contract = new ethers.Contract(DARA_CONTRACT, ABI, signer);
    const chainTx  = await contract.logData(rootHash);
    const receipt  = await chainTx.wait();

    return res.status(200).json({
      ok: true,
      filename,
      mimetype,
      rootHash,
      alreadyStored,
      storageTx,
      chainTx: receipt?.hash,
      txHash: receipt?.hash,            // <— alias for your UI’s datasetTx/manifestTx
      downloadUrl,                      // <INDEXER>/file?root=<root>
      gatewayReady                      // tell the client if it’s immediately fetchable
    });

  } catch (err: any) {
    if (tmpPath) await fs.unlink(tmpPath).catch(() => {});
    console.error('[og-upload] Error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}


