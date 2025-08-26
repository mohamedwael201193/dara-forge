// 0G Galileo Testnet Configuration
export const CHAIN_CONFIG = {
  // Chain Details
  chainId: 16600,
  name: "0G Galileo Testnet",
  nativeCurrency: {
    name: "0G",
    symbol: "0G",
    decimals: 18,
  },
  
  // RPC Endpoints
  rpcUrls: {
    default: {
      http: [process.env.VITE_OG_RPC || "https://evmrpc-testnet.0g.ai/"],
    },
    public: {
      http: [process.env.VITE_OG_RPC || "https://evmrpc-testnet.0g.ai/"],
    },
    alt: {
      http: [process.env.VITE_OG_RPC_ALT || "https://16601.rpc.thirdweb.com/"],
    }
  },
  
  // Block Explorers
  blockExplorers: {
    default: {
      name: "0G ChainScan",
      url: process.env.VITE_OG_EXPLORER || "https://chainscan-galileo.0g.ai",
    },
  },
  
  // 0G Storage Configuration
  storage: {
    indexer: process.env.VITE_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai/",
  },
  
  // Contract Addresses
  contracts: {
    dara: process.env.VITE_DARA_CONTRACT || "0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9",
    flow: process.env.VITE_OG_FLOW_CONTRACT || "0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628",
  },
  
  // WalletConnect Configuration
  walletConnect: {
    projectId: process.env.VITE_WC_PROJECT_ID || "383710c855108ec5713394a649cb6eea",
  },
  
  // Server Configuration (for API routes)
  server: {
    rpcUrl: "https://evmrpc-testnet.0g.ai/",
    indexer: "https://indexer-storage-testnet-turbo.0g.ai",
    // Private key is accessed via process.env.OG_STORAGE_PRIVATE_KEY in server-only code
  }
} as const;

// Helper functions
export const getExplorerUrl = (type: 'tx' | 'address' | 'block', hash: string) => {
  const baseUrl = CHAIN_CONFIG.blockExplorers.default.url;
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`;
    case 'address':
      return `${baseUrl}/address/${hash}`;
    case 'block':
      return `${baseUrl}/block/${hash}`;
    default:
      return baseUrl;
  }
};

export const getStorageExplorerUrl = () => {
  return "https://storagescan-galileo.0g.ai/history";
};

// Validate environment variables
export const validateConfig = () => {
  const required = [
    'VITE_OG_RPC',
    'VITE_OG_INDEXER', 
    'VITE_DARA_CONTRACT',
    'VITE_WC_PROJECT_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return missing.length === 0;
};

