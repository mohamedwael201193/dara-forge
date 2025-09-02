import { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'nodejs' } // ensure Node runtime (not Edge)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*')
    
    // Temporary placeholder response while serving-broker issues are resolved
    return res.status(503).json({ 
      error: 'Compute service temporarily unavailable',
      message: 'The 0G Compute service is currently being updated. Please try again later.'
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

