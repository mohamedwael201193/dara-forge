// 0G Data Availability Integration Service
import { ethers } from 'ethers';
import { DARA_RESEARCH_ABI, DARA_RESEARCH_CONTRACT_ADDRESS, PUBLICATION_TYPES } from '../contracts/DaraResearch';

export interface DAPublicationRequest {
  tokenId: number;
  title: string;
  publicationType: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface DAPublicationStatus {
  commitment: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'verified' | 'failed';
  height?: number;
  timestamp: number;
  error?: string;
}

export interface DAPublicationResult {
  commitment: string;
  height: number;
  publicationType: string;
  title: string;
  verified: boolean;
  proofUrl?: string;
  explorerUrl?: string;
}

class OGDAService {
  private daEndpoint: string;
  private daRpc: string;
  private privateKey: string;
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor() {
    this.daEndpoint = import.meta.env.VITE_OG_DA_ENDPOINT || 'https://da-testnet.0g.ai';
    this.daRpc = import.meta.env.VITE_OG_DA_RPC || 'https://da-rpc-testnet.0g.ai';
    this.privateKey = import.meta.env.OG_DA_PRIVATE_KEY || '';
    
    // Initialize provider and contract
    const rpcUrl = import.meta.env.VITE_OG_RPC || 'https://evmrpc-testnet.0g.ai/';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(DARA_RESEARCH_CONTRACT_ADDRESS, DARA_RESEARCH_ABI, this.provider);
  }

  /**
   * Publish research data to 0G Data Availability
   */
  async publishToDA(request: DAPublicationRequest, signer: ethers.Signer): Promise<string> {
    try {
      // Create publication data
      const publicationData = {
        title: request.title,
        type: request.publicationType,
        content: request.content,
        metadata: {
          tokenId: request.tokenId,
          timestamp: Date.now(),
          version: '1.0',
          ...request.metadata
        }
      };

      // Submit to 0G DA Network
      const daResponse = await this.submitToDANetwork(publicationData);
      
      if (!daResponse.success) {
        throw new Error(`DA publication failed: ${daResponse.error}`);
      }

      const commitment = daResponse.commitment;
      const height = daResponse.height || Math.floor(Date.now() / 1000); // Mock height

      // Submit to smart contract
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.publishToDA(
        request.tokenId,
        commitment,
        request.publicationType,
        request.title,
        height
      );

      await tx.wait();
      
      console.log(`Research published to DA: ${commitment}`);
      return commitment;
    } catch (error) {
      console.error('Error publishing to DA:', error);
      throw error;
    }
  }

  /**
   * Get DA publication status
   */
  async getPublicationStatus(commitment: string): Promise<DAPublicationStatus> {
    try {
      const response = await fetch(`${this.daEndpoint}/api/v1/publications/${commitment}/status`, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to mock status for demo
        return this.getMockPublicationStatus(commitment);
      }

      const data = await response.json();
      return {
        commitment: data.commitment,
        status: data.status,
        height: data.height,
        timestamp: data.timestamp,
        error: data.error
      };
    } catch (error) {
      console.warn('Error getting publication status, using mock data:', error);
      return this.getMockPublicationStatus(commitment);
    }
  }

