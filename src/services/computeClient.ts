// Simple compute client using consolidated API
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

export interface ComputeHealthResponse {
  ok: boolean;
  timestamp?: string;
  ledger?: {
    status: string;
    availableBalance: string;
    unit: string;
  };
  providers?: {
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
  environment?: {
    chainId: string;
    rpcUrl: string;
  };
}

export interface ComputeStatus {
  ok: boolean;
  ledger?: any;
  servicesCount?: number;
  error?: string;
}

export interface AnalysisResult {
  ok: boolean;
  model?: string;
  provider?: string;
  root?: string | null;
  verified?: boolean;
  content?: string;
  usage?: any;
  ts?: number;
  error?: string;
}

export const computeClient = {
  async getComputeHealth(): Promise<ComputeStatus> {
    const response = await fetch("/api/compute?action=health");
    return response.json();
  },

  async health(): Promise<ComputeHealthResponse> {
    const response = await fetch("/api/compute?action=health");
    const data = await response.json();
    return {
      ok: data.ok,
      timestamp: new Date().toISOString(),
      ledger: data.ledger ? {
        status: data.ledger.balance ? 'active' : 'inactive',
        availableBalance: data.ledger.balance || '0',
        unit: 'ETH'
      } : undefined,
      providers: {
        healthy: data.servicesCount || 0,
        total: data.servicesCount || 0,
        details: []
      },
      environment: {
        chainId: '16602',
        rpcUrl: 'https://evmrpc-testnet.0g.ai'
      }
    };
  },

  async chat(request: ComputeRequest): Promise<{ content: string; provider: string; model: string; verified: boolean; usage?: any; raw?: any }> {
    const response = await fetch("/api/compute?action=analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: request.messages[request.messages.length - 1]?.content || '',
        model: request.model
      })
    });
    
    const result = await response.json();
    
    if (!result.ok || !result.jobId) {
      throw new Error(result.error || 'Chat request failed');
    }
    
    // Poll for result
    let attempts = 0;
    while (attempts < 30) { // Max 30 attempts (90 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      const pollResult = await this.pollResult(result.jobId);
      
      if (pollResult.ok && pollResult.content) {
        return {
          content: pollResult.content,
          provider: pollResult.provider || 'unknown',
          model: pollResult.model || request.model,
          verified: pollResult.verified || false,
          usage: pollResult.usage,
          raw: pollResult
        };
      }
      
      if (pollResult.error) {
        throw new Error(pollResult.error);
      }
      
      attempts++;
    }
    
    throw new Error('Chat request timed out');
  },

  async startAnalysis(text: string, options: { root?: string; model?: string; temperature?: number } = {}): Promise<{ ok: boolean; jobId?: string; error?: string }> {
    const response = await fetch("/api/compute?action=analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, ...options })
    });
    return response.json();
  },

  async pollResult(jobId: string): Promise<AnalysisResult> {
    const response = await fetch(`/api/compute?action=result&id=${jobId}`);
    return response.json();
  }
};

