import { Uploader, ZgFile } from '@0glabs/0g-ts-sdk';
import formidable from 'formidable';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, as we're using formidable
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  console.log('[upload] Request received');
  console.log('[upload] Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('[upload] Environment variables (partial):', {
    OG_RPC_URL: process.env.OG_RPC_URL ? 'SET' : 'NOT_SET',
    OG_STORAGE_PRIVATE_KEY: process.env.OG_STORAGE_PRIVATE_KEY ? 'SET' : 'NOT_SET',
  });

  const startTime = Date.now();
  const OG_RPC_URL = must('OG_RPC_URL');
  const PRIV = must('OG_STORAGE_PRIVATE_KEY');

  let fileMetadata: any = {};
  let uploadedFilePath: string | null = null;

  try {
    const form = formidable({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      multiples: false, // Only expect one file for now
      filename: (name, ext, part, form) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${part.originalFilename}-${uniqueSuffix}${ext}`;
      },
    });

    const [fields, files] = await form.parse(req);

    console.log('[upload] Formidable parsed fields:', fields);
    console.log('[upload] Formidable parsed files:', files);

    if (fields.metadata && fields.metadata.length > 0) {
      try {
        fileMetadata = JSON.parse(fields.metadata[0]);
        console.log('[upload] Parsed metadata:', fileMetadata);
      } catch (e) {
        console.error('[upload] Invalid metadata JSON:', e);
        throw new Error('Invalid metadata JSON');
      }
    }

    const fileArray = files.file; // 'file' is the field name from frontend
    if (!fileArray || fileArray.length === 0) {
      console.error('[upload] No file found in formidable parsing.');
      throw new Error('No file uploaded');
    }

    const file = fileArray[0];
    uploadedFilePath = file.filepath;
    console.log('Processing uploaded file:', uploadedFilePath);

    // Initialize uploader
    const uploader = new Uploader(OG_RPC_URL, PRIV);

    // Create ZgFile from the uploaded file
    const zgFile = await ZgFile.fromFilePath(uploadedFilePath);

    // Upload to 0G Storage
    const uploadResult = await uploader.upload(zgFile, fileMetadata);

    // Close the ZgFile after upload
    await zgFile.close();

    // Clean up temporary file
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
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
    // Clean up temporary file on error
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
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


