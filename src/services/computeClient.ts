// Simple compute client using consolidated API
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

