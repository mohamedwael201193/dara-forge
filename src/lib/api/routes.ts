// =============================================================================
// API ROUTES - CANONICAL ALLOWLIST
// =============================================================================
// Single source of truth for all DARA API endpoints
// Any route not listed here will fail at compile time

/**
 * Allowlisted API routes for DARA backend
 * @see https://dara-api.onrender.com
 */
export const ApiRoutes = {
  // Health & System
  Health: "/health",

  // Storage Operations
  StorageUpload: "/api/storage/upload",
  StorageDownload: "/api/storage/download",
  StorageResolve: "/api/storage/resolve",
  PutStorage: "/v1/storage/put",
  GetEncryptedBytes: "/v1/storage/bytes",

  // Data Availability
  DAPublish: "/api/da",
  DAVerify: "/api/da/verify",

  // Compute Operations
  ComputeRequest: "/api/compute",
  ComputeStatus: "/api/compute/status",

  // Blockchain Anchoring
  Anchor: "/api/anchor",
  AnchorVerify: "/api/anchor/verify",

  // Oracle & Transfer (ERC-7857)
  PrepareTransfer: "/v1/oracle/prepare-transfer",
  VerifyTransfer: "/v1/oracle/verify-transfer",

  // Research iNFT Operations
  MintINFT: "/api/inft/mint",
  VerifyINFT: "/api/inft/verify",
  TransferINFT: "/api/inft/transfer",
  GetINFTMetadata: "/api/inft/metadata",
} as const;

/**
 * Type-safe API route keys
 * Use this type to ensure only valid routes are referenced
 */
export type ApiRouteKey = keyof typeof ApiRoutes;

/**
 * Type-safe API route values
 */
export type ApiRouteValue = (typeof ApiRoutes)[ApiRouteKey];

/**
 * Get route path by key (compile-time checked)
 */
export function getRoute(key: ApiRouteKey): ApiRouteValue {
  return ApiRoutes[key];
}

/**
 * Validate that a string is a known API route
 */
export function isValidRoute(path: string): path is ApiRouteValue {
  return Object.values(ApiRoutes).includes(path as ApiRouteValue);
}

/**
 * Type guard for route keys
 */
export function isValidRouteKey(key: string): key is ApiRouteKey {
  return key in ApiRoutes;
}

// =============================================================================
// ROUTE METADATA
// =============================================================================

export const RouteMetadata = {
  [ApiRoutes.Health]: { method: "GET", auth: false },
  [ApiRoutes.StorageUpload]: { method: "POST", auth: false },
  [ApiRoutes.StorageDownload]: { method: "GET", auth: false },
  [ApiRoutes.StorageResolve]: { method: "GET", auth: false },
  [ApiRoutes.PutStorage]: { method: "PUT", auth: true },
  [ApiRoutes.GetEncryptedBytes]: { method: "GET", auth: true },
  [ApiRoutes.DAPublish]: { method: "POST", auth: false },
  [ApiRoutes.DAVerify]: { method: "POST", auth: false },
  [ApiRoutes.ComputeRequest]: { method: "POST", auth: false },
  [ApiRoutes.ComputeStatus]: { method: "GET", auth: false },
  [ApiRoutes.Anchor]: { method: "POST", auth: false },
  [ApiRoutes.AnchorVerify]: { method: "GET", auth: false },
  [ApiRoutes.PrepareTransfer]: { method: "POST", auth: true },
  [ApiRoutes.VerifyTransfer]: { method: "POST", auth: true },
  [ApiRoutes.MintINFT]: { method: "POST", auth: true },
  [ApiRoutes.VerifyINFT]: { method: "GET", auth: false },
  [ApiRoutes.TransferINFT]: { method: "POST", auth: true },
  [ApiRoutes.GetINFTMetadata]: { method: "GET", auth: false },
} as const;

export default ApiRoutes;
