// =============================================================================
// 0G MAINNET CONFIGURATION
// =============================================================================
// Centralized configuration with environment variable support
// Configured for Wave 5 mainnet deployment

// Feature Flags
// -------------
const getEnvVar = (key: string): string | undefined => {
  // Handle both browser (import.meta.env) and Node.js (process.env) contexts
  if (typeof window !== "undefined" && (globalThis as any).import?.meta?.env) {
    return (globalThis as any).import.meta.env[key];
  }
  return process.env[key];
};

export const FEATURE_FLAGS = {
  UI_V2:
    getEnvVar("VITE_DARA_UI_V2") === "true" ||
    getEnvVar("DARA_UI_V2") === "true",
  CORRECT_ORDER_PIPELINE:
    getEnvVar("VITE_CORRECT_ORDER") === "true" ||
    getEnvVar("CORRECT_ORDER") === "true",
  ADVANCED_VERIFICATION:
    getEnvVar("VITE_ADVANCED_VERIFY") === "true" ||
    getEnvVar("ADVANCED_VERIFY") === "true",
  ENHANCED_VERIFICATION:
    getEnvVar("VITE_ENHANCED_VERIFY") === "true" ||
    getEnvVar("ENHANCED_VERIFY") === "true" ||
    true,
} as const;

// Network Constants (with environment override)
// ---------------------------------------------
// WAVE 5: Default to MAINNET (Chain ID 16661)
const getChainId = (): number => {
  const envChainId = getEnvVar("VITE_OG_CHAIN_ID") || getEnvVar("OG_CHAIN_ID");
  return envChainId ? parseInt(envChainId, 10) : 16661; // Changed from 16602 to 16661 (mainnet)
};

const getRpcUrl = (): string => {
  return (
    getEnvVar("VITE_OG_RPC") || getEnvVar("OG_RPC") || "https://evmrpc.0g.ai" // Changed from testnet to mainnet
  );
};

const getBaseExplorerUrl = (): string => {
  return (
    getEnvVar("VITE_OG_EXPLORER") ||
    getEnvVar("OG_EXPLORER") ||
    "https://chainscan.0g.ai" // Changed from galileo to mainnet
  );
};

const getIndexerUrl = (): string => {
  return (
    getEnvVar("VITE_OG_INDEXER") ||
    getEnvVar("OG_INDEXER") ||
    "https://indexer-storage-turbo.0g.ai" // Changed from testnet to mainnet
  );
};

// Main Chain Configuration
// ------------------------
export const CHAIN_CONFIG = {
  // Chain Details
  chainId: getChainId(),
  name: "0G Mainnet", // Changed from "Galileo (Testnet)"
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
      http: [
        getEnvVar("VITE_OG_RPC_ALT") || getEnvVar("OG_RPC_ALT") || getRpcUrl(),
      ],
    },
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
    dara: (getEnvVar("VITE_DARA_CONTRACT") ||
      getEnvVar("DARA_CONTRACT") ||
      "0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9") as `0x${string}`,
    flow: (getEnvVar("VITE_OG_FLOW_CONTRACT") ||
      getEnvVar("OG_FLOW_CONTRACT") ||
      "0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628") as `0x${string}`,
    anchor: (getEnvVar("VITE_ANCHOR_CONTRACT") ||
      getEnvVar("ANCHOR_CONTRACT") ||
      "0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9") as `0x${string}`,
  },

  // WalletConnect Configuration
  walletConnect: {
    projectId:
      getEnvVar("VITE_WC_PROJECT_ID") ||
      getEnvVar("WC_PROJECT_ID") ||
      "383710c855108ec5713394a649cb6eea",
  },

  // Server Configuration (for API routes only - never used in client)
  server: {
    rpcUrl: getRpcUrl(),
    indexer: getIndexerUrl(),
    // Private keys are only accessed in server-side API routes, never in client
  },
} as const;

// Helper functions for URL construction
export const getExplorerUrl = (
  type: "tx" | "address" | "block",
  hash: string
): string => {
  const baseUrl: string = getBaseExplorerUrl();
  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${hash}`;
    case "address":
      return `${baseUrl}/address/${hash}`;
    case "block":
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
    "VITE_OG_RPC",
    "VITE_OG_INDEXER",
    "VITE_DARA_CONTRACT",
    "VITE_WC_PROJECT_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn("Missing environment variables:", missing);
  }

  return missing.length === 0;
};

// 0G Compute Contract Addresses (0.5.4)
// -------------------------------------
export const getComputeAddresses = () => ({
  ledger: process.env.OG_COMPUTE_LEDGER!,
  inference: process.env.OG_COMPUTE_INFERENCE!,
  finetune: process.env.OG_COMPUTE_FINETUNE!,
});

// Legacy export for backwards compatibility
export const COMPUTE_ADDR = getComputeAddresses();
