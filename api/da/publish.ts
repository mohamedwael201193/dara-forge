import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDAStatus, publishToDA } from '../../src/server/da/daService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      console.log('[DA API] Received DA publication request');
      
      const { data, metadata } = req.body || {};
      
      // Validate input
      if (!data) {
        return res.status(400).json({
          ok: false,
          error: 'Data is required for DA publication'
        });
      }

      console.log('[DA API] Publishing to 0G DA network...');
      console.log('[DA API] Data type:', typeof data);
      console.log('[DA API] Metadata:', metadata);

      // Publish to DA network
      const result = await publishToDA(data, metadata);

      console.log('[DA API] DA publication successful!');
      console.log('[DA API] Blob Hash:', result.blobHash);
      console.log('[DA API] Verified:', result.verified);

      return res.status(200).json({
        ok: true,
        message: 'Data published to 0G DA network successfully',
        result: {
          blobHash: result.blobHash,
          dataRoot: result.dataRoot,
          epoch: result.epoch,
          quorumId: result.quorumId,
          verified: result.verified,
          size: result.size,
          timestamp: result.timestamp,
          metadata: result.metadata
        }
      });

    } else if (req.method === 'GET') {
      // GET request - return DA status
      console.log('[DA API] Getting DA client status');
      
      const status = await getDAStatus();
      
      return res.status(200).json({
        ok: true,
        status,
        message: '0G DA client is operational'
      });

    } else {
      return res.status(405).json({
        ok: false,
        error: 'Method not allowed. Use POST to publish data or GET for status.'
      });
    }

  } catch (error: any) {
    console.error('[DA API] Error:', error);
    
    return res.status(500).json({
      ok: false,
      error: error.message || 'DA operation failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}