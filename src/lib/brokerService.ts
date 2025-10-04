// src/lib/brokerService.ts
import { ethers } from "ethers";

// Environment check for development vs production  
const isDevelopment = process.env.NODE_ENV !== 'production';

const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY;
const rpcUrl = process.env.OG_COMPUTE_RPC;
const RELIABLE_PROVIDER_ADDRESS = "0xf07240Efa67755B5311bc75784a061eDB47165Dd"; // Official 0G Provider

if (!isDevelopment && (!privateKey || !rpcUrl)) {
  throw new Error("Missing required server-side environment variables for 0G Compute Service.");
}

let brokerInstance: any = null;

export const getBroker = async (): Promise<any> => {
  if (brokerInstance) {
    return brokerInstance;
  }

  // Always use mock broker unless explicitly in production
  if (isDevelopment) {
    console.log("Using mock broker for development environment");
    brokerInstance = createMockBroker();
    return brokerInstance;
  }

  // Only attempt real 0G import in production
  try {
    console.log("Initializing real 0G Compute Broker for production...");
    const { createZGComputeNetworkBroker } = await import("@0glabs/0g-serving-broker");
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey!, provider);

    console.log(`Initializing 0G Compute Broker with wallet address: ${wallet.address}`);
    
    const broker = await createZGComputeNetworkBroker(wallet);
    brokerInstance = broker;

    await setupComputeServices(broker);
    return broker;
  } catch (error) {
    console.error("Failed to initialize 0G Compute Broker:", error);
    // Fallback to mock in case of production errors
    console.log("Falling back to mock broker due to initialization error");
    brokerInstance = createMockBroker();
    return brokerInstance;
  }
};

// Mock broker for development
const createMockBroker = () => ({
  inference: {
    getRequestHeaders: async (providerAddress: string, content: string) => ({
      'x-0g-provider': providerAddress,
      'x-0g-content-hash': 'mock-hash',
    }),
    processResponse: async (providerAddress: string, content: string, chatId: string) => true,
    acknowledgeProviderSigner: async (providerAddress: string) => {
      console.log(`Mock acknowledging provider: ${providerAddress}`);
    }
  },
  ledger: {
    getLedger: async () => ({ totalBalance: ethers.parseEther("1.0") }),
    addLedger: async (amount: number) => {
      console.log(`Mock adding ledger with ${amount} OG`);
    }
  }
});

const setupComputeServices = async (broker: any) => {
  try {
    const account = await broker.ledger.getLedger();
    console.log(`Compute ledger found. Available balance: ${ethers.formatEther(account.totalBalance)} OG`);
  } catch (error) {
    console.log("No existing compute ledger found. Creating and funding with 0.01 OG...");
    try {
      await broker.ledger.addLedger(0.01);
      console.log("Ledger created and funded successfully.");
    } catch (creationError) {
      console.error("Failed to create or fund ledger:", creationError);
    }
  }

  try {
    console.log(`Acknowledging provider: ${RELIABLE_PROVIDER_ADDRESS}`);
    await broker.inference.acknowledgeProviderSigner(RELIABLE_PROVIDER_ADDRESS);
    console.log("Provider acknowledged successfully.");
  } catch (error: any) {
    if (error.message.includes("already acknowledged")) {
      console.log("Provider has already been acknowledged.");
    } else {
      console.error("Failed to acknowledge provider:", error);
    }
  }
};