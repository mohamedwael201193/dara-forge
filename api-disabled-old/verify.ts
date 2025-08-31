import { ZgFile } from '@0glabs/0g-ts-sdk';
import Busboy from 'busboy';
import os from 'node:os';
import path from 'node:path';
import { createWriteStream, promises as fs } from 'node:fs';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  let tmpFiles: string[] = [];
  let expectedRootHash: string = '';
  let uploadedFile: string | null = null;

  try {
    // Parse multipart form data
    await new Promise<void>((resolve, reject) => {
      const bb = Busboy({ headers: req.headers });
      
      bb.on('field', (name, value) => {
        if (name === 'expectedRootHash') {
          expectedRootHash = value;
        }
      });
      
      bb.on('file', (name, file, info) => {
        if (name !== 'file') {
          file.resume();
          return;
        }
        
        const filename = info.filename || 'uploaded-file';
        const safe = filename.replace(/[^\w.\-]/g, '_');
        const tmpPath = path.join(os.tmpdir(), `verify-${Date.now()}-${safe}`);
        tmpFiles.push(tmpPath);
        
        const ws = createWriteStream(tmpPath);
        file.pipe(ws);
        
        ws.on('finish', () => {
          uploadedFile = tmpPath;
          resolve();
        });
        
        ws.on('error', reject);
        file.on('error', reject);
      });
      
      bb.on('error', reject);
      bb.on('finish', () => {
        if (!uploadedFile) {
          reject(new Error('No file uploaded'));
        }
      });
      
      req.pipe(bb);
    });

    if (!expectedRootHash) {
      throw new Error('expectedRootHash is required');
    }

    if (!uploadedFile) {
      throw new Error('No file uploaded for verification');
    }

    console.log('Verifying file against expected hash:', expectedRootHash);
    
    // Create ZgFile and compute Merkle tree
    const zgFile = await ZgFile.fromFilePath(uploadedFile);
    const [tree, treeErr] = await zgFile.merkleTree();
    
    if (treeErr !== null) {
      await zgFile.close();
      throw new Error(`Error generating Merkle tree: ${treeErr}`);
    }

    const actualRootHash = tree!.rootHash();
    await zgFile.close();
    
    // Clean up temporary files
    for (const tmpFile of tmpFiles) {
      await fs.unlink(tmpFile).catch(() => {});
    }
    
    const verified = actualRootHash === expectedRootHash;
    
    return res.status(200).json({
      ok: true,
      verified,
      expectedRootHash,
      actualRootHash,
      message: verified ? 'File integrity verified successfully' : 'File integrity verification failed'
    });

  } catch (err: any) {
    // Clean up temporary files on error
    for (const tmpFile of tmpFiles) {
      await fs.unlink(tmpFile).catch(() => {});
    }
    
    console.error('[verify] Error:', err);
    
    return res.status(500).json({ 
      ok: false, 
      error: String(err?.message || err),
      timestamp: new Date().toISOString()
    });
  }
}

