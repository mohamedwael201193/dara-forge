import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ethers } from 'ethers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { messages, modelHint } = req.body || {}
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' })
    }

    const rpc = process.env.OG_COMPUTE_RPC || 'https://evmrpc-testnet.0g.ai'
    const pk = process.env.OG_COMPUTE_PRIVATE_KEY
    
    if (!pk) {
      return res.status(500).json({ error: 'Missing OG_COMPUTE_PRIVATE_KEY' })
    }

    // For now, return a mock response until 0G Compute is fully integrated
    // This prevents the "Unexpected end of JSON input" error
    const mockResponse = {
      provider: "0g-compute-provider",
      model: modelHint || "llama-3.3-70b-instruct",
      response: {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: modelHint || "llama-3.3-70b-instruct",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: generateMockSummary(messages)
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150
        }
      }
    }

    return res.status(200).json(mockResponse)

    // TODO: Uncomment this when 0G Compute SDK is available
    /*
    const wallet = new ethers.Wallet(pk, new ethers.JsonRpcProvider(rpc))
    const broker = await createZGComputeNetworkBroker(wallet)

    const services = await broker.inference.listService()
    const preferred = (modelHint || 'llama-3.3-70b-instruct').toLowerCase()
    const picked = services.find(s => s.model.toLowerCase().includes(preferred)) || services[0]
    
    if (!picked) {
      throw new Error('No providers available')
    }

    await broker.inference.acknowledgeProviderSigner(picked.provider)
    const meta = await broker.inference.getServiceMetadata(picked.provider)
    const headers = await broker.inference.getRequestHeaders(picked.provider, JSON.stringify(messages))

    const r = await fetch(`${meta.endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ model: meta.model, messages })
    })
    
    const json = await r.json()
    return res.status(200).json({ provider: picked.provider, model: meta.model, response: json })
    */

  } catch (error: any) {
    console.error('0G Compute API error:', error)
    return res.status(500).json({ 
      error: error?.message || 'Internal server error',
      details: 'Failed to process request with 0G Compute'
    })
  }
}

function generateMockSummary(messages: any[]): string {
  const userMessage = messages.find(m => m.role === 'user')?.content || ''
  
  if (userMessage.toLowerCase().includes('summarize')) {
    const textToSummarize = userMessage.replace(/summarize the following text:\s*/i, '').trim()
    
    if (textToSummarize.length > 0) {
      return `**AI-Generated Summary (Mock Response)**

This text discusses ${textToSummarize.split(' ').slice(0, 5).join(' ')}... 

Key points:
• The content appears to focus on research and data analysis
• Machine learning and AI technologies are mentioned
• The text suggests academic or scientific context

*Note: This is a mock response. Full 0G Compute integration is pending.*`
    }
  }
  
  return `**AI-Generated Summary (Mock Response)**

I've analyzed the provided text and generated a summary based on the key concepts and themes identified.

*Note: This is a mock response while 0G Compute integration is being finalized.*`
}

