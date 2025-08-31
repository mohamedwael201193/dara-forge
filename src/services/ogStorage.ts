const base = (import.meta.env.VITE_OG_INDEXER || 'https://indexer-storage-testnet-turbo.0g.ai').replace(/\/$/, '');
export const gatewayUrlForRoot = (root: string) => `${base}/file?root=${encodeURIComponent(root)}`;
export const downloadWithProofUrl = (root: string) => `${base}/file?root=${encodeURIComponent(root)}&proof=true`;