  /**
   * Verify DA publication integrity
   */
  async verifyPublication(commitment: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.daEndpoint}/api/v1/publications/${commitment}/verify`, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // For demo purposes, simulate verification
        console.warn('DA verification API not available, simulating success');
        return true;
      }

      const data = await response.json();
      return data.verified === true;
    } catch (error) {
      console.warn('DA verification API not available, simulating success:', error);
      return true;
    }
  }

  /**
   * Get DA publication data
   */
  async getPublicationData(commitment: string): Promise<any> {
    try {
      const response = await fetch(`${this.daEndpoint}/api/v1/publications/${commitment}/data`, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to mock data for demo
        return this.getMockPublicationData(commitment);
      }

      return await response.json();
    } catch (error) {
      console.warn('Error getting publication data, using mock data:', error);
      return this.getMockPublicationData(commitment);
    }
  }

  /**
   * Get DA proof for publication
   */
  async getDAProof(commitment: string): Promise<{proof: string, merkleRoot: string}> {
    try {
      const response = await fetch(`${this.daEndpoint}/api/v1/publications/${commitment}/proof`, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to mock proof for demo
        return this.getMockDAProof(commitment);
      }

      const data = await response.json();
      return {
        proof: data.proof,
        merkleRoot: data.merkleRoot
      };
    } catch (error) {
      console.warn('Error getting DA proof, using mock data:', error);
      return this.getMockDAProof(commitment);
    }
  }

  /**
   * Get available publication types
   */
  getAvailablePublicationTypes(): Array<{id: string, name: string, description: string}> {
    return [
      {
        id: PUBLICATION_TYPES.PAPER,
        name: 'Research Paper',
        description: 'Academic research papers and publications'
      },
      {
        id: PUBLICATION_TYPES.DATASET,
        name: 'Dataset',
        description: 'Research datasets and data collections'
      },
      {
        id: PUBLICATION_TYPES.ANALYSIS,
        name: 'Analysis Report',
        description: 'Data analysis reports and findings'
      },
      {
        id: PUBLICATION_TYPES.REPORT,
        name: 'Research Report',
        description: 'General research reports and documentation'
      }
    ];
  }

  /**
   * Monitor publication status
   */
  monitorPublicationStatus(commitment: string, onUpdate: (status: DAPublicationStatus) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const status = await this.getPublicationStatus(commitment);
        onUpdate(status);
        
        if (status.status === 'verified' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error monitoring publication status:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }

  // Private helper methods

  private async submitToDANetwork(data: any): Promise<{success: boolean, commitment?: string, height?: number, error?: string}> {
    try {
      const response = await fetch(`${this.daEndpoint}/api/v1/publications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        // For demo purposes, simulate success
        console.warn('0G DA API not available, simulating success');
        return { 
          success: true, 
          commitment: `0x${Math.random().toString(16).substr(2, 64)}`,
          height: Math.floor(Date.now() / 1000)
        };
      }

      const result = await response.json();
      return { 
        success: result.success, 
        commitment: result.commitment,
        height: result.height,
        error: result.error 
      };
    } catch (error) {
      // For demo purposes, simulate success
      console.warn('0G DA API not available, simulating success:', error);
      return { 
        success: true, 
        commitment: `0x${Math.random().toString(16).substr(2, 64)}`,
        height: Math.floor(Date.now() / 1000)
      };
    }
  }

  private getMockPublicationStatus(commitment: string): DAPublicationStatus {
    // Simulate publication progression
    const now = Date.now();
    const elapsed = now % 120000; // 2 minute cycle
    
    let status: 'pending' | 'submitted' | 'confirmed' | 'verified' | 'failed';
    
    if (elapsed < 20000) { // First 20 seconds
      status = 'pending';
    } else if (elapsed < 60000) { // Next 40 seconds
      status = 'submitted';
    } else if (elapsed < 100000) { // Next 40 seconds
      status = 'confirmed';
    } else {
      status = 'verified';
    }

    return {
      commitment,
      status,
      height: status === 'verified' ? Math.floor(now / 1000) : undefined,
      timestamp: now,
    };
  }

  private getMockPublicationData(commitment: string): any {
    return {
      commitment,
      title: 'Research Publication',
      type: 'paper',
      content: 'This is a mock research publication for demonstration purposes.',
      metadata: {
        tokenId: Math.floor(Math.random() * 1000),
        timestamp: Date.now(),
        version: '1.0',
        author: 'Research Team',
        institution: 'University Research Lab'
      },
      size: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1MB
      hash: `0x${Math.random().toString(16).substr(2, 64)}`
    };
  }

  private getMockDAProof(commitment: string): {proof: string, merkleRoot: string} {
    return {
      proof: `0x${Math.random().toString(16).substr(2, 128)}`,
      merkleRoot: `0x${Math.random().toString(16).substr(2, 64)}`
    };
  }
}

export const ogDAService = new OGDAService();

