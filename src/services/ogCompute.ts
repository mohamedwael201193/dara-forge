import { ethers, BrowserProvider } from 'ethers';
import { COMPUTE_CONTRACTS, LEDGER_ABI, SERVING_ABI } from './contracts/computeContracts';

// Official Testnet Providers
export const COMPUTE_PROVIDERS = {
  llama: {
    address: "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
    model: "llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    type: "chat",
    endpoint: "https://llama-3-3-70b-instruct.0g.ai/v1"
  },
  deepseek: {
    address: "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
    model: "deepseek-r1-70b",
    name: "DeepSeek R1 70B",
    type: "reasoning",
    endpoint: "https://deepseek-r1-70b.0g.ai/v1"
  }
};

export interface ComputeResult {
  success: boolean;
  answer: string;
  provider: string;
  model: string;
  verified: boolean;
  chatId: string;
  usage?: any;
  timestamp: string;
  cost?: string;
  requestId?: string;
}

class OGComputeService {
  private signer: ethers.Signer | null = null;
  private provider: BrowserProvider | null = null;
  private ledgerContract: ethers.Contract | null = null;
  private servingContract: ethers.Contract | null = null;
  private userAddress: string = '';
  
  async initialize() {
    if (!window.ethereum) throw new Error("Wallet not connected");
    
    this.provider = new BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.userAddress = await this.signer.getAddress();
    
    // Initialize contracts
    this.ledgerContract = new ethers.Contract(
      COMPUTE_CONTRACTS.ledger,
      LEDGER_ABI,
      this.signer
    );
    
    this.servingContract = new ethers.Contract(
      COMPUTE_CONTRACTS.serving,
      SERVING_ABI,
      this.signer
    );
    
    // Ensure ledger has balance
    await this.ensureLedgerBalance();
    
    return this;
  }
  
  async ensureLedgerBalance(minBalance = "0.05") {
    try {
      const account = await this.ledgerContract!.getAccount(this.userAddress);
      const balance = ethers.formatEther(account.balance);
      
      if (parseFloat(balance) < parseFloat(minBalance)) {
        const tx = await this.ledgerContract!.deposit(this.userAddress, {
          value: ethers.parseEther(minBalance)
        });
        await tx.wait();
        console.log(`Added ${minBalance} OG to ledger`);
      }
      
      return balance;
    } catch (error) {
      // No account exists, create one
      const tx = await this.ledgerContract!.deposit(this.userAddress, {
        value: ethers.parseEther(minBalance)
      });
      await tx.wait();
      console.log(`Created ledger with ${minBalance} OG`);
      return minBalance;
    }
  }
  
  async getLedgerBalance() {
    try {
      const account = await this.ledgerContract!.getAccount(this.userAddress);
      return ethers.formatEther(account.balance);
    } catch {
      return "0";
    }
  }
  
  async generateAuthHeaders(providerAddress: string, requestData: string): Promise<any> {
    // Generate request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create message to sign
    const message = ethers.solidityPackedKeccak256(
      ['address', 'address', 'string', 'uint256'],
      [this.userAddress, providerAddress, requestData, Date.now()]
    );
    
    // Sign the message
    const signature = await this.signer!.signMessage(ethers.getBytes(message));
    
    return {
      'X-0G-Address': this.userAddress,
      'X-0G-Signature': signature,
      'X-0G-Request-Id': requestId,
      'X-0G-Timestamp': Date.now().toString(),
      'Content-Type': 'application/json'
    };
  }
  
  async runInference(
    providerAddress: string,
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<ComputeResult> {
    try {
      // Get provider details
      const providerInfo = Object.values(COMPUTE_PROVIDERS).find(
        p => p.address.toLowerCase() === providerAddress.toLowerCase()
      );
      
      if (!providerInfo) {
        throw new Error("Unknown provider address");
      }
      
      // Prepare messages
      const messages = [];
      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      messages.push({ role: "user", content: prompt });
      
      // Prepare request body
      const requestBody = {
        model: providerInfo.model,
        messages,
        temperature: options.temperature || 0.4,
        max_tokens: options.maxTokens || 2000,
        stream: false
      };
      
      // Generate auth headers
      const headers = await this.generateAuthHeaders(
        providerAddress,
        JSON.stringify(requestBody)
      );
      
      // Make inference request
      const response = await fetch(`${providerInfo.endpoint}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Provider error: ${response.status} - ${error}`);
      }
      
      const data = await response.json();
      const answer = data?.choices?.[0]?.message?.content || "";
      const chatId = data?.id || `chat-${Date.now()}`;
      
      // Calculate approximate cost
      const usage = data?.usage;
      let cost = "0";
      if (usage) {
        // Approximate rates (adjust based on actual provider rates)
        const inputCost = usage.prompt_tokens * 0.000001;
        const outputCost = usage.completion_tokens * 0.000002;
        cost = (inputCost + outputCost).toFixed(8);
        
        // Record fee on-chain (optional, can be batched)
        try {
          const feeInWei = ethers.parseEther(cost);
          await this.settleFees(providerAddress, feeInWei);
        } catch (e) {
          console.log("Fee settlement will be batched");
        }
      }
      
      return {
        success: true,
        answer,
        model: providerInfo.model,
        provider: providerAddress,
        verified: false, // Verification requires additional implementation
        chatId,
        usage,
        cost: cost + " OG",
        timestamp: new Date().toISOString(),
        requestId: headers['X-0G-Request-Id']
      };
      
    } catch (error: any) {
      console.error("Inference error:", error);
      throw error;
    }
  }
  
  async settleFees(providerAddress: string, amount?: bigint) {
    // If no amount specified, settle accumulated fees
    const feeAmount = amount || ethers.parseEther("0.0001");
    
    const tx = await this.servingContract!.settleFees(
      providerAddress,
      feeAmount
    );
    
    return tx.wait();
  }
  
  async listServices() {
    try {
      const providers = await this.servingContract!.getAllServices();
      const services = [];
      
      for (const provider of providers) {
        try {
          const service = await this.servingContract!.getService(provider);
          services.push({
            provider,
            name: service.name,
            model: service.model,
            url: service.url,
            inputPrice: ethers.formatEther(service.inputPrice) + " OG/token",
            outputPrice: ethers.formatEther(service.outputPrice) + " OG/token",
            type: service.serviceType,
            lastUpdate: new Date(Number(service.updatedAt) * 1000).toISOString()
          });
        } catch (e) {
          console.log(`Failed to get service for ${provider}`);
        }
      }
      
      return services;
    } catch (error) {
      console.error("Failed to list services:", error);
      // Return hardcoded providers as fallback
      return Object.values(COMPUTE_PROVIDERS).map(p => ({
        provider: p.address,
        model: p.model,
        name: p.name,
        type: p.type,
        url: p.endpoint
      }));
    }
  }
  
  // Helper function to verify response (simplified)
  async verifyResponse(response: any, signature?: string): Promise<boolean> {
    // Implement TEE verification if signature is provided
    // For now, return false as verification requires additional setup
    return false;
  }
}

export const ogComputeService = new OGComputeService();

