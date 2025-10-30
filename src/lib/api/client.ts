// =============================================================================
// TYPE-SAFE API CLIENT WITH COMPILE-TIME ROUTE VALIDATION
// =============================================================================
// Enforces that only allowlisted routes can be called
// Provides Zod validation for all responses
// Implements exponential backoff for retries

import { z } from "zod";
import { ApiRoutes, type ApiRouteKey } from "./routes";

// =============================================================================
// RESPONSE SCHEMAS
// =============================================================================

const HealthResponseSchema = z.object({
  ok: z.boolean(),
  status: z.string().optional(),
  timestamp: z.number().optional(),
});

const StorageResponseSchema = z.object({
  ok: z.boolean(),
  root: z.string().optional(),
  manifest: z
    .object({
      files: z.array(
        z.object({
          name: z.string(),
          size: z.number(),
          root: z.string(),
        })
      ),
    })
    .optional(),
  error: z.string().optional(),
});

const DAResponseSchema = z.object({
  ok: z.boolean(),
  blobHash: z.string().optional(),
  dataRoot: z.string().optional(),
  txHash: z.string().optional(),
  verified: z.boolean().optional(),
  error: z.string().optional(),
});

const ComputeResponseSchema = z.object({
  ok: z.boolean(),
  answer: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  verified: z.boolean().optional(),
  chatID: z.string().optional(),
  attestation: z.string().optional(),
  error: z.string().optional(),
});

const AnchorResponseSchema = z.object({
  ok: z.boolean(),
  txHash: z.string().optional(),
  blockNumber: z.number().optional(),
  error: z.string().optional(),
});

const TransferPrepareResponseSchema = z.object({
  ok: z.boolean(),
  attestation: z.object({
    tokenId: z.string(),
    from: z.string(),
    to: z.string(),
    newHash: z.string(),
    newURI: z.string(),
    issuedAt: z.number(),
    signature: z.string(),
  }),
  error: z.string().optional(),
});

const INFTResponseSchema = z.object({
  ok: z.boolean(),
  tokenId: z.string().optional(),
  txHash: z.string().optional(),
  metadata: z
    .object({
      name: z.string(),
      description: z.string(),
      image: z.string().optional(),
      attributes: z.array(z.any()).optional(),
    })
    .optional(),
  error: z.string().optional(),
});

// =============================================================================
// RESPONSE TYPE MAP
// =============================================================================

type ResponseSchemaMap = {
  [ApiRoutes.Health]: typeof HealthResponseSchema;
  [ApiRoutes.StorageUpload]: typeof StorageResponseSchema;
  [ApiRoutes.StorageDownload]: typeof StorageResponseSchema;
  [ApiRoutes.StorageResolve]: typeof StorageResponseSchema;
  [ApiRoutes.PutStorage]: typeof StorageResponseSchema;
  [ApiRoutes.GetEncryptedBytes]: typeof StorageResponseSchema;
  [ApiRoutes.DAPublish]: typeof DAResponseSchema;
  [ApiRoutes.DAVerify]: typeof DAResponseSchema;
  [ApiRoutes.ComputeRequest]: typeof ComputeResponseSchema;
  [ApiRoutes.ComputeStatus]: typeof ComputeResponseSchema;
  [ApiRoutes.Anchor]: typeof AnchorResponseSchema;
  [ApiRoutes.AnchorVerify]: typeof AnchorResponseSchema;
  [ApiRoutes.PrepareTransfer]: typeof TransferPrepareResponseSchema;
  [ApiRoutes.VerifyTransfer]: typeof INFTResponseSchema;
  [ApiRoutes.MintINFT]: typeof INFTResponseSchema;
  [ApiRoutes.VerifyINFT]: typeof INFTResponseSchema;
  [ApiRoutes.TransferINFT]: typeof INFTResponseSchema;
  [ApiRoutes.GetINFTMetadata]: typeof INFTResponseSchema;
};

const RESPONSE_SCHEMAS: ResponseSchemaMap = {
  [ApiRoutes.Health]: HealthResponseSchema,
  [ApiRoutes.StorageUpload]: StorageResponseSchema,
  [ApiRoutes.StorageDownload]: StorageResponseSchema,
  [ApiRoutes.StorageResolve]: StorageResponseSchema,
  [ApiRoutes.PutStorage]: StorageResponseSchema,
  [ApiRoutes.GetEncryptedBytes]: StorageResponseSchema,
  [ApiRoutes.DAPublish]: DAResponseSchema,
  [ApiRoutes.DAVerify]: DAResponseSchema,
  [ApiRoutes.ComputeRequest]: ComputeResponseSchema,
  [ApiRoutes.ComputeStatus]: ComputeResponseSchema,
  [ApiRoutes.Anchor]: AnchorResponseSchema,
  [ApiRoutes.AnchorVerify]: AnchorResponseSchema,
  [ApiRoutes.PrepareTransfer]: TransferPrepareResponseSchema,
  [ApiRoutes.VerifyTransfer]: INFTResponseSchema,
  [ApiRoutes.MintINFT]: INFTResponseSchema,
  [ApiRoutes.VerifyINFT]: INFTResponseSchema,
  [ApiRoutes.TransferINFT]: INFTResponseSchema,
  [ApiRoutes.GetINFTMetadata]: INFTResponseSchema,
};

