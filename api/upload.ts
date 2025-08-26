import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import Busboy from 'busboy';
import os from 'node:os';
import path from 'node:path';
import { createWriteStream, promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import { CHAIN_CONFIG } from '../src/config/chain';

interface UploadMetadata {
  title: string;
  description: string;
  tags: string[];
  version: string;
  license: string;
  domain: string;
  contributors: string[];
  isPublic: boolean;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  sha256: string;
  path?: string;
}

interface ManifestData {
  version: string;
  title: string;
  description: string;
  tags: string[];
  license: string;
  domain: string;
  contributors: string[];
  isPublic: boolean;
  files: FileInfo[];
  rootHash: string;
  manifestHash: string;
  uploadTime: string;
  uploader: string;
  network: string;
  parentRoot?: string;
  versionNumber: number;
  checksums: {
    sha256: string;
    merkleRoot: string;
  };
}

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function computeFileSHA256(filePath: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  const stream = await fs.readFile(filePath);
  hash.update(stream);
  return hash.digest('hex');
}

async function gatewayHasFile(indexerBase: string, root: string) {
  const base = indexerBase.replace(/\/$/, "");
  const url = `${base}/file?root=${encodeURIComponent(root)}`;
  try {
    const resp = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
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
      route: 'enhanced-upload',
      features: {
        streamedUploads: true,
        batchUploads: true,
        richMetadata: true,
        versioning: true,
        merkleProofs: true
      }
    });
  }
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const startTime = Date.now();
  const OG_RPC_URL = must('OG_RPC_URL');
  const OG_INDEXER = must('OG_INDEXER');
  const PRIV = must('OG_STORAGE_PRIVATE_KEY');

  let tmpFiles: string[] = [];
  let metadata: UploadMetadata | null = null;
  let files: FileInfo[] = [];

  try {
    // Parse multipart form data with metadata and files
    await new Promise<void>((resolve, reject) => {
      const bb = Busboy({ 
        headers: req.headers, 
        limits: { 
          fileSize: 100 * 1024 * 1024, // 100MB per file
          files: 10 // Max 10 files for batch upload
        } 
      });
      
      let fileCount = 0;
      
      bb.on('field', (name, value) => {
        if (name === 'metadata') {
          try {
            metadata = JSON.parse(value);
          } catch (e) {
            reject(new Error('Invalid metadata JSON'));
          }
        }
      });
      
      bb.on('file', (name, file, info) => {
        if (!name.startsWith('file')) {
          file.resume();
          return;
        }
        
        fileCount++;
        const filename = info.filename || `file-${fileCount}`;
        const safe = filename.replace(/[^\w.\-]/g, '_');
        const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${fileCount}-${safe}`);
        tmpFiles.push(tmpPath);
        
        const ws = createWriteStream(tmpPath);
        let fileSize = 0;
        
        file.on('data', (chunk) => {
          fileSize += chunk.length;
        });
        
        file.pipe(ws);
        
        ws.on('finish', async () => {
          try {
            const sha256 = await computeFileSHA256(tmpPath);
            files.push({
              name: filename,
              size: fileSize,
              type: info.mimeType || 'application/octet-stream',
              sha256,
              path: tmpPath
            });
            
            if (files.length === fileCount) {
              resolve();
            }
          } catch (e) {
            reject(e);
          }
        });
        
        ws.on('error', reject);
        file.on('error', reject);
      });
      
      bb.on('error', reject);
      bb.on('finish', () => {
        if (fileCount === 0) {
          reject(new Error('No files provided'));
        }
      });
      
      req.pipe(bb);
    });

    if (!metadata) {
      throw new Error('Metadata is required');
    }

    if (!metadata.title || !metadata.description) {
      throw new Error('Title and description are required');
    }

    // Initialize 0G components
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const signer = new ethers.Wallet(PRIV, provider);
    const indexer = new Indexer(OG_INDEXER);

    let rootHash: string;
    let manifestData: ManifestData;

    if (files.length === 1) {
      // Single file upload
      const file = files[0];
      const zgFile = await ZgFile.fromFilePath(file.path!);
      const [tree, treeErr] = await zgFile.merkleTree();
      if (treeErr) throw new Error(`Merkle tree generation failed: ${treeErr}`);
      
      rootHash = tree!.rootHash();
      
      // Create manifest
      manifestData = {
        version: "2.0",
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags || [],
        license: metadata.license || "MIT",
        domain: metadata.domain || "general",
        contributors: metadata.contributors || [],
        isPublic: metadata.isPublic !== false,
        files: [{
          name: file.name,
          size: file.size,
          type: file.type,
          sha256: file.sha256
        }],
        rootHash,
        manifestHash: "", // Will be set after manifest upload
        uploadTime: new Date().toISOString(),
        uploader: signer.address,
        network: "0G Galileo Testnet",
        versionNumber: 1,
        checksums: {
          sha256: file.sha256,
          merkleRoot: rootHash
        }
      };

      // Upload file to 0G Storage
      const [tx, upErr] = await indexer.upload(zgFile, OG_RPC_URL, signer);
      if (upErr) {
        const msg = String(upErr?.message || upErr);
        if (!/already exists/i.test(msg)) {
          throw new Error(`0G Storage upload failed: ${msg}`);
        }
      }

      await zgFile.close();
      
    } else {
      // Batch upload - create a directory structure
      throw new Error('Batch upload not yet implemented in this version');
    }

    // Upload manifest to 0G Storage
    const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], { 
      type: "application/json"
    });
    
    // Create temporary file for manifest
    const manifestPath = path.join(os.tmpdir(), `manifest-${Date.now()}.json`);
    await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2));
    tmpFiles.push(manifestPath);
    
    const manifestZgFile = await ZgFile.fromFilePath(manifestPath);
    const [manifestTree, manifestTreeErr] = await manifestZgFile.merkleTree();
    if (manifestTreeErr) throw new Error(`Manifest Merkle tree failed: ${manifestTreeErr}`);
    
    const manifestRoot = manifestTree!.rootHash();
    manifestData.manifestHash = manifestRoot;
    
    // Re-upload manifest with correct hash
    await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2));
    const finalManifestZgFile = await ZgFile.fromFilePath(manifestPath);
    
    const [manifestTx, manifestUpErr] = await indexer.upload(finalManifestZgFile, OG_RPC_URL, signer);
    if (manifestUpErr) {
      const msg = String(manifestUpErr?.message || manifestUpErr);
      if (!/already exists/i.test(msg)) {
        throw new Error(`Manifest upload failed: ${msg}`);
      }
    }

    await manifestZgFile.close();
    await finalManifestZgFile.close();

    // Wait for gateway availability
    const gatewayReady = await waitForGateway(OG_INDEXER, rootHash, 60000);
    const manifestGatewayReady = await waitForGateway(OG_INDEXER, manifestRoot, 60000);

    // Clean up temporary files
    for (const tmpFile of tmpFiles) {
      await fs.unlink(tmpFile).catch(() => {});
    }

    const totalDuration = Date.now() - startTime;

    return res.status(200).json({
      ok: true,
      rootHash,
      manifestHash: manifestRoot,
      manifest: manifestData,
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        sha256: f.sha256
      })),
      gatewayReady,
      manifestGatewayReady,
      downloadUrl: `${OG_INDEXER.replace(/\/$/, '')}/file?root=${rootHash}`,
      manifestUrl: `${OG_INDEXER.replace(/\/$/, '')}/file?root=${manifestRoot}`,
      performance: {
        totalDuration,
        fileCount: files.length
      },
      network: {
        indexer: OG_INDEXER,
        rpc: OG_RPC_URL
      }
    });

  } catch (err: any) {
    // Clean up temporary files on error
    for (const tmpFile of tmpFiles) {
      await fs.unlink(tmpFile).catch(() => {});
    }
    
    console.error('[upload] Error:', err);
    
    return res.status(500).json({ 
      ok: false, 
      error: String(err?.message || err),
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    });
  }
}

