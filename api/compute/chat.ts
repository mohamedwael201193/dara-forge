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

async function ensureLedgerBalance(broker: any) {
  const min = ethers.parseEther(process.env.OG_MIN_LEDGER_BALANCE ?? '0.01');
  const bootstrap = ethers.parseEther(process.env.OG_BOOTSTRAP_LEDGER ?? '0.05');
  const refill = ethers.parseEther(process.env.OG_REFILL_AMOUNT ?? '0.05');
  
  let ledger = await broker.ledger.getLedger().catch(() => null);
  
  if (!ledger) {
    console.log('Creating new ledger with', ethers.formatEther(bootstrap), 'OG');
    await broker.ledger.addLedger(bootstrap);
    ledger = await broker.ledger.getLedger();
  } else {
    const avail = ledger.balance - ledger.locked;
    if (avail < min) {
      console.log('Refilling ledger with', ethers.formatEther(refill), 'OG');
      await broker.ledger.depositFund(refill);
    }
  }
  
  return ledger;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_ORIGIN ?? '*');

  const { model, messages, stream, tokenId, datasetRef } = req.body || {};
  
  if (!model || !messages) {
    return res.status(400).json({ error: 'model and messages are required' });
  }

  try {
    console.log('Initializing broker for model:', model);
    const broker = await getBroker();
    await ensureLedgerBalance(broker);

    const providers = OFFICIAL_PROVIDERS[model] ?? [];
    if (!providers.length) {
      return res.status(400).json({ error: `Unsupported model: ${model}` });
    }

    // Try each provider until one succeeds
    for (const providerAddr of providers) {
      try {
        console.log('Trying provider:', providerAddr);
        
        // Acknowledge provider
        await broker.inference.acknowledgeProviderSigner(providerAddr).catch(() => {});
        
        // Get service metadata
        const meta = await broker.inference.getServiceMetadata(providerAddr);
        console.log('Provider metadata:', { endpoint: meta.endpoint, model: meta.model });
        
        // Generate one-time headers
        const headers = await broker.inference.getRequestHeaders(providerAddr, JSON.stringify(messages));
        
        const url = `${meta.endpoint}/chat/completions`;
        
        if (stream) {
          // Handle streaming response
          const upstream = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ model: meta.model, messages, stream: true }),
          });
          
          if (!upstream.ok) {
            throw new Error(`Upstream ${upstream.status}: ${await upstream.text()}`);
          }
          
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });
          
          // Stream the response
          const reader = upstream.body?.getReader();
          if (reader) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
            } finally {
              reader.releaseLock();
            }
          }
          
          res.end();
          return;
        } else {
          // Handle non-streaming response
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ 
              model: meta.model, 
              messages,
              temperature: 0.3,
              max_tokens: 3000
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Upstream ${response.status}: ${await response.text()}`);
          }
          
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content ?? '';
          
          // Try to verify response (TEE providers only)
          let verified = false;
          try {
            verified = await broker.inference.processResponse(providerAddr, content, data.id) || false;
          } catch (e) {
            console.log('Verification not available for this provider');
          }
          
          return res.status(200).json({ 
            content, 
            provider: providerAddr, 
            model: meta.model,
            verified,
            usage: data.usage,
            raw: data 
          });
        }
      } catch (e: any) {
        console.error(`Provider ${providerAddr} failed:`, e.message);
        // Continue to next provider
      }
    }

    // All providers failed
    return res.status(502).json({ 
      error: 'Selected provider endpoint unreachable. Try again later or switch model.' 
    });

  } catch (e: any) {
    console.error('Compute API error:', e);
    
    // Map specific errors
    if (e.message?.includes('ENOTFOUND') || e.message?.includes('DNS')) {
      return res.status(502).json({ error: 'Provider endpoint unreachable' });
    }
    
    if (e.message?.includes('401') || e.message?.includes('403')) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    if (e.message?.includes('insufficient') || e.message?.includes('balance')) {
      return res.status(402).json({ error: 'Insufficient OG balance. Please top up from faucet.' });
    }
    
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}

