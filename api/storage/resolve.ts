import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enhanced storage indexer configuration for verification parity
const STORAGE_INDEXERS = [
  'https://indexer-storage-testnet-turbo.0g.ai',
  'https://indexer-storage-testnet-standard.0g.ai',
  'https://indexer-storage-testnet-backup.0g.ai',
];

interface ProbeResult {
  url: string;
  success: boolean;
  responseTime: number;
  error?: string;
}

interface VerifyResult {
  available: boolean;
  indexer: string | null;
  verificationTime: number;
  probeResults: ProbeResult[];
}

async function probeWithMetrics(url: string, timeoutMs = 3000): Promise<ProbeResult> {
  const startTime = Date.now();
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, { 
      method: 'GET', 
      headers: { Range: 'bytes=0-0' }, 
      signal: ac.signal 
    });
    
    const success = res.status === 200 || res.status === 206;
    return {
      url,
      success,
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      url,
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message || String(error)
    };
  } finally {
    clearTimeout(t);
  }
}

// Enhanced verification that tracks which indexer responded
async function verifyWithIndexer(root: string, path?: string, preferredIndexer?: string): Promise<VerifyResult> {
  const startTime = Date.now();
  const probeResults: ProbeResult[] = [];
  
  // Get all available indexers
  const envList = (process.env.OG_INDEXER_LIST || process.env.OG_INDEXER || process.env.OG_INDEXER_RPC || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const indexers = [...envList, ...STORAGE_INDEXERS].filter((v, i, a) => a.indexOf(v) === i);
  
  // Try preferred indexer first if specified
  if (preferredIndexer && indexers.includes(preferredIndexer)) {
    const clean = preferredIndexer.replace(/\/$/, '');
    const url = path
      ? `${clean}/file/${root}/${encodeURI(path)}`
      : `${clean}/file?root=${encodeURIComponent(root)}&name=__probe`;
      
    const result = await probeWithMetrics(url);
    probeResults.push(result);
    
    if (result.success) {
      return {
        available: true,
        indexer: clean,
        verificationTime: Date.now() - startTime,
        probeResults
      };
    }
  }
  
  // Try all indexers if preferred failed or not specified
  for (const base of indexers) {
    if (base === preferredIndexer) continue; // Already tried
    
    const clean = base.replace(/\/$/, '');
    const url = path
      ? `${clean}/file/${root}/${encodeURI(path)}`
      : `${clean}/file?root=${encodeURIComponent(root)}&name=__probe`;
      
    const result = await probeWithMetrics(url);
    probeResults.push(result);
    
    if (result.success) {
      return {
        available: true,
        indexer: clean,
        verificationTime: Date.now() - startTime,
        probeResults
      };
    }
  }
  
  return {
    available: false,
    indexer: null,
    verificationTime: Date.now() - startTime,
    probeResults
  };
}

// Legacy probe function for backward compatibility
async function probe(url: string, timeoutMs = 3000): Promise<boolean> {
  const result = await probeWithMetrics(url, timeoutMs);
  return result.success;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const root = String(req.query.root || '').trim();
    const path = String(req.query.path || '').trim(); // optional for folder
    const preferredIndexer = String(req.query.preferredIndexer || '').trim();
    const enhanced = req.query.enhanced === 'true'; // Use enhanced verification
    
    if (!/^0x[0-9a-fA-F]{64}$/.test(root)) {
      return res.status(400).json({ ok: false, error: 'Invalid root hash format' });
    }

    if (enhanced) {
      // Use enhanced verification with detailed metrics
      const result = await verifyWithIndexer(root, path || undefined, preferredIndexer || undefined);
      
      return res.status(200).json({
        ok: true,
        available: result.available,
        indexer: result.indexer,
        verificationTime: result.verificationTime,
        probeResults: result.probeResults,
        root,
        path: path || null
      });
    } else {
      // Legacy behavior for backward compatibility
      const envList = (process.env.OG_INDEXER_LIST || process.env.OG_INDEXER || process.env.OG_INDEXER_RPC || '')
        .split(',').map(s => s.trim()).filter(Boolean);
      const indexers = [...envList, ...STORAGE_INDEXERS].filter((v, i, a) => a.indexOf(v) === i);

      for (const base of indexers) {
        const clean = base.replace(/\/$/, '');
        const url = path
          ? `${clean}/file/${root}/${encodeURI(path)}`
          : `${clean}/file?root=${encodeURIComponent(root)}&name=__probe`;
        if (await probe(url)) {
          return res.status(200).json({ ok: true, indexer: clean });
        }
      }
      return res.status(200).json({ ok: true, indexer: null });
    }
  } catch (e: any) {
    console.error('[Storage Resolve] Error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: e?.message || String(e),
      technicalDetails: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
}

