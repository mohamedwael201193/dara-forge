// src/lib/brokerService.ts
import { ethers } from "ethers";

const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY;
const rpcUrl = process.env.OG_COMPUTE_RPC || "https://evmrpc-testnet.0g.ai";

if (!privateKey) {
  throw new Error("Missing required server-side environment variable: OG_COMPUTE_PRIVATE_KEY");
}

let brokerInstance: any | null = null;
let availableServices: any[] = [];
let networkStatus = {
  connected: false,
  walletBalance: "0",
  contractsWorking: false
};

export const getBroker = async (): Promise<any> => {
  if (brokerInstance) {
    return brokerInstance;
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // First check if we can connect to the network and wallet has balance
    await checkNetworkConnection(wallet);

    console.log(`Initializing 0G Compute Broker with wallet address: ${wallet.address}`);
    console.log(`Wallet balance: ${networkStatus.walletBalance} OG`);
    
    // Dynamic import with fallback strategies for broken SDK exports
    let createBrokerFn;
    try {
      // Strategy 1: Named import
      const module = await import("@0glabs/0g-serving-broker");
      createBrokerFn = module.createZGComputeNetworkBroker;
      console.log("✅ Using named import strategy");
    } catch (error) {
      try {
        // Strategy 2: Default import fallback
        const module = await import("@0glabs/0g-serving-broker") as any;
        createBrokerFn = module.default?.createZGComputeNetworkBroker || module.default;
        console.log("✅ Using default import strategy");
      } catch (fallbackError) {
        // Strategy 3: Try all exports
        const module = await import("@0glabs/0g-serving-broker") as any;
        createBrokerFn = module.createZGComputeNetworkBroker || 
                        module.ZGComputeNetworkBroker ||
                        module.f ||
                        module.default?.f;
        console.log("✅ Using exhaustive export search strategy");
      }
    }
    
    if (!createBrokerFn || typeof createBrokerFn !== 'function') {
      throw new Error("Could not find broker creation function in @0glabs/0g-serving-broker module");
    }
    
    const broker = await createBrokerFn(wallet);
    brokerInstance = broker;

    // Load available services from documentation (since API discovery might fail)
    await loadKnownServices();

    // Try to check/fund ledger, but don't fail if it doesn't work
    const ledgerWorking = await tryFundLedger(broker);
    networkStatus.contractsWorking = ledgerWorking;
    
    if (!ledgerWorking) {
      console.warn("⚠️  Compute ledger contracts not responding. Using service in limited mode.");
      console.warn("   You can still make requests, but billing verification may not work.");
    }

    return broker;
  } catch (error) {
    console.error("Failed to initialize 0G Compute Broker:", error);
    throw new Error("Could not initialize 0G Compute Broker.");
  }
};

const checkNetworkConnection = async (wallet: ethers.Wallet) => {
  try {
    if (!wallet.provider) {
      throw new Error("Wallet provider is not available");
    }
    
    const balance = await wallet.provider.getBalance(wallet.address);
    const balanceInOG = ethers.formatEther(balance);
    networkStatus.walletBalance = balanceInOG;
    networkStatus.connected = true;
    
    console.log(`✅ Connected to 0G network. Wallet balance: ${balanceInOG} OG`);
    
    if (Number(balanceInOG) < 0.01) {
      console.warn("⚠️  Low wallet balance. You may need more OG tokens for compute operations.");
      console.warn("   Visit the 0G faucet to get test tokens.");
    }
  } catch (error) {
    console.error("❌ Failed to connect to 0G network:", error);
    throw new Error("Cannot connect to 0G network. Please check your RPC URL and internet connection.");
  }
};

const loadKnownServices = async () => {
  // Use the official providers from 0G documentation
  const knownServices = [
    {
      provider: "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
      model: "gpt-oss-120b",
      verifiability: "TeeML",
      description: "State-of-the-art 120B parameter model for general AI tasks"
    },
    {
      provider: "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3", 
      model: "deepseek-r1-70b",
      verifiability: "TeeML",
      description: "Advanced reasoning model optimized for complex problem solving"
    }
  ];
  
  availableServices = knownServices;
  console.log(`📋 Loaded ${knownServices.length} known compute services:`);
  
  knownServices.forEach((service: any, index: number) => {
    console.log(`   ${index + 1}. ${service.model} (${service.provider.slice(0, 10)}...)`);
  });
};

const tryFundLedger = async (broker: any): Promise<boolean> => {
  try {
    // Try to get ledger info first
    const account = await broker.ledger.getLedger();
    const balance = ethers.formatEther(account.totalBalance - account.locked);
    console.log(`✅ Compute ledger found. Available balance: ${balance} OG`);
    
    // If balance is very low, try to add more funds
    if (Number(balance) < 0.01) {
      console.log("💰 Adding 0.1 OG to compute ledger...");
      await broker.ledger.addLedger("0.1");
      console.log("✅ Funds added successfully.");
    }
    return true;
    
  } catch (error) {
    // Try to create/fund a new ledger
    console.log("💰 Creating new compute ledger with 0.1 OG...");
    try {
      await broker.ledger.addLedger("0.1");
      console.log("✅ Compute ledger created and funded successfully.");
      return true;
    } catch (fundingError) {
      console.warn("⚠️  Could not access compute ledger contracts:");
      console.warn(`   ${(fundingError as Error).message}`);
      console.warn("   Continuing with limited functionality...");
      return false;
    }
  }
};

export const getAvailableServices = () => {
  return availableServices;
};

export const getNetworkStatus = () => {
  return networkStatus;
};

export const findServiceByModel = (modelName: string) => {
  return availableServices.find(service => 
    service.model && service.model.toLowerCase().includes(modelName.toLowerCase())
  );
};

export const getDefaultService = () => {
  return availableServices.length > 0 ? availableServices[0] : null;
};