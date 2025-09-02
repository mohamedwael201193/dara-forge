import { VercelRequest, VercelResponse } from '@vercel/node'
import { ethers } from 'ethers'
import { createRequire } from 'node:module'

export const config = { runtime: 'nodejs' } // ensure Node runtime (not Edge)

const OFFICIAL_PROVIDERS: Record<string, string[]> = {
  'llama-3.3-70b-instruct': ['0xf07240Efa67755B5311bc75784a061eDB47165Dd'],
  'deepseek-r1-70b':       ['0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3'],
}

function loadBrokerFactory() {
  const require = createRequire(import.meta.url)
  const mod = require('@0glabs/0g-serving-broker')
  const fn =
    mod.createZGComputeNetworkBroker ??
    mod.default?.createZGComputeNetworkBroker
  if (!fn) {
    throw new Error('createZGComputeNetworkBroker not found in @0glabs/0g-serving-broker')
  }
  return fn
}

async function getBroker() {
  const createZGComputeNetworkBroker = loadBrokerFactory()
  const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL!)
  const wallet = new ethers.Wallet(process.env.OG_COMPUTE_PRIVATE_KEY!, provider)
  return createZGComputeNetworkBroker(wallet)
}

async function ensureLedgerBalance(broker: any) {
  const parse = ethers.parseEther
  const min = parse(process.env.OG_MIN_LEDGER_BALANCE ?? '0.01')
  const bootstrap = parse(process.env.OG_BOOTSTRAP_LEDGER ?? '0.05')
  const refill = parse(process.env.OG_REFILL_AMOUNT ?? '0.05')

  let ledger = await broker.ledger.getLedger().catch(() => null)
  if (!ledger) {
    await broker.ledger.addLedger(bootstrap)
  } else {
    const avail = ledger.balance - ledger.locked
    if (avail < min) await broker.ledger.depositFund(refill)
  }
}

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { model, prompt, provider: providerAddr, messages } = body;

    const derivedPrompt =
      prompt ??
      (Array.isArray(messages)
        ? messages.filter((m: any) => m?.role === 'user').pop()?.content
        : undefined);

    if (!model || !derivedPrompt) {
      return res.status(400).json({ error: 'Missing model or prompt' });
    }

    const broker = await getBroker()
    await ensureLedgerBalance(broker)

    const officialProviders = OFFICIAL_PROVIDERS[model]
    if (officialProviders && !officialProviders.includes(providerAddr)) {
      return res.status(400).json({ error: 'Invalid provider for model' })
    }

    const completion = await broker.inference.chatCompletion({
      model,
      prompt: derivedPrompt,
      provider: providerAddr,
    })

    res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*')
    return res.status(200).json({ completion })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}