// =============================================================================
// RETRY CONFIGURATION
// =============================================================================

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [429, 500, 502, 503, 504],
};

// =============================================================================
// API CLIENT
// =============================================================================

export interface ApiClientConfig {
  baseUrl?: string;
  retryConfig?: Partial<RetryConfig>;
  headers?: HeadersInit;
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipValidation?: boolean;
}

/**
 * Exponential backoff delay calculator
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type-safe API client with route allowlisting and Zod validation
 */
export class ApiClient {
  private baseUrl: string;
  private retryConfig: RetryConfig;
  private defaultHeaders: HeadersInit;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl =
      config.baseUrl ||
      import.meta.env.VITE_API_BASE_URL ||
      (import.meta.env.DEV
        ? "http://localhost:3001"
        : "https://dara-api.onrender.com");

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retryConfig,
    };

    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  /**
   * Fetch with automatic retries and exponential backoff
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt = 0
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);

      // Success
      if (response.ok) {
        return response;
      }

      // Check if retryable
      const shouldRetry =
        this.retryConfig.retryableStatuses.includes(response.status) &&
        attempt < this.retryConfig.maxRetries;

      if (shouldRetry) {
        const delay = calculateDelay(attempt, this.retryConfig);
        console.warn(
          `API request failed with ${
            response.status
          }. Retrying in ${delay}ms (attempt ${attempt + 1}/${
            this.retryConfig.maxRetries
          })...`
        );
        await sleep(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      // Non-retryable error
      return response;
    } catch (error) {
      // Network error - retry if attempts remaining
      if (attempt < this.retryConfig.maxRetries) {
        const delay = calculateDelay(attempt, this.retryConfig);
        console.warn(
          `Network error. Retrying in ${delay}ms (attempt ${attempt + 1}/${
            this.retryConfig.maxRetries
          })...`
        );
        await sleep(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Type-safe fetch with compile-time route validation
   */
  async fetchJson<K extends ApiRouteKey>(
    routeKey: K,
    options: FetchOptions = {}
  ): Promise<z.infer<ResponseSchemaMap[(typeof ApiRoutes)[K]]>> {
    // Get route path (compile-time checked)
    const route = ApiRoutes[routeKey];

    // Build URL with query params
    let url = `${this.baseUrl}${route}`;
    if (options.params) {
      const params = new URLSearchParams(
        Object.entries(options.params).map(([k, v]) => [k, String(v)])
      );
      url += `?${params}`;
    }

    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Make request with retry logic
    const response = await this.fetchWithRetry(url, {
      ...options,
      headers,
    });

    // Parse JSON
    const data = await response.json();

    // Validate response (unless explicitly skipped)
    if (!options.skipValidation) {
      const schema = RESPONSE_SCHEMAS[route];
      return schema.parse(data);
    }

    return data;
  }

  /**
   * GET request helper
   */
  async get<K extends ApiRouteKey>(
    routeKey: K,
    options: Omit<FetchOptions, "method" | "body"> = {}
  ) {
    return this.fetchJson(routeKey, { ...options, method: "GET" });
  }

  /**
   * POST request helper
   */
  async post<K extends ApiRouteKey>(
    routeKey: K,
    body?: any,
    options: Omit<FetchOptions, "method" | "body"> = {}
  ) {
    return this.fetchJson(routeKey, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<K extends ApiRouteKey>(
    routeKey: K,
    body?: any,
    options: Omit<FetchOptions, "method" | "body"> = {}
  ) {
    return this.fetchJson(routeKey, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

/**
 * Create API client with optional custom config
 */
export function createApiClient(config?: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

/**
 * Default singleton instance
 */
export const apiClient = createApiClient();

// =============================================================================
// EXPORTS
// =============================================================================

export default apiClient;
export {
  AnchorResponseSchema,
  ComputeResponseSchema,
  DAResponseSchema,
  HealthResponseSchema,
  INFTResponseSchema,
  StorageResponseSchema,
  TransferPrepareResponseSchema,
};
export type { ResponseSchemaMap };
