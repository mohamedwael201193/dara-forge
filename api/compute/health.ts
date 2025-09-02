import { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'nodejs' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*')
    
    // Temporary placeholder response while serving-broker issues are resolved
    return res.status(200).json({
      ok: false,
      availableBalance: '0',
      provider: 'N/A',
      endpoint: 'N/A',
      model: 'N/A',
      message: 'Compute service temporarily unavailable during system updates'
    })
  } catch (err: any) {
    console.error('Health check failed:', err)
    return res.status(500).json({ 
      ok: false, 
      error: String(err?.message ?? err) 
    })
  }
}

