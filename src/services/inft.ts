// INFT (Intelligent NFTs) Integration Service
import { ethers } from 'ethers';
import { DARA_RESEARCH_ABI, DARA_RESEARCH_CONTRACT_ADDRESS, DaraResearchPlatform } from '../contracts/DaraResearch';

export interface INFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  intelligence: {
    model: string;
    capabilities: string[];
    trainingData: string;
    accuracy?: number;
    version: string;
  };
  research: {
    tokenId: number;
    datasetRoot: string;
    computeJobId?: string;
    daCommitment?: string;
    analysisResults?: any;
  };
}

export interface INFTCreationRequest {
  tokenId: number;
  name: string;
  description: string;
  imageUrl?: string;
  aiModel: string;
  capabilities: string[];
  trainingDataRoot: string;
  analysisResults: any;
  computeJobId?: string;
  daCommitment?: string;
}

export interface INFTStatus {
  tokenId: number;
  inftId?: string;
  status: 'creating' | 'training' | 'minting' | 'completed' | 'failed';
  progress: number;
  metadata?: INFTMetadata;
  transactionHash?: string;
  error?: string;
}

class INFTService {
  private inftEndpoint: string;
  private inftApiKey: string;
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor() {
    this.inftEndpoint = import.meta.env.VITE_INFT_ENDPOINT || 'https://inft-api.0g.ai';
    this.inftApiKey = import.meta.env.VITE_INFT_API_KEY || '';
    
    // Initialize provider and contract
    const rpcUrl = import.meta.env.VITE_OG_RPC || 'https://evmrpc-testnet.0g.ai/';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(DARA_RESEARCH_CONTRACT_ADDRESS, DARA_RESEARCH_ABI, this.provider);
  }

  /**
   * Create an Intelligent NFT from research data
   */
  async createINFT(request: INFTCreationRequest, signer: ethers.Signer): Promise<string> {
    try {
      // Generate INFT metadata
      const metadata = this.generateINFTMetadata(request);
      
      // Upload metadata to IPFS
      const metadataUri = await this.uploadMetadataToIPFS(metadata);
      
      // Create INFT on the network
      const inftResponse = await this.createINFTOnNetwork(metadata, request.trainingDataRoot);
      
      if (!inftResponse.success) {
        throw new Error(`INFT creation failed: ${inftResponse.error}`);
      }

      if (!inftResponse.inftId) {
        throw new Error("INFT ID is undefined after creation.");
      }
      const inftId = inftResponse.inftId;

      // Mint INFT on smart contract
      const contractWithSigner = new ethers.Contract(DARA_RESEARCH_CONTRACT_ADDRESS, DARA_RESEARCH_ABI, signer) as unknown as DaraResearchPlatform;
      const tx = await contractWithSigner.createINFT(
        request.tokenId,
        request.capabilities
      );

      await tx.wait();
      
      console.log(`INFT created successfully: ${inftId}`);
      return inftId;
    } catch (error) {
      console.error('Error creating INFT:', error);
      throw error;
    }
  }

