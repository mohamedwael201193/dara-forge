import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeWithAI } from '../src/server/compute/broker.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { text, datasetRoot } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Text is required' 
      });
    }

    console.log('[API] Starting real 0G Compute analysis...');
    console.log('[API] Text length:', text.length);
    if (datasetRoot) {
      console.log('[API] Dataset root:', datasetRoot);
    }
    
    // Call REAL 0G Compute (no fallback)
    const result = await analyzeWithAI(text.trim(), datasetRoot);
    
    console.log('[API] ✅ Analysis complete');
    console.log('[API] Provider:', result.provider);
    console.log('[API] Model:', result.model);
    console.log('[API] Verified:', result.verified);
    console.log('[API] Answer length:', result.answer.length);
    
    return res.status(200).json({
      ok: true,
      answer: result.answer,
      provider: result.provider,
      model: result.model,
      verified: result.verified,
      chatID: result.chatID,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[API] ❌ 0G Compute error:', error);
    
    // Return detailed error for debugging
    return res.status(500).json({
      ok: false,
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
}