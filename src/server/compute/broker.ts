import { config } from "dotenv";
import { ethers } from "ethers";
import nodeCrypto from "node:crypto";
import { createRequire } from "node:module";

// Load environment variables first
config();

// Polyfill crypto for 0G SDK in Node.js
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeCrypto.webcrypto;
}

// Load 0G SDK via CommonJS to avoid ESM issues
const require = createRequire(import.meta.url);
let createZGComputeNetworkBroker: any;

try {
  const sdk = require("@0glabs/0g-serving-broker");
  createZGComputeNetworkBroker = sdk.createZGComputeNetworkBroker;
  if (!createZGComputeNetworkBroker) {
    throw new Error("createZGComputeNetworkBroker not found in SDK");
  }
} catch (error) {
  console.error("[0G Broker] Failed to load SDK:", error);
  throw new Error("0G SDK failed to load - this is a critical error");
}

const RPC_URL = process.env.OG_COMPUTE_RPC || "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = process.env.OG_COMPUTE_PRIVATE_KEY;

// Official 0G providers from docs
const OFFICIAL_PROVIDERS = {
  "gpt-oss-120b": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
};

let brokerInstance: any = null;

export async function getBroker() {
  if (brokerInstance) return brokerInstance;

  if (!PRIVATE_KEY) {
    throw new Error("OG_COMPUTE_PRIVATE_KEY is required");
  }

  console.log("[0G Broker] Initializing with 0.5.4 (default contracts)...");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("[0G Broker] Wallet address:", wallet.address);
  console.log("[0G Broker] RPC URL:", RPC_URL);

  // Test network connectivity
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("[0G Broker] Current block number:", blockNumber);
  } catch (error) {
    console.error("[0G Broker] Network connectivity error:", error);
    throw new Error("Failed to connect to 0G network");
  }

  // Try with default contracts first to see if broker works
  console.log("[0G Broker] Trying with default contracts...");
  brokerInstance = await createZGComputeNetworkBroker(wallet);

  console.log("[0G Broker] Initialization complete");
  return brokerInstance;
}

export async function ensureLedger(minBalance = 0.5) {
  // Increased from 0.1 to 0.5
  const broker = await getBroker();

  try {
    const account = await broker.ledger.getLedger();
    const balance = Number(ethers.formatEther(account.totalBalance));

    console.log("[0G Broker] Account balance:", balance, "OG");

    if (balance < minBalance) {
      console.log("[0G Broker] Balance too low, adding funds...");
      await broker.ledger.depositFund(minBalance);
    }
  } catch (error: any) {
    if (error.message?.includes("does not exist")) {
      console.log("[0G Broker] Creating new account with", minBalance, "OG");
      await broker.ledger.addLedger(minBalance);
    } else {
      throw error;
    }
  }
}

export async function listServices() {
  const broker = await getBroker();
  const services = await broker.inference.listService();
  console.log("[0G Broker] Found", services.length, "services");
  return services;
}

export async function analyzeWithAI(text: string, datasetRoot?: string) {
  const broker = await getBroker();

  // Check if account has sufficient balance
  try {
    const account = await broker.ledger.getLedger();
    const balance = Number(ethers.formatEther(account.totalBalance));
    const minRequired = 0.5;

    console.log("[0G Broker] Current balance:", balance, "OG");
    console.log("[0G Broker] Required balance:", minRequired, "OG");

    if (balance < minRequired) {
      console.log("[0G Broker] Balance insufficient, adding more funds...");
      try {
        await broker.ledger.depositFund(1.0); // Add 1.0 OG (increased from 0.2)
        console.log("[0G Broker] Added 1.0 OG to account");
      } catch (depositError) {
        // If depositFund fails, try addLedger
        await broker.ledger.addLedger(1.0);
        console.log("[0G Broker] Created new ledger with 1.0 OG");
      }
    }
  } catch (balanceError: any) {
    console.warn("[0G Broker] Balance check failed:", balanceError.message);
  }

  // Ensure account has funds (with increased minimum)
  await ensureLedger(0.5); // Increased from 0.1 to 0.5

  // Get available services
  const services = await listServices();

  if (!services || services.length === 0) {
    throw new Error("No compute services available on 0G network");
  }

  // Try providers in order of preference until one works
  const preferredProvider =
    process.env.OG_COMPUTE_PREF_PROVIDER ||
    "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3";

  const providersToTry = [
    services.find((s: any) => s.provider === preferredProvider), // Preferred provider (funded)
    services.find(
      (s: any) => s.provider === "0x6D233D2610c32f630ED53E8a7Cbf759568041f8f"
    ), // qwen2.5-vl-72b-instruct (also acknowledged)
    services.find(
      (s: any) => s.provider === "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
    ), // gpt-oss-120b (fallback)
    ...services.filter(
      (s: any) =>
        s.provider !== preferredProvider &&
        s.provider !== "0x6D233D2610c32f630ED53E8a7Cbf759568041f8f" &&
        s.provider !== "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
    ), // Others
  ].filter(Boolean);

  let lastError: string = "";

  for (const service of providersToTry) {
    try {
      console.log("[0G Broker] Trying provider:", service.provider);
      console.log("[0G Broker] Model:", service.model || "unknown");

      // Acknowledge provider (required)
      try {
        await broker.inference.acknowledgeProviderSigner(service.provider);
        console.log("[0G Broker] Provider acknowledged");
      } catch (error: any) {
        if (!error.message?.includes("already acknowledged")) {
          console.warn("[0G Broker] Acknowledge failed:", error.message);
        }
      }

      // Get service metadata
      const metadata = await broker.inference.getServiceMetadata(
        service.provider
      );
      console.log("[0G Broker] Metadata:", {
        endpoint: metadata.endpoint,
        model: metadata.model,
      });

      // Prepare messages
      const content = datasetRoot
        ? `Analyze this research dataset with Merkle root ${datasetRoot}:\n${text}`
        : text;

      const messages = [{ role: "user", content }];

      // Get single-use authentication headers
      const headers = await broker.inference.getRequestHeaders(
        service.provider,
        JSON.stringify(messages)
      );

      console.log("[0G Broker] Generated auth headers");

      // Make request to provider
      const response = await fetch(`${metadata.endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          model: metadata.model,
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = `Provider ${service.provider} returned ${response.status}: ${errorText}`;
        console.warn("[0G Broker]", lastError);
        continue; // Try next provider
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      const chatID = data.id;

      if (!answer) {
        lastError = `No response content from provider ${service.provider}`;
        console.warn("[0G Broker]", lastError);
        continue; // Try next provider
      }

      console.log("[0G Broker] Response received, length:", answer.length);

      // Verify response (for TEE providers)
      let verified = false;
      try {
        verified = await broker.inference.processResponse(
          service.provider,
          answer,
          chatID
        );
        console.log("[0G Broker] Verification result:", verified);
      } catch (error) {
        console.log("[0G Broker] Verification not available for this provider");
      }

      // Success! Return the result
      return {
        answer,
        provider: service.provider,
        model: metadata.model,
        verified,
        chatID,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      lastError = `Provider ${service.provider} failed: ${error.message}`;
      console.warn("[0G Broker]", lastError);
      continue; // Try next provider
    }
  }

  // If we get here, all providers failed
  throw new Error(`All providers failed. Last error: ${lastError}`);
}
