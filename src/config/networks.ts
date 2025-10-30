// =============================================================================
// 0G NETWORK CONFIGURATION WITH ZOD VALIDATION
// =============================================================================
// Canonical source of truth for 0G Mainnet and Testnet configurations
// Uses Zod for runtime validation of environment variables

import { z } from "zod";

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const UrlSchema = z.string().url();
const ChainIdSchema = z.number().int().positive();

const NetworkConfigSchema = z.object({
  chainId: ChainIdSchema,
  name: z.string(),
  rpcUrl: UrlSchema,
  explorerUrl: UrlSchema,
  storageIndexer: UrlSchema.optional(),
  computeUrl: UrlSchema.optional(),
  daUrl: UrlSchema.optional(),
  badge: z.enum(["MAINNET", "TESTNET"]),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }),
});

export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;

// =============================================================================
// ENVIRONMENT VARIABLE HELPERS
// =============================================================================

function getEnv(key: string, fallback?: string): string {
  // Browser context (Vite)
  if (typeof window !== "undefined" && import.meta.env) {
    return import.meta.env[key] || fallback || "";
  }
  // Node.js context
  return process.env[key] || fallback || "";
}

function getEnvNumber(key: string, fallback: number): number {
  const value = getEnv(key);
  return value ? parseInt(value, 10) : fallback;
}

// =============================================================================
// 0G MAINNET CONFIGURATION (PRODUCTION)
// =============================================================================

const MAINNET_CONFIG: NetworkConfig = {
  chainId: getEnvNumber("OG_CHAIN_ID_MAINNET", 16661),
  name: "0G Mainnet",
  rpcUrl: getEnv("OG_RPC_URL_MAINNET", "https://evmrpc.0g.ai"),
  explorerUrl: getEnv("OG_EXPLORER_MAINNET", "https://chainscan.0g.ai"),
  storageIndexer: getEnv(
    "OG_STORAGE_INDEXER_MAINNET",
    "https://indexer-storage-turbo.0g.ai"
  ),
  badge: "MAINNET",
  nativeCurrency: {
    name: "0G",
    symbol: "0G",
    decimals: 18,
  },
};

// =============================================================================
// 0G TESTNET CONFIGURATION (GALILEO)
// =============================================================================

const TESTNET_CONFIG: NetworkConfig = {
  chainId: getEnvNumber("OG_CHAIN_ID_TESTNET", 16602),
  name: "0G Galileo Testnet",
  rpcUrl: getEnv("OG_RPC_URL_TESTNET", "https://evmrpc-galileo.0g.ai"),
  explorerUrl: getEnv("OG_EXPLORER_TESTNET", "https://chainscan-galileo.0g.ai"),
  storageIndexer: getEnv(
    "OG_STORAGE_URL_TESTNET",
    "https://indexer-storage-galileo-turbo.0g.ai"
  ),
  computeUrl: getEnv("OG_COMPUTE_URL_TESTNET", "https://evmrpc-galileo.0g.ai"),
  daUrl: getEnv("OG_DA_URL_TESTNET", "https://evmrpc-galileo.0g.ai"),
  badge: "TESTNET",
  nativeCurrency: {
    name: "0G",
    symbol: "0G",
    decimals: 18,
  },
};

// =============================================================================
// VALIDATED NETWORKS EXPORT
// =============================================================================

export const NETWORKS = {
  mainnet: NetworkConfigSchema.parse(MAINNET_CONFIG),
  testnet: NetworkConfigSchema.parse(TESTNET_CONFIG),
} as const;

export type NetworkId = keyof typeof NETWORKS;

// =============================================================================
// TYPED HELPER FUNCTIONS
// =============================================================================

/**
 * Get RPC URL for a specific chain
 * @throws Error if chain is not configured
 */
export function getRpc(chain: NetworkId): string {
  const network = NETWORKS[chain];
  if (!network?.rpcUrl) {
    throw new Error(`RPC URL not configured for chain: ${chain}`);
  }
  return network.rpcUrl;
}

/**
 * Get block explorer URL for a specific chain
 * @throws Error if chain is not configured
 */
export function getExplorer(chain: NetworkId): string {
  const network = NETWORKS[chain];
  if (!network?.explorerUrl) {
    throw new Error(`Explorer URL not configured for chain: ${chain}`);
  }
  return network.explorerUrl;
}

/**
 * Get storage indexer URL for a specific chain
 * @throws Error if storage is not available on this chain
 */
export function getStorageIndexer(chain: NetworkId): string {
  const network = NETWORKS[chain];
  if (!network?.storageIndexer) {
    throw new Error(`Storage indexer not available for chain: ${chain}`);
  }
  return network.storageIndexer;
}

/**
 * Get compute URL (Testnet only)
 * @throws Error if compute is not available on this chain
 */
export function getCompute(chain: NetworkId = "testnet"): string {
  const network = NETWORKS[chain];
  if (!network?.computeUrl) {
    throw new Error(`0G Compute only available on testnet. Chain: ${chain}`);
  }
  return network.computeUrl;
}

/**
 * Get DA URL (Testnet only)
 * @throws Error if DA is not available on this chain
 */
export function getDA(chain: NetworkId = "testnet"): string {
  const network = NETWORKS[chain];
  if (!network?.daUrl) {
    throw new Error(`0G DA only available on testnet. Chain: ${chain}`);
  }
  return network.daUrl;
}

/**
 * Get full network config with validation
 */
export function getNetworkConfig(chain: NetworkId): NetworkConfig {
  return NETWORKS[chain];
}

/**
 * Get transaction URL for block explorer
 */
export function getTxUrl(chain: NetworkId, txHash: string): string {
  return `${getExplorer(chain)}/tx/${txHash}`;
}

/**
 * Get address URL for block explorer
 */
export function getAddressUrl(chain: NetworkId, address: string): string {
  return `${getExplorer(chain)}/address/${address}`;
}

// =============================================================================
// SERVICE AVAILABILITY MATRIX
// =============================================================================

export const SERVICE_AVAILABILITY = {
  mainnet: {
    storage: true,
    chain: true,
    compute: false,
    da: false,
  },
  testnet: {
    storage: true,
    chain: true,
    compute: true,
    da: true,
  },
} as const;

/**
 * Check if a service is available on a specific chain
 */
export function isServiceAvailable(
  chain: NetworkId,
  service: "storage" | "chain" | "compute" | "da"
): boolean {
  return SERVICE_AVAILABILITY[chain][service];
}

// =============================================================================
// EXPORTS
// =============================================================================

export default NETWORKS;
