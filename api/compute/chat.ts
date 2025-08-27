import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ethers } from 'ethers'
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'

export default async function handler(req: VercelResponse, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { messages, modelHint } = req.body || {}
    const rpc = process.env.OG_COMPUTE_RPC || 'https://evmrpc-testnet.0g.ai'
    const pk  = process.env.OG_COMPUTE_PRIVATE_KEY
    if (!pk) return res.status(500).json({ error: 'Missing OG_COMPUTE_PRIVATE_KEY' })
    const wallet = new ethers.Wallet(pk, new ethers.JsonRpcProvider(rpc))
    const broker = await createZGComputeNetworkBroker(wallet)

    // 1) Discover services
    const services = await broker.inference.listService()
    // Pick a default official model if present (llama-3.3-70b-instruct or deepseek-r1-70b)
    const preferred = (modelHint || 'llama-3.3-70b-instruct').toLowerCase()
    const picked = services.find(s => s.model.toLowerCase().includes(preferred)) || services[0]
    if (!picked) throw new Error('No providers available')

    // 2) Acknowledge provider once
    await broker.inference.acknowledgeProviderSigner(picked.provider)

    // 3) Get endpoint + headers, then call
    const meta = await broker.inference.getServiceMetadata(picked.provider)
    const headers = await broker.inference.getRequestHeaders(picked.provider, JSON.stringify(messages || []))

    const r = await fetch(`${meta.endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ model: meta.model, messages })
    })
    const json = await r.json()
    // 4) Optionally verify response (for verifiable services)
    // const valid = await broker.inference.processResponse(picked.provider, json, json?.id)

    return res.status(200).json({ provider: picked.provider, model: meta.model, response: json })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) })
  }
}

