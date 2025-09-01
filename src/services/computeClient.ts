export interface ComputeRequest {
  model: 'llama-3.3-70b-instruct' | 'deepseek-r1-70b';
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  tokenId?: string;
  datasetRef?: string;
}

export interface ComputeResponse {
  content: string;
  provider: string;
  model: string;
  verified: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  raw?: any;
}

export interface ComputeHealthResponse {
  ok: boolean;
  timestamp: string;
  ledger: {
    status: string;
    availableBalance: string;
    unit: string;
  };
  providers: {
    healthy: number;
    total: number;
    details: Array<{
      model: string;
      address: string;
      endpoint: string;
      healthy: boolean;
      name: string;
      error?: string;
    }>;
  };
  environment: {
    chainId: string;
    rpcUrl: string;
  };
}

export class ComputeClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async chat(request: ComputeRequest): Promise<ComputeResponse> {
    const response = await fetch(`${this.baseUrl}/api/compute/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async chatStream(
    request: ComputeRequest,
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compute/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }
        onComplete?.();
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }

  async health(): Promise<ComputeHealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/compute/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Default client instance
export const computeClient = new ComputeClient();

// Helper function for simple chat requests
export async function runInference(
  model: ComputeRequest['model'],
  messages: ComputeRequest['messages'],
  options?: {
    stream?: boolean;
    tokenId?: string;
    datasetRef?: string;
  }
): Promise<ComputeResponse> {
  return computeClient.chat({
    model,
    messages,
    ...options,
  });
}

