import { ethers } from "ethers";

// Temporarily disable 0G broker import due to ESM issues
// import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

let _broker: any | null = null;
let _wallet: ethers.Wallet | null = null;

const RPC = process.env.OG_COMPUTE_RPC || process.env.OG_RPC || "https://evmrpc-testnet.0g.ai";
const PK = process.env.OG_COMPUTE_PRIVATE_KEY;

// For development mode, we'll use mock implementations
const isDev = !PK || process.env.NODE_ENV !== "production";

function getWallet() {
  if (_wallet) return _wallet;
  
  if (!PK) {
    throw new Error("OG_COMPUTE_PRIVATE_KEY is required for production mode");
  }
  
  const provider = new ethers.JsonRpcProvider(RPC);
  _wallet = new ethers.Wallet(PK, provider);
  return _wallet;
}

export async function getBroker() {
  // Always return mock broker for now due to 0G library ESM issues
  return {
    signerAddress: async () => "0x1234567890123456789012345678901234567890",
    ledger: {
      getLedger: async () => ({ totalBalance: BigInt(1000000000000000000) }),
      createLedger: async () => ({ success: true }),
      topUpLedger: async () => ({ success: true })
    }
  };
}

export async function ensureLedger(amount = 0.02) {
  return { success: true, amount, mode: "development" };
}

export async function listServices() {
  return [
    { id: "mock-service-1", name: "Mock AI Service", type: "openai-compatible" },
    { id: "mock-service-2", name: "Mock Data Analysis", type: "data-analysis" }
  ];
}

export async function callProvider(providerAddress: string, prompt: string) {
  // Return mock response for development
  return {
    verified: false,
    response: `Mock AI response for prompt: "${prompt}". This is running in development mode with mock 0G Compute integration.`,
    provider: providerAddress,
    mode: "development"
  };
}