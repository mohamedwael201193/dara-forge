import { Uploader, ZgFile } from '@0glabs/0g-ts-sdk';
import Busboy from 'busboy';
import os from 'node:os';
import path from 'node:path';
import { createWriteStream, promises as fs } from 'node:fs';

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, as we're using busboy
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  console.log('[upload] Request received');
  const startTime = Date.now();
  const OG_RPC_URL = must('OG_RPC_URL');
  const PRIV = must('OG_STORAGE_PRIVATE_KEY');

  let tmpFiles: string[] = [];
  let fileMetadata: any = {};
  let uploadedFile: string | null = null;

  try {
    // Parse multipart form data
    await new Promise<void>((resolve, reject) => {
      console.log('[upload] Initializing Busboy');
      const busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: 100 * 1024 * 1024, // 100MB per file
          files: 10 // Max 10 files for batch upload
        }
      });

      let fileCount = 0;

      busboy.on('field', (name, value) => {
        console.log(`[upload] Busboy field: ${name} = ${value}`);
        if (name === 'metadata') {
          try {
            fileMetadata = JSON.parse(value);
            console.log('[upload] Parsed metadata:', fileMetadata);
          } catch (e) {
            console.error('[upload] Invalid metadata JSON:', e);
            reject(new Error('Invalid metadata JSON'));
          }
        }
      });

      busboy.on('file', (name, file, info) => {
        console.log(`[upload] Busboy file: ${name}, filename: ${info.filename}, mimetype: ${info.mimeType}`);
        if (name !== 'file') { // This is the crucial fix: ensure we only process the 'file' field
          console.log(`[upload] Skipping non-file field: ${name}`);
          file.resume();
          return;
        }

        fileCount++;
        const filename = info.filename || `uploaded-file-${fileCount}`;
        const safe = filename.replace(/[^\w.\-]/g, '_');
        const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}-${safe}`);
        tmpFiles.push(tmpPath);

        console.log(`[upload] Writing file to: ${tmpPath}`);
        const writeStream = createWriteStream(tmpPath);
        file.pipe(writeStream);

        writeStream.on('finish', () => {
          console.log(`[upload] File write finished for: ${tmpPath}`);
          uploadedFile = tmpPath;
          // Resolve here only if we expect a single file upload to complete the promise
          // If multiple files are expected, resolve in busboy.on('finish')
          resolve(); 
        });

        writeStream.on('error', (err) => {
          console.error(`[upload] Write stream error for ${tmpPath}:`, err);
          reject(err);
        });
        file.on('error', (err) => {
          console.error(`[upload] File stream error for ${tmpPath}:`, err);
          reject(err);
        });
      });

      busboy.on('finish', () => {
        console.log('[upload] Busboy finished parsing form data.');
        if (!uploadedFile) {
          console.error('[upload] No file was processed by busboy.on(\'file\').');
          reject(new Error('No file uploaded'));
        }
        // If promise was not resolved by writeStream.on('finish'), resolve here
        if (uploadedFile) {
          resolve();
        }
      });

      busboy.on('error', (err) => {
        console.error('[upload] Busboy error:', err);
        reject(err);
      });
      
      req.pipe(busboy);
      console.log('[upload] Request piped to Busboy.');
    });

    if (!uploadedFile) {
      console.error('[upload] uploadedFile is null after promise resolution.');
      throw new Error('No file uploaded for processing');
    }

    console.log('Processing uploaded file:', uploadedFile);

    // Initialize uploader
    const uploader = new Uploader(OG_RPC_URL, PRIV);

    // Create ZgFile from the uploaded file
    const zgFile = await ZgFile.fromFilePath(uploadedFile);

    // Upload to 0G Storage
    const uploadResult = await uploader.upload(zgFile, fileMetadata);

    // Close the ZgFile after upload
    await zgFile.close();

    // Clean up temporary files
    for (const tmpFile of tmpFiles) {
      await fs.unlink(tmpFile).catch(() => {});
    }

    const totalDuration = Date.now() - startTime;

    // Anchor to blockchain via internal API call
    const anchorResponse = await fetch(`${req.headers.origin}/api/anchor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': req.headers['x-wallet-address'] // Pass wallet address for auth
      },
      body: JSON.stringify({
        rootHash: uploadResult.root,
        manifestHash: uploadResult.manifest?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        projectId: fileMetadata.projectId || '0x0000000000000000000000000000000000000000000000000000000000000000' // Default or derive
      })
    });

    const anchorResult = await anchorResponse.json();

    if (!anchorResponse.ok || !anchorResult.ok) {
      console.error('Failed to anchor to blockchain:', anchorResult.error);
      // Still return success for upload, but indicate anchoring failed
      return res.status(200).json({
        ok: true,
        message: 'File uploaded to 0G Storage, but anchoring to blockchain failed.',
        root: uploadResult.root,
        manifest: uploadResult.manifest,
        performance: {
          uploadDuration: totalDuration,
          totalDuration: totalDuration
        },
        anchoringError: anchorResult.error
      });
    }

    return res.status(200).json({
      ok: true,
      root: uploadResult.root,
      manifest: uploadResult.manifest,
      performance: {
        uploadDuration: totalDuration,
        totalDuration: totalDuration
      },
      blockchain: anchorResult
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


