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

export async function checkHealth(): Promise<HealthCheckResult> {
  try {
    const response = await fetch('/api/storage-utils?action=health');
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

