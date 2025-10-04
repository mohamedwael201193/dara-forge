// Updated compute client for real 0G integration
export interface AnalysisRequest {
  analysisContext: string;
  rootHash?: string;
  model?: string;
}

export interface AnalysisResult {
  id: string;
  result: string;
  verified: boolean;
  provider: string;
  model: string;
  duration: string;
}

export interface HealthStatus {
  status: string;
  network?: {
    connected: boolean;
    walletBalance: string;
    contractsWorking: boolean;
  };
  servicesCount: number;
  services: Array<{
    provider: string;
    model: string;
    verifiability: string;
  }>;
}

export interface AnalysisError {
  message: string;
}

class ComputeClient {
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch('/api/compute?action=health');
    
    if (!response.ok) {
      const error = await response.json() as AnalysisError;
      throw new Error(error.message || 'Failed to get health status');
    }
    
    return response.json();
  }

  async startAnalysis(analysisContext: string, options?: { root?: string; model?: string }): Promise<AnalysisResult> {
    const requestBody: AnalysisRequest = {
      analysisContext,
      rootHash: options?.root,
      model: options?.model
    };

    const response = await fetch('/api/compute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Analysis failed');
    }

    return response.json();
  }
}

export const computeClient = new ComputeClient();