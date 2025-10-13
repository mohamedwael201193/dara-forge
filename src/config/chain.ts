// =============================================================================
// 0G GALILEO TESTNET CONFIGURATION
// =============================================================================
// Centralized configuration with environment variable support
// All hardcoded values moved here for maintainability

// Feature Flags
// -------------
export const FEATURE_FLAGS = {
  UI_V2: import.meta.env.VITE_DARA_UI_V2 === 'true' || process.env.DARA_UI_V2 === 'true',
  CORRECT_ORDER_PIPELINE: import.meta.env.VITE_CORRECT_ORDER === 'true' || process.env.CORRECT_ORDER === 'true',
  ADVANCED_VERIFICATION: import.meta.env.VITE_ADVANCED_VERIFY === 'true' || process.env.ADVANCED_VERIFY === 'true',
  ENHANCED_VERIFICATION: import.meta.env.VITE_ENHANCED_VERIFY === 'true' || process.env.ENHANCED_VERIFY === 'true' || true,
} as const;

// Network Constants (with environment override)
// ---------------------------------------------
const getChainId = (): number => {
  const envChainId = import.meta.env.VITE_OG_CHAIN_ID || process.env.VITE_OG_CHAIN_ID;
  return envChainId ? parseInt(envChainId, 10) : 16602;
};

const getRpcUrl = (): string => {
  return import.meta.env.VITE_OG_RPC || process.env.VITE_OG_RPC || "https://evmrpc-testnet.0g.ai/";
};

const getBaseExplorerUrl = (): string => {
  return import.meta.env.VITE_OG_EXPLORER || process.env.VITE_OG_EXPLORER || "https://chainscan-galileo.0g.ai";
};

const getIndexerUrl = (): string => {
  return import.meta.env.VITE_OG_INDEXER || process.env.VITE_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai/";
};

// Main Chain Configuration
// ------------------------
export const CHAIN_CONFIG = {
  // Chain Details
  chainId: getChainId(),
  name: "Galileo (Testnet)",
  nativeCurrency: {
    name: "0G",
    symbol: "0G",
    decimals: 18,
  },
  
  // RPC Endpoints
  rpcUrls: {
    default: {
      http: [getRpcUrl()],
    },
    public: {
      http: [getRpcUrl()],
    },
    alt: {
      http: [import.meta.env.VITE_OG_RPC_ALT || process.env.VITE_OG_RPC_ALT || getRpcUrl()],
    }
  },
  
  // Block Explorers
  blockExplorers: {
    default: {
      name: "ChainScan",
      url: getBaseExplorerUrl(),
    },
  },
  
  // 0G Storage Configuration
  storage: {
    indexer: getIndexerUrl(),
    explorerUrl: "https://storagescan-galileo.0g.ai/history",
  },
  
  // Contract Addresses
  contracts: {
    dara: (import.meta.env.VITE_DARA_CONTRACT || process.env.VITE_DARA_CONTRACT || "0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9") as `0x${string}`,
    flow: (import.meta.env.VITE_OG_FLOW_CONTRACT || process.env.VITE_OG_FLOW_CONTRACT || "0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628") as `0x${string}`,
    anchor: (import.meta.env.VITE_ANCHOR_CONTRACT || process.env.VITE_ANCHOR_CONTRACT || "0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9") as `0x${string}`,
  },
  
  // WalletConnect Configuration
  walletConnect: {
    projectId: import.meta.env.VITE_WC_PROJECT_ID || process.env.VITE_WC_PROJECT_ID || "383710c855108ec5713394a649cb6eea",
  },
  
  // Server Configuration (for API routes only - never used in client)
  server: {
    rpcUrl: getRpcUrl(),
    indexer: getIndexerUrl(),
    // Private keys are only accessed in server-side API routes, never in client
  }
} as const;

// Helper functions for URL construction
export const getExplorerUrl = (type: 'tx' | 'address' | 'block', hash: string): string => {
  const baseUrl: string = getBaseExplorerUrl();
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

