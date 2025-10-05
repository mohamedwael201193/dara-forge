import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ogComputeService } from '../src/server/compute/0gComputeService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, datasetRoot } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('[API] Starting 0G Compute analysis...');
    
    // Use real 0G Compute service
    const result = await ogComputeService.analyzeWithAI(text, datasetRoot);
    
    console.log('[API] Analysis complete:', {
      model: result.model,
      verified: result.verified,
      length: result.answer.length
    });
    
    return res.status(200).json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[API] 0G Compute error:', error);
    
    // Return detailed error for debugging
    return res.status(500).json({
      ok: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}