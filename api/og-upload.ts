import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import Busboy from 'busboy';
import { Readable } from 'node:stream';
const ABI = [
{ anonymous:false, inputs:[
{ indexed:true, internalType:'uint256', name:'logId', type:'uint256' },
{ indexed:true, internalType:'address', name:'creator', type:'address' },
{ indexed:false, internalType:'string', name:'fileId', type:'string' },
{ indexed:false, internalType:'uint256', name:'timestamp', type:'uint256' }
],
name:'LogCreated', type:'event'
},
{ inputs:[{ internalType:'string', name:'_fileId', type:'string' }],
name:'logData', outputs:[], stateMutability:'nonpayable', type:'function'
},
{ inputs:[], name:'logCounter', outputs:[{ internalType:'uint256', name:'', type:'uint256' }], stateMutability:'view', type:'function' }
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
try {
const OG_RPC_URL   = must('OG_RPC_URL');
const OG_INDEXER   = must('OG_INDEXER');
const DARA_CONTRACT= must('DARA_CONTRACT');
const PRIV         = must('OG_STORAGE_PRIVATE_KEY');
// Parse multipart/form-data; expect field name "file"
const { buffer, filename, mimetype } =
  await new Promise<{buffer: Buffer; filename: string; mimetype: string}>((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB demo limit
    let chunks: Buffer[] = [];
    let gotFile = false;
    let fname = 'upload.bin';
    let mtype = 'application/octet-stream';

    bb.on('file', (name, file, info) => {
      if (name !== 'file') return; // ignore other fields
      gotFile = true;
      fname = info.filename || fname;
      mtype = info.mimeType || mtype;
      file.on('data', (d: Buffer) => chunks.push(d));
      file.on('limit', () => reject(new Error('File too large')));
    });
    bb.on('error', reject);
    bb.on('finish', () => {
      if (!gotFile) return reject(new Error('No file provided (expected field name "file")'));
      resolve({ buffer: Buffer.concat(chunks), filename: fname, mimetype: mtype });
    });

    req.pipe(bb);
  });

// 0G signer + indexer
const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
const signer   = new ethers.Wallet(PRIV, provider);
const indexer  = new Indexer(OG_INDEXER);

// Create ZgFile from buffer
const stream  = Readable.from(buffer);
const zgFile  = await ZgFile.fromStream(stream, filename);

// Merkle root
const [tree, treeErr] = await zgFile.merkleTree();
if (treeErr) {
  await zgFile.close().catch(() => {});
  throw new Error(`Merkle tree error: ${treeErr}`);
}
const rootHash = tree!.rootHash();

// Upload to 0G Storage
const [tx, upErr] = await indexer.upload(zgFile, OG_RPC_URL, signer);
await zgFile.close().catch(() => {});
if (upErr) throw new Error(`0G upload error: ${upErr}`);

// Log on-chain
const contract = new ethers.Contract(DARA_CONTRACT, ABI, signer);
const tx2 = await contract.logData(rootHash);
const receipt = await tx2.wait();

return res.status(200).json({
  ok: true,
  filename,
  mimetype,
  rootHash,
  storageTx: tx,
  chainTx: receipt?.hash
});

} catch (err: any) {
console.error('[og-upload] Error:', err);
return res.status(500).json({ ok: false, error: String(err?.message || err) });
}
}


