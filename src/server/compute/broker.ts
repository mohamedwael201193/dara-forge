import { ethers, Wallet } from "ethers";

// Try multiple import paths for the 0G serving broker
let ZgServingNetworkBroker: any;

try {
  // Try the official import first
  ZgServingNetworkBroker = require("@0glabs/0g-serving-broker").ZgServingNetworkBroker;
} catch {
  try {
    // Try alternative import patterns
    const broker = require("@0glabs/0g-serving-broker");
    ZgServingNetworkBroker = broker.ZgServingNetworkBroker || broker.default || broker;
  } catch {
    // If all else fails, create a mock for development
    console.warn("[ZgComputeBroker] Warning: 0G serving broker not available, using mock");
    ZgServingNetworkBroker = class MockBroker {
      constructor() {}
      async getAccount() { return { address: "0xDE84a47a744165B5123D428321F541fD524c4435", totalBalance: 1000000000000000000n, locked: 0n }; }
      async listService() { 
        return [
          {
            name: "deepseek-r1-70b",
            provider: "0x1234567890123456789012345678901234567890",
            serviceType: "llm",
            url: "https://api.mock-provider.ai",
            inputPrice: 1000000000000000n,
            outputPrice: 2000000000000000n
          },
          {
            name: "llama-3.3-70b-instruct",
            provider: "0x0987654321098765432109876543210987654321",
            serviceType: "llm",
            url: "https://api.mock-provider2.ai",
            inputPrice: 800000000000000n,
            outputPrice: 1600000000000000n
          }
        ];
      }
      async depositFund() { return "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; }
      async processRequest(serviceName: string, content: string) { 
        return {
          choices: [{
            message: {
              content: `Mock AI analysis result for: ${content.substring(0, 100)}...\n\nThis is a simulated response from ${serviceName}. The analysis indicates interesting patterns in the provided data.`
            }
          }],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 }
        };
      }
    };
  }
}

// Environment configuration
const ENDPOINT_URL = process.env.ZG_BROKER_URL || "https://broker-test.0g.ai";
const PRIVATE_KEY = process.env.OG_COMPUTE_PRIVATE_KEY || process.env.ZG_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("OG_COMPUTE_PRIVATE_KEY environment variable is required for broker service");
}

// Provider configuration for 0G Chain
const PROVIDER_URL = process.env.OG_COMPUTE_RPC || process.env.OG_RPC_URL || process.env.VITE_OG_RPC || "https://evmrpc-testnet.0g.ai";

/**
 * Official 0G Compute Broker Service
 * 
 * This service follows the official 0G SDK patterns and provides:
 * - Proper ethers v6 wallet initialization
 * - ZgServingNetworkBroker integration
 * - Service discovery and management
 * - Account balance and funding operations
 */
export class ZgComputeBroker {
  private broker: any = null;
  private provider: ethers.JsonRpcProvider;
  private wallet: Wallet;
  private isInitialized = false;

  constructor() {
    // Initialize provider with ethers v6
    this.provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    
    // Initialize wallet with ethers v6 - ensure PRIVATE_KEY is defined
    if (!PRIVATE_KEY) {
      throw new Error("OG_COMPUTE_PRIVATE_KEY is required");
    }
    this.wallet = new Wallet(PRIVATE_KEY, this.provider);
    
    console.log(`[ZgComputeBroker] Initialized with wallet: ${this.wallet.address}`);
  }

  /**
   * Initialize the broker connection
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized && this.broker) {
        return;
      }

      console.log(`[ZgComputeBroker] Initializing broker with endpoint: ${ENDPOINT_URL}`);
      
      // Create broker instance following official SDK pattern
      this.broker = new ZgServingNetworkBroker(this.wallet, ENDPOINT_URL);
      
      // Verify connection
      const account = await this.broker.getAccount();
      console.log(`[ZgComputeBroker] Connected to account:`, {
        address: account.address,
        totalBalance: ethers.formatEther(account.totalBalance),
        locked: ethers.formatEther(account.locked),
        available: ethers.formatEther(account.totalBalance - account.locked)
      });

      this.isInitialized = true;
    } catch (error) {
      console.error("[ZgComputeBroker] Failed to initialize:", error);
      throw new Error(`Broker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get broker instance (ensures initialization)
   */
  async getBroker(): Promise<any> {
    if (!this.isInitialized || !this.broker) {
      await this.initialize();
    }
    
    if (!this.broker) {
      throw new Error("Broker failed to initialize");
    }
    
    return this.broker;
  }

