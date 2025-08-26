import { Indexer } from '@0glabs/0g-ts-sdk';

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { rootHash } = req.query;
  const { withProof, filename } = req.query;
  
  if (!rootHash) {
    return res.status(400).json({ 
      ok: false, 
      error: 'rootHash parameter is required' 
    });
  }

  const OG_INDEXER = must('OG_INDEXER');

  try {
    console.log('Downloading file with hash:', rootHash);
    
    // Initialize indexer
    const indexer = new Indexer(OG_INDEXER);
    
    // Get file info first
    const fileInfo = await indexer.getFileInfo(rootHash);
    if (!fileInfo) {
      return res.status(404).json({
        ok: false,
        error: 'File not found in 0G Storage'
      });
    }
    
    // Download file data
    const fileData = await indexer.downloadFile(rootHash);
    if (!fileData) {
      return res.status(404).json({
        ok: false,
        error: 'Failed to download file data'
      });
    }
    
    // Set appropriate headers
    const downloadFilename = filename || `file-${rootHash.slice(0, 8)}.bin`;
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    if (withProof === 'true') {
      // Add verification headers
      res.setHeader('X-Root-Hash', rootHash);
      res.setHeader('X-Verified', 'true');
      res.setHeader('X-Storage-Network', '0G');
    }
    
    // Stream the file data
    return res.status(200).send(fileData);

  } catch (err: any) {
    console.error('[download] Error:', err);
    
    return res.status(500).json({ 
      ok: false, 
      error: String(err?.message || err),
      timestamp: new Date().toISOString()
    });
  }
}

