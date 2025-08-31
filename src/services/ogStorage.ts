const base = (import.meta.env.VITE_OG_INDEXER || 'https://indexer-storage-testnet-turbo.0g.ai/').replace(/\/$/, '');

export function gatewayUrlForRoot(root: string) {
  return `${base}/file?root=${encodeURIComponent(root)}`;
}

export function downloadWithProofUrl(root: string) {
  return `${base}/file?root=${encodeURIComponent(root)}&proof=true`;
}


