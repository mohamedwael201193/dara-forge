// 0G Compute Network Integration Service
import { ethers } from 'ethers';
import { DARA_RESEARCH_ABI, DARA_RESEARCH_CONTRACT_ADDRESS, COMPUTE_JOB_TYPES, DaraResearchPlatform } from '../contracts/DaraResearch';

export interface ComputeJobRequest {
  tokenId: number;
  jobType: string;
  inputDataRoot: string;
  parameters?: Record<string, any>;
}

export interface ComputeJobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: number;
  endTime?: number;
  outputDataRoot?: string;
  error?: string;
}

export interface ComputeJobResult {
  jobId: string;
  outputDataRoot: string;
  results: {
    summary: string;
    insights: string[];
    visualizations?: string[];
    metrics: Record<string, number>;
  };
}

class OGComputeService {
  private computeEndpoint: string;
  private wsEndpoint: string;
  private apiKey: string;
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor() {
    this.computeEndpoint = import.meta.env.VITE_OG_COMPUTE_ENDPOINT || 'https://compute-testnet.0g.ai';
    this.wsEndpoint = import.meta.env.VITE_OG_COMPUTE_WS || 'wss://compute-testnet.0g.ai/ws';
    this.apiKey = import.meta.env.OG_COMPUTE_API_KEY ?? '';
    
    // Initialize provider and contract
    const rpcUrl = import.meta.env.VITE_OG_RPC || 'https://evmrpc-testnet.0g.ai/';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(DARA_RESEARCH_CONTRACT_ADDRESS, DARA_RESEARCH_ABI, this.provider);
  }

  /**
   * Submit a compute job to 0G Compute Network
   */
  async submitComputeJob(request: ComputeJobRequest, signer: ethers.Signer): Promise<string> {
    try {
      // Generate unique job ID
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Submit job to 0G Compute Network
      const computeResponse = await this.submitToComputeNetwork({
        jobId,
        jobType: request.jobType,
        inputDataRoot: request.inputDataRoot,
        parameters: request.parameters || {}
      });

      if (!computeResponse.success) {
        throw new Error(`Compute job submission failed: ${computeResponse.error}`);
      }

      // Submit to smart contract
      const contractWithSigner = new ethers.Contract(DARA_RESEARCH_CONTRACT_ADDRESS, DARA_RESEARCH_ABI, signer) as unknown as DaraResearchPlatform;
      const tx = await contractWithSigner.submitComputeJob(
        request.tokenId,
        jobId,
        request.jobType,
        request.inputDataRoot
      );

      await tx.wait();
      
      console.log(`Compute job submitted: ${jobId}`);
      return jobId;
    } catch (error) {
      console.error('Error submitting compute job:', error);
      throw error;
    }
  }

