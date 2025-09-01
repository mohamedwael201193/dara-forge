import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";

export const config = { runtime: 'nodejs' };

const OFFICIAL_PROVIDERS: Record<string, string[]> = {
  'llama-3.3-70b-instruct': ['0xf07240Efa67755B5311bc75784a061eDB47165Dd'],
  'deepseek-r1-70b': ['0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3'],
};

async function getBroker() {
  const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
  const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.OG_COMPUTE_PRIVATE_KEY!, provider);
  return createZGComputeNetworkBroker(wallet);
}

async function checkProviderHealth(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*');

  try {
    const broker = await getBroker();
    
    // Check ledger balance
    let availableBalance = '0';
    let ledgerStatus = 'unknown';
    
    try {
      const ledger = await broker.ledger.getLedger();
      const balance = (ledger as any).balance - (ledger as any).locked;
      availableBalance = ethers.formatEther(balance);
      ledgerStatus = 'active';
    } catch (e) {
      ledgerStatus = 'not_found';
    }
    
    // Check provider health
    const providers = [];
    
    for (const [model, addresses] of Object.entries(OFFICIAL_PROVIDERS)) {
      for (const address of addresses) {
        try {
          const meta = await broker.inference.getServiceMetadata(address);
          const isHealthy = await checkProviderHealth(meta.endpoint);
          
          providers.push({
            model,
            address,
            endpoint: meta.endpoint,
            healthy: isHealthy,
            name: model === 'llama-3.3-70b-instruct' ? 'Llama 3.3 70B Instruct' : 'DeepSeek R1 70B'
          });
        } catch (e) {
          providers.push({
            model,
            address,
            endpoint: 'unknown',
            healthy: false,
            error: 'metadata_failed',
            name: model === 'llama-3.3-70b-instruct' ? 'Llama 3.3 70B Instruct' : 'DeepSeek R1 70B'
          });
        }
      }
    }
    
    const healthyProviders = providers.filter(p => p.healthy).length;
    const totalProviders = providers.length;
    
    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      ledger: {
        status: ledgerStatus,
        availableBalance,
        unit: 'OG'
      },
      providers: {
        healthy: healthyProviders,
        total: totalProviders,
        details: providers
      },
      environment: {
        chainId: process.env.OG_CHAIN_ID || '16601',
        rpcUrl: process.env.OG_RPC_URL || 'https://evmrpc-testnet.0g.ai'
      }
    });

  } catch (e: any) {
    console.error('Health check failed:', e);
    
    return res.status(500).json({
      ok: false,
      error: e.message || 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
}