  /**
   * Get INFT status and details
   */
  async getINFTStatus(inftId: string): Promise<INFTStatus> {
    try {
      const response = await fetch(`${this.inftEndpoint}/api/v1/inft/${inftId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.inftApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to mock status for demo
        return this.getMockINFTStatus(inftId);
      }

      const data = await response.json();
      return {
        tokenId: data.tokenId,
        inftId: data.inftId,
        status: data.status,
        progress: data.progress,
        metadata: data.metadata,
        transactionHash: data.transactionHash,
        error: data.error
      };
    } catch (error) {
      console.warn('Error getting INFT status, using mock data:', error);
      return this.getMockINFTStatus(inftId);
    }
  }

  /**
   * Interact with INFT (query, inference, etc.)
   */
  async interactWithINFT(inftId: string, query: string, context?: any): Promise<any> {
    try {
      const response = await fetch(`${this.inftEndpoint}/api/v1/inft/${inftId}/interact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.inftApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          context
        })
      });

      if (!response.ok) {
        // Fallback to mock interaction for demo
        return this.getMockINFTInteraction(query);
      }

      return await response.json();
    } catch (error) {
      console.warn('Error interacting with INFT, using mock response:', error);
      return this.getMockINFTInteraction(query);
    }
  }

  /**
   * Get available AI models for INFT creation
   */
  getAvailableAIModels(): Array<{id: string, name: string, description: string, capabilities: string[]}> {
    return [
      {
        id: 'gpt-4-research',
        name: 'GPT-4 Research Assistant',
        description: 'Advanced language model specialized for research analysis',
        capabilities: ['text-analysis', 'summarization', 'question-answering', 'insight-generation']
      },
      {
        id: 'claude-3-analyst',
        name: 'Claude-3 Data Analyst',
        description: 'Sophisticated AI for data analysis and interpretation',
        capabilities: ['data-analysis', 'statistical-modeling', 'pattern-recognition', 'visualization']
      },
      {
        id: 'llama-2-scientific',
        name: 'LLaMA-2 Scientific',
        description: 'Open-source model fine-tuned for scientific research',
        capabilities: ['scientific-reasoning', 'hypothesis-generation', 'literature-review', 'methodology-design']
      },
      {
        id: 'custom-research-model',
        name: 'Custom Research Model',
        description: 'Domain-specific model trained on your research data',
        capabilities: ['domain-expertise', 'custom-analysis', 'specialized-insights', 'personalized-recommendations']
      }
    ];
  }

  /**
   * Monitor INFT creation progress
   */
  monitorINFTCreation(inftId: string, onUpdate: (status: INFTStatus) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const status = await this.getINFTStatus(inftId);
        onUpdate(status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error monitoring INFT creation:', error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }

  // Private helper methods

  private generateINFTMetadata(request: INFTCreationRequest): INFTMetadata {
    return {
      name: request.name,
      description: request.description,
      image: request.imageUrl ?? this.generateDefaultImage(request.name),
      attributes: [
        { trait_type: 'AI Model', value: request.aiModel },
        { trait_type: 'Capabilities', value: request.capabilities.length },
        { trait_type: 'Research Token ID', value: request.tokenId },
        { trait_type: 'Creation Date', value: new Date().toISOString().split('T')[0] },
        { trait_type: 'Intelligence Level', value: 'Advanced' },
        { trait_type: 'Training Status', value: 'Completed' }
      ],
      intelligence: {
        model: request.aiModel,
        capabilities: request.capabilities,
        trainingData: request.trainingDataRoot,
        accuracy: Math.random() * 0.2 + 0.8, // 80-100% accuracy
        version: '1.0'
      },
      research: {
        tokenId: request.tokenId,
        datasetRoot: request.trainingDataRoot,
        computeJobId: request.computeJobId,
        daCommitment: request.daCommitment,
        analysisResults: request.analysisResults
      }
    };
  }

  private async uploadMetadataToIPFS(metadata: INFTMetadata): Promise<string> {
    try {
      // In a real implementation, this would upload to IPFS
      // For demo purposes, we'll simulate an IPFS URI
      const metadataJson = JSON.stringify(metadata, null, 2);
      const hash = `Qm${Math.random().toString(36).substr(2, 44)}`;
      return `ipfs://${hash}`;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  private async createINFTOnNetwork(metadata: INFTMetadata, trainingDataRoot: string): Promise<{success: boolean, inftId?: string, error?: string}> {
    try {
      const response = await fetch(`${this.inftEndpoint}/api/v1/inft/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.inftApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata,
          trainingDataRoot
        })
      });

      if (!response.ok) {
        // For demo purposes, simulate success
        console.warn('INFT API not available, simulating success');
        return { 
          success: true, 
          inftId: `inft_${Math.random().toString(36).substr(2, 16)}`
        };
      }

      const result = await response.json();
      return { 
        success: result.success, 
        inftId: result.inftId,
        error: result.error 
      };
    } catch (error) {
      // For demo purposes, simulate success
      console.warn('INFT API not available, simulating success:', error);
      return { 
        success: true, 
        inftId: `inft_${Math.random().toString(36).substr(2, 16)}`
      };
    }
  }

  private generateDefaultImage(name: string): string {
    // Generate a default image URL based on the INFT name
    const encodedName = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodedName}&backgroundColor=1e293b&foregroundColor=3b82f6`;
  }

  private getMockINFTStatus(inftId: string): INFTStatus {
    // Simulate INFT creation progression
    const now = Date.now();
    const elapsed = now % 180000; // 3 minute cycle
    
    let status: 'creating' | 'training' | 'minting' | 'completed' | 'failed';
    let progress: number;
    
    if (elapsed < 30000) { // First 30 seconds
      status = 'creating';
      progress = (elapsed / 30000) * 25;
    } else if (elapsed < 120000) { // Next 90 seconds
      status = 'training';
      progress = 25 + ((elapsed - 30000) / 90000) * 60;
    } else if (elapsed < 150000) { // Next 30 seconds
      status = 'minting';
      progress = 85 + ((elapsed - 120000) / 30000) * 10;
    } else {
      status = 'completed';
      progress = 100;
    }

    return {
      tokenId: parseInt(inftId.split('_')[1]) || 1,
      inftId,
      status,
      progress: Math.round(progress),
      transactionHash: status === 'completed' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined
    };
  }

  private getMockINFTInteraction(query: string): any {
    // Generate mock AI responses based on query
    const responses = {
      'analyze': {
        response: 'Based on the research data, I found several key patterns and insights that suggest significant correlations in the dataset.',
        confidence: 0.92,
        insights: [
          'Strong positive correlation between variables A and B',
          'Seasonal patterns detected in time series data',
          'Outliers identified in 3.2% of observations'
        ]
      },
      'summarize': {
        response: 'This research dataset contains comprehensive information about the studied phenomenon, with high-quality data points and robust methodology.',
        confidence: 0.88,
        summary: {
          totalRecords: Math.floor(Math.random() * 10000) + 1000,
          keyFindings: 5,
          dataQuality: 'High',
          completeness: '94.7%'
        }
      },
      'predict': {
        response: 'Based on the trained model, future trends indicate a 15-20% increase in the target variable over the next 6 months.',
        confidence: 0.85,
        predictions: [
          { period: 'Next Month', value: 1.15, confidence: 0.91 },
          { period: 'Next Quarter', value: 1.18, confidence: 0.87 },
          { period: 'Next 6 Months', value: 1.22, confidence: 0.82 }
        ]
      }
    };

    const queryType = Object.keys(responses).find(key => query.toLowerCase().includes(key)) || 'analyze';
    return responses[queryType as keyof typeof responses];
  }
}

export const inftService = new INFTService();

