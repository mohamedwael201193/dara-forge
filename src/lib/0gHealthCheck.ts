export interface HealthCheckResult {
  ok: boolean;
  rpc: Array<{
    url: string;
    chainId?: number;
    block?: number;
    ok: boolean;
    err?: string;
  }>;
  indexers: Array<{
    url: string;
  }>;
}

import { apiUrl } from "./api.js";

export async function checkHealth(): Promise<HealthCheckResult> {
  try {
    const response = await fetch(apiUrl("api/storage-utils?action=health"));
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      ok: false,
      rpc: [],
      indexers: [],
    };
  }
}
