import type { VercelRequest, VercelResponse } from '@vercel/node';
import { retrieveFromDA, verifyDAAvailability } from '../../src/server/da/daService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { blobHash } = req.query;

    if (!blobHash || typeof blobHash !== 'string') {
      return res.status(400).json({
        ok: false,
        error: 'blobHash is required as query parameter'
      });
    }

    if (req.method === 'GET') {
      // Verify availability only
      console.log('[DA Verify API] Verifying availability for:', blobHash);
      
      const isAvailable = await verifyDAAvailability(blobHash);
      
      return res.status(200).json({
        ok: true,
        blobHash,
        available: isAvailable,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === 'POST') {
      // Retrieve actual data
      console.log('[DA Verify API] Retrieving data for:', blobHash);
      
      const result = await retrieveFromDA(blobHash);
      
      // Convert Uint8Array to base64 for JSON response
      const dataBase64 = Buffer.from(result.data).toString('base64');
      
      return res.status(200).json({
        ok: true,
        blobHash,
        data: dataBase64,
        size: result.size,
        encoding: 'base64',
        timestamp: new Date().toISOString()
      });

    } else {
      return res.status(405).json({
        ok: false,
        error: 'Method not allowed. Use GET to verify or POST to retrieve.'
      });
    }

  } catch (error: any) {
    console.error('[DA Verify API] Error:', error);
    
    return res.status(500).json({
      ok: false,
      error: error.message || 'DA verification failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}