// =============================================================================
// DARA FORGE FEATURE FLAGS AND VERIFICATION CONFIG
// =============================================================================

// Feature Flags for enhanced verification
export const VERIFICATION_FEATURES = {
  REAL_STORAGE_VERIFICATION: import.meta.env.VITE_REAL_STORAGE_VERIFY === 'true' || process.env.REAL_STORAGE_VERIFY === 'true' || true,
  MULTI_NODE_DA_FALLBACK: import.meta.env.VITE_MULTI_DA_FALLBACK === 'true' || process.env.MULTI_DA_FALLBACK === 'true' || true,
  CHAIN_ANCHOR_ACTIVITY: import.meta.env.VITE_CHAIN_ACTIVITY === 'true' || process.env.CHAIN_ACTIVITY === 'true' || true,
  COMPUTE_CIRCUIT_BREAKER: import.meta.env.VITE_COMPUTE_BREAKER === 'true' || process.env.COMPUTE_BREAKER === 'true' || true,
  GRACEFUL_DEGRADATION: import.meta.env.VITE_GRACEFUL_DEGRADE === 'true' || process.env.GRACEFUL_DEGRADE === 'true' || true,
} as const;

// DA Endpoints Configuration with fallbacks
export const DA_CONFIG = {
  endpoints: [
    import.meta.env.VITE_OG_DA_ENDPOINT || process.env.OG_DA_ENDPOINT || 'https://da-testnet.0g.ai',
    import.meta.env.VITE_OG_DA_ENDPOINT_2 || process.env.OG_DA_ENDPOINT_2 || 'https://da-indexer-testnet.0g.ai',
    'https://da-rpc-testnet.0g.ai' // Always have a third fallback
  ].filter(Boolean),
  
  retryConfig: {
    maxAttempts: 5,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffFactor: 2,
    jitter: true
  }
} as const;

// Storage Verification Configuration
export const STORAGE_CONFIG = {
  verificationEndpoints: [
    import.meta.env.VITE_OG_INDEXER || process.env.OG_INDEXER || 'https://indexer-storage-testnet-turbo.0g.ai/',
    import.meta.env.VITE_OG_INDEXER_2 || process.env.OG_INDEXER_2 || 'https://indexer-storage-testnet-standard.0g.ai/'
  ].filter(Boolean),
  
  maxFileDownloadSize: 10 * 1024 * 1024, // 10MB max for verification download
  proofTimeout: 30000, // 30 seconds
} as const;

// Compute Circuit Breaker Configuration
export const COMPUTE_CONFIG = {
  circuitBreaker: {
    failureThreshold: 2, // failures before opening circuit
    resetTimeout: 10 * 60 * 1000, // 10 minutes
    monitorWindow: 5 * 60 * 1000, // 5 minute window
  },
  
  endpoints: [
    import.meta.env.VITE_OG_COMPUTE_ENDPOINT || process.env.OG_COMPUTE_ENDPOINT || 'https://compute-testnet.0g.ai'
  ].filter(Boolean),
  
  gracefulDegradation: {
    allowPartialVerification: true,
    showMaintenanceMessage: true,
    enableRetryLater: true
  }
} as const;

// Verification timeouts and retry logic
export const VERIFICATION_CONFIG = {
  timeouts: {
    storage: 15000, // 15 seconds
    da: 30000, // 30 seconds (DA can be slower)
    chain: 10000, // 10 seconds
    compute: 45000, // 45 seconds (TEE attestation can be slow)
  },
  
  retryStrategies: {
    exponentialBackoff: true,
    maxRetries: 3,
    baseDelay: 1000
  }
} as const;