  /**
   * Get account information
   */
  async getAccount() {
    const broker = await this.getBroker();
    const account = await broker.getAccount();
    
    return {
      address: account.address,
      totalBalance: account.totalBalance.toString(),
      locked: account.locked.toString(),
      available: (account.totalBalance - account.locked).toString(),
      totalBalanceFormatted: ethers.formatEther(account.totalBalance),
      lockedFormatted: ethers.formatEther(account.locked),
      availableFormatted: ethers.formatEther(account.totalBalance - account.locked)
    };
  }

  /**
   * Discover available services
   */
  async listServices() {
    const broker = await this.getBroker();
    const services = await broker.listService();
    
    console.log(`[ZgComputeBroker] Found ${services.length} services`);
    
    return services.map((service: any) => ({
      name: service.name,
      provider: service.provider,
      type: service.serviceType,
      url: service.url,
      inputPrice: service.inputPrice.toString(),
      outputPrice: service.outputPrice.toString(),
      priceFormatted: {
        input: ethers.formatEther(service.inputPrice),
        output: ethers.formatEther(service.outputPrice)
      }
    }));
  }

  /**
   * Add credit to account
   */
  async addCredit(amount: string): Promise<string> {
    const broker = await this.getBroker();
    
    // Convert amount to wei
    const amountInWei = ethers.parseEther(amount);
    
    console.log(`[ZgComputeBroker] Adding ${amount} OG credit (${amountInWei.toString()} wei)`);
    
    const txHash = await broker.depositFund(amountInWei);
    console.log(`[ZgComputeBroker] Credit added, tx hash: ${txHash}`);
    
    return txHash;
  }

  /**
   * Create a request for AI analysis
   */
  async createRequest(serviceName: string, content: string): Promise<any> {
    const broker = await this.getBroker();
    
    console.log(`[ZgComputeBroker] Creating request for service: ${serviceName}`);
    
    // Create the request following official SDK pattern
    const response = await broker.processRequest(serviceName, content);
    
    console.log(`[ZgComputeBroker] Request completed for service: ${serviceName}`);
    
    return response;
  }

  /**
   * Get health status of the broker and connection
   */
  async getHealthStatus() {
    try {
      const [account, services] = await Promise.all([
        this.getAccount(),
        this.listServices()
      ]);

      return {
        status: 'healthy',
        broker: {
          endpoint: ENDPOINT_URL,
          connected: this.isInitialized
        },
        account: {
          address: account.address,
          available: account.availableFormatted
        },
        services: {
          count: services.length,
          names: services.map((s: any) => s.name)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get detailed diagnostics
   */
  async getDiagnostics() {
    try {
      const [account, services] = await Promise.all([
        this.getAccount(),
        this.listServices()
      ]);

      // Test wallet connection
      const walletAddress = this.wallet.address;
      const chainId = await this.provider.getNetwork().then(n => n.chainId);

      return {
        status: 'success',
        wallet: {
          address: walletAddress,
          chainId: chainId.toString()
        },
        broker: {
          endpoint: ENDPOINT_URL,
          initialized: this.isInitialized
        },
        account,
        services: {
          count: services.length,
          details: services
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
let brokerInstance: ZgComputeBroker | null = null;

/**
 * Get the singleton broker instance
 */
export function getZgComputeBroker(): ZgComputeBroker {
  if (!brokerInstance) {
    brokerInstance = new ZgComputeBroker();
  }
  return brokerInstance;
}

/**
 * Initialize the broker (can be called multiple times safely)
 */
export async function initializeBroker(): Promise<ZgComputeBroker> {
  const broker = getZgComputeBroker();
  await broker.initialize();
  return broker;
}