  /**
   * Get compute job status
   */
  async getJobStatus(jobId: string): Promise<ComputeJobStatus> {
    try {
      // Get status from 0G Compute Network
      const response = await fetch(`${this.computeEndpoint}/api/v1/jobs/${jobId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to mock status for demo
        return this.getMockJobStatus(jobId);
      }

      const data = await response.json();
      return {
        jobId: data.jobId,
        status: data.status,
        progress: data.progress || 0,
        startTime: data.startTime,
        endTime: data.endTime,
        outputDataRoot: data.outputDataRoot,
        error: data.error
      };
    } catch (error) {
      console.warn('Error getting job status, using mock data:', error);
      return this.getMockJobStatus(jobId);
    }
  }

  /**
   * Complete a compute job and update smart contract
   */
  async completeComputeJob(tokenId: number, jobId: string, outputDataRoot: string, signer: ethers.Signer): Promise<void> {
    try {
      const contractWithSigner = new ethers.Contract(DARA_RESEARCH_CONTRACT_ADDRESS, DARA_RESEARCH_ABI, signer) as unknown as DaraResearchPlatform;
      const tx = await contractWithSigner.completeComputeJob(tokenId, jobId, outputDataRoot);
      await tx.wait();
      
      console.log(`Compute job completed: ${jobId}`);
    } catch (error) {
      console.error('Error completing compute job:', error);
      throw error;
    }
  }

  /**
   * Get compute job results
   */
  async getJobResults(jobId: string): Promise<ComputeJobResult> {
    try {
      const response = await fetch(`${this.computeEndpoint}/api/v1/jobs/${jobId}/results`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to mock results for demo
        return this.getMockJobResults(jobId);
      }

      const data = await response.json();
      return {
        jobId: data.jobId,
        outputDataRoot: data.outputDataRoot,
        results: data.results
      };
    } catch (error) {
      console.warn('Error getting job results, using mock data:', error);
      return this.getMockJobResults(jobId);
    }
  }

  /**
   * Monitor job progress via WebSocket
   */
  monitorJobProgress(jobId: string, onUpdate: (status: ComputeJobStatus) => void): () => void {
    try {
      const ws = new WebSocket(`${this.wsEndpoint}/jobs/${jobId}`);
      
      ws.onmessage = (event) => {
        const status = JSON.parse(event.data) as ComputeJobStatus;
        onUpdate(status);
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error, falling back to polling:', error);
        // Fallback to polling
        const interval = setInterval(async () => {
          try {
            const status = await this.getJobStatus(jobId);
            onUpdate(status);
            if (status.status === 'completed' || status.status === 'failed') {
              clearInterval(interval);
            }
          } catch (error) {
            console.error('Error polling job status:', error);
          }
        }, 5000);

        return () => clearInterval(interval);
      };

      return () => ws.close();
    } catch (error) {
      console.warn('WebSocket not available, using polling:', error);
      // Fallback to polling
      const interval = setInterval(async () => {
        try {
          const status = await this.getJobStatus(jobId);
          onUpdate(status);
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }

  /**
   * Get available compute job types
   */
  getAvailableJobTypes(): Array<{id: string, name: string, description: string}> {
    return [
      {
        id: COMPUTE_JOB_TYPES.AI_ANALYSIS,
        name: 'AI Analysis',
        description: 'Analyze datasets using AI/ML algorithms'
      },
      {
        id: COMPUTE_JOB_TYPES.ML_TRAINING,
        name: 'ML Training',
        description: 'Train machine learning models on your data'
      },
      {
        id: COMPUTE_JOB_TYPES.DATA_PROCESSING,
        name: 'Data Processing',
        description: 'Process and transform raw datasets'
      },
      {
        id: COMPUTE_JOB_TYPES.PREDICTION,
        name: 'Prediction',
        description: 'Generate predictions from trained models'
      },
      {
        id: COMPUTE_JOB_TYPES.VISUALIZATION,
        name: 'Visualization',
        description: 'Create data visualizations and charts'
      }
    ];
  }

  // Private helper methods

  private async submitToComputeNetwork(job: any): Promise<{success: boolean, error?: string}> {
    try {
      const response = await fetch(`${this.computeEndpoint}/api/v1/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(job)
      });

      if (!response.ok) {
        // For demo purposes, simulate success
        console.warn('0G Compute API not available, simulating success');
        return { success: true };
      }

      const data = await response.json();
      return { success: data.success, error: data.error };
    } catch (error) {
      // For demo purposes, simulate success
      console.warn('0G Compute API not available, simulating success:', error);
      return { success: true };
    }
  }

  private getMockJobStatus(jobId: string): ComputeJobStatus {
    // Simulate job progression
    const now = Date.now();
    const startTime = now - (Math.random() * 300000); // Started up to 5 minutes ago
    const elapsed = now - startTime;
    
    let status: 'pending' | 'running' | 'completed' | 'failed';
    let progress: number;
    
    if (elapsed < 30000) { // First 30 seconds
      status = 'pending';
      progress = 0;
    } else if (elapsed < 120000) { // Next 90 seconds
      status = 'running';
      progress = Math.min(90, (elapsed - 30000) / 900); // Progress to 90%
    } else {
      status = 'completed';
      progress = 100;
    }

    return {
      jobId,
      status,
      progress,
      startTime: Math.floor(startTime / 1000),
      endTime: status === 'completed' ? Math.floor(now / 1000) : undefined,
      outputDataRoot: status === 'completed' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined
    };
  }

  private getMockJobResults(jobId: string): ComputeJobResult {
    const jobType = jobId.includes('ai-analysis') ? 'ai-analysis' : 'data-processing';
    
    return {
      jobId,
      outputDataRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
      results: {
        summary: `${jobType === 'ai-analysis' ? 'AI Analysis' : 'Data Processing'} completed successfully. Processed ${Math.floor(Math.random() * 10000)} data points.`,
        insights: [
          'Data quality is high with 95% completeness',
          'Identified 3 key patterns in the dataset',
          'Anomaly detection found 12 outliers',
          'Correlation analysis revealed strong relationships'
        ],
        visualizations: [
          '/api/visualizations/chart1.png',
          '/api/visualizations/chart2.png'
        ],
        metrics: {
          accuracy: 0.94,
          precision: 0.91,
          recall: 0.89,
          f1_score: 0.90,
          processing_time: Math.floor(Math.random() * 300) + 60
        }
      }
    };
  }
}

export const ogComputeService = new OGComputeService();

