import { VercelRequest, VercelResponse } from '@vercel/node'
import { ethers } from 'ethers'
import { createRequire } from 'node:module'
export const config = { runtime: 'nodejs' }

function loadBrokerFactory() {
  const require = createRequire(import.meta.url)
  const mod = require('@0glabs/0g-serving-broker')
  const fn =
    mod.createZGComputeNetworkBroker ??
    mod.default?.createZGComputeNetworkBroker
  if (!fn) throw new Error('createZGComputeNetworkBroker not found')
  return fn
}

async function getBroker() {
  const createZGComputeNetworkBroker = loadBrokerFactory()
  const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL!)
  const wallet = new ethers.Wallet(process.env.OG_COMPUTE_PRIVATE_KEY!, provider)
  return createZGComputeNetworkBroker(wallet)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const broker = await getBroker()
    const ledger = await broker.ledger.getLedger().catch(() => null)
    const availableBalance = ledger ? (ledger.balance - ledger.locked) : 0n

    // pick a known provider/model just for health probe
    const providerAddr = '0xf07240Efa67755B5311bc75784a061eDB47165Dd'
    const getMeta = broker.getServiceMetadata ?? broker.inference?.getServiceMetadata
    const { endpoint, model } = await getMeta.call(broker, providerAddr)

    const head = await fetch(endpoint, { method: 'HEAD' }).catch(() => null)
    const ok = Boolean(head && head.ok)

    res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*')
    return res.status(200).json({
      ok,
      availableBalance: availableBalance.toString(),
      provider: providerAddr,
      endpoint,
      model,
    })
  } catch (err: any) {
    console.error('Health check failed:', err)
    return res.status(500).json({ ok: false, error: String(err?.message ?? err) })
  }
}

