import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import Busboy from 'busboy';
import os from 'node:os';
import path from 'node:path';
import { createWriteStream, promises as fs } from 'node:fs';
const ABI = [
{ anonymous:false, inputs:[
{ indexed:true, internalType:'uint256', name:'logId', type:'uint256' },
{ indexed:true, internalType:'address', name:'creator', type:'address' },
{ indexed:false, internalType:'string', name:'fileId', type:'string' },
{ indexed:false, internalType:'uint256', name:'timestamp', type:'uint256' }
], name:'LogCreated', type:'event' },
{ inputs:[{ internalType:'string', name:'_fileId', type:'string' }],
name:'logData', outputs:[], stateMutability:'nonpayable', type:'function' },
{ inputs:[], name:'logCounter', outputs:[{ internalType:'uint256', name:'', type:'uint256' }],
stateMutability:'view', type:'function' }
];
function must(name: string) {
const v = process.env[name];
if (!v) throw new Error(`Missing env ${name}`);
return v;
}
export default async function handler(req: any, res: any) {
if (req.method === 'GET') {
return res.status(200).json({
ok: true,
route: 'og-upload (vercel fn)',
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
// 1) Save incoming file to /tmp and ensure the field name is "file"
await new Promise((resolve, reject) => {
const bb = Busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } });
let gotFile = false;
bb.on('file', (name, file, info) => {
if (name !== 'file') return;
gotFile = true;
filename = info.filename || filename;
mimetype = info.mimeType || mimetype;
const safe = filename.replace(/[^\w.-]/g, '_');
tmpPath = path.join(os.tmpdir(), `${Date.now()}-${safe}`);
const ws = createWriteStream(tmpPath);
file.pipe(ws);
ws.on('finish', resolve);
ws.on('error', reject);
file.on('error', reject);
});
bb.on('error', reject);
bb.on('finish', () => {
if (!tmpPath || !gotFile) reject(new Error('No file provided (expected field name "file")'));
});
req.pipe(bb);
});
// 2) 0G setup
const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
const signer   = new ethers.Wallet(PRIV, provider);
const indexer  = new Indexer(OG_INDEXER);

// 3) Create ZgFile from temp file path (Node-supported API)
const zgFile = await ZgFile.fromFilePath(tmpPath!); // <= this is supported in Node

const [tree, treeErr] = await zgFile.merkleTree();
if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`);
const rootHash = tree!.rootHash();

// 4) Upload to 0G Storage
const [storageTx, upErr] = await indexer.upload(zgFile, OG_RPC_URL, signer);
await zgFile.close().catch(() => {});
if (upErr) throw new Error(`0G upload error: ${upErr}`);

// 5) Log on 0G Chain
const contract = new ethers.Contract(DARA_CONTRACT, ABI, signer);
const chainTx = await contract.logData(rootHash);
const receipt = await chainTx.wait();

// 6) Clean up temp file
if (tmpPath) await fs.unlink(tmpPath).catch(() => {});

return res.status(200).json({
  ok: true,
  filename,
  mimetype,
  rootHash,
  storageTx,
  chainTx: receipt?.hash
});

} catch (err: any) {
if (tmpPath) await fs.unlink(tmpPath).catch(() => {});
console.error('[og-upload] Error:', err);
return res.status(500).json({ ok: false, error: String(err?.message || err) });
}
}

