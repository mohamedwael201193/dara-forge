import Busboy from 'busboy';
import os from 'node:os';
import path from 'node:path';
import { createWriteStream, promises as fs } from 'node:fs';

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
  // Log all headers explicitly to ensure no truncation
  console.log('[upload] Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('[upload] Environment variables (partial):', {
    OG_RPC_URL: process.env.OG_RPC_URL ? 'SET' : 'NOT_SET',
    OG_STORAGE_PRIVATE_KEY: process.env.OG_STORAGE_PRIVATE_KEY ? 'SET' : 'NOT_SET',
  });

  // Attempt to log raw body if available (Vercel might provide it in some contexts)
  if (req.rawBody) {
    console.log('[upload] Raw body length:', req.rawBody.length);
    // console.log('[upload] Raw body (first 100 chars):', req.rawBody.toString('utf8').substring(0, 100));
  } else {
    console.log('[upload] req.rawBody is not available.');
  }

  let tmpFiles: string[] = [];
  let fileMetadata: any = {};
  let uploadedFile: string | null = null;

  try {
    await new Promise<void>((resolve, reject) => {
      console.log('[upload] Initializing Busboy');
      const busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: 100 * 1024 * 1024,
          files: 10
        }
      });

      let fileProcessed = false;

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
        if (name !== 'file') {
          console.log(`[upload] Skipping non-file field: ${name}`);
          file.resume();
          return;
        }

        fileProcessed = true;
        const filename = info.filename || `uploaded-file-${Date.now()}`;
        const safe = filename.replace(/[^\w.\-]/g, '_');
        const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}-${safe}`);
        tmpFiles.push(tmpPath);

        console.log(`[upload] Writing file to: ${tmpPath}`);
        const writeStream = createWriteStream(tmpPath);
        file.pipe(writeStream);

        writeStream.on('finish', () => {
          console.log(`[upload] File write finished for: ${tmpPath}`);
          uploadedFile = tmpPath;
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
        console.log('[upload] Busboy finished parsing form data. File processed:', fileProcessed);
        if (!fileProcessed || !uploadedFile) {
          console.error('[upload] No file was successfully processed or written.');
          reject(new Error('No file uploaded'));
        } else {
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

    // Simplified for debugging: remove 0G SDK interaction for now
    // This part will be re-added once file upload is confirmed working
    console.log('[upload] File received successfully (temporarily skipping 0G SDK interaction).');
    res.status(200).json({ ok: true, message: 'File received for debugging.' });

  } catch (err: any) {
    for (const tmpFile of tmpFiles) {
      await fs.unlink(tmpFile).catch(() => {});
    }

    console.error('[upload] Error:', err);

    return res.status(500).json({
      ok: false,
      error: String(err?.message || err),
      timestamp: new Date().toISOString(),
    });
  }
}


