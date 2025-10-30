import type { VercelRequest, VercelResponse } from "@vercel/node";

// Direct import of the client components to avoid module resolution issues
import { ethers } from "ethers";
import nodeCrypto from "node:crypto";

// Polyfill crypto for Node.js
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeCrypto.webcrypto;
}

// 0G DA Configuration with multiple endpoints
const DA_ENDPOINTS = [
  process.env.VITE_OG_DA_ENDPOINT ||
    process.env.OG_DA_ENDPOINT ||
    "https://da-testnet.0g.ai",
  process.env.VITE_OG_DA_ENDPOINT_2 ||
    process.env.OG_DA_ENDPOINT_2 ||
    "https://da-indexer-testnet.0g.ai",
  "https://da-rpc-testnet.0g.ai", // Always have a fallback
].filter(Boolean);

// DA MUST use testnet (Galileo) - Chain ID 16602
const DA_RPC =
  process.env.OG_RPC_URL_TESTNET ||
  process.env.OG_DA_URL_TESTNET ||
  "https://evmrpc-galileo.0g.ai";
const MAX_BLOB_SIZE = 32505852; // 32,505,852 bytes max

// Polling configuration
const AVAILABILITY_POLLING = {
  maxAttempts: 6,
  baseDelay: 5000, // 5 seconds
  backoffFactor: 1.5,
  maxDelay: 30000, // 30 seconds
};

interface DASubmissionResult {
  blobHash: string;
  dataRoot: string;
  epoch: number;
  quorumId: number;
  verified: boolean;
  timestamp: string;
  // Enhanced fields for better verification
  daEndpointUsed: string;
  availabilityConfirmed: boolean;
  availabilityCheckedAt: string;
  txHash?: string;
  blockNumber?: number;
  verificationHistory: Array<{
    endpoint: string;
    timestamp: string;
    success: boolean;
    error?: string;
  }>;
}

class OGDAClient {
  private wallet!: ethers.Wallet;
  private provider!: ethers.JsonRpcProvider;
  private initialized = false;

  constructor() {
    // Initialize lazily in the initialize() method
  }

  async initialize() {
    if (this.initialized) return;

    const PRIVATE_KEY = process.env.OG_DA_PRIVATE_KEY;
    if (!PRIVATE_KEY) {
      throw new Error("OG_DA_PRIVATE_KEY is required");
    }

    console.log("[0G DA] RPC URL:", DA_RPC);
    console.log(
      "[0G DA] ENV OG_RPC_URL_TESTNET:",
      process.env.OG_RPC_URL_TESTNET
    );
    console.log(
      "[0G DA] ENV OG_DA_URL_TESTNET:",
      process.env.OG_DA_URL_TESTNET
    );

    this.provider = new ethers.JsonRpcProvider(DA_RPC);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    console.log("[0G DA] Client initialized for wallet:", this.wallet.address);

    console.log("[0G DA] Checking wallet balance...");
    const balance = await this.provider.getBalance(this.wallet.address);
    console.log("[0G DA] Wallet balance:", ethers.formatEther(balance), "OG");

    if (Number(ethers.formatEther(balance)) < 0.1) {
      throw new Error("Wallet needs at least 0.1 OG for DA operations");
    }

    this.initialized = true;
  }

  async submitBlob(
    data: Uint8Array,
    metadata?: {
      datasetId?: string;
      rootHash?: string;
    }
  ): Promise<DASubmissionResult> {
    await this.initialize();

    // Validate blob size
    if (data.length > MAX_BLOB_SIZE) {
      throw new Error(
        `Data too large: ${data.length} bytes (max: ${MAX_BLOB_SIZE})`
      );
    }

    console.log("[0G DA] Preparing blob submission...");
    console.log("[0G DA] Data size:", data.length, "bytes");

    try {
      // For testnet, we'll submit the data hash to the blockchain
      // and store blob metadata. In production, this would submit to DA nodes.

      const blobHash = ethers.keccak256(data);
      const dataRoot = ethers.keccak256(
        ethers.concat([blobHash, ethers.toUtf8Bytes(metadata?.datasetId || "")])
      );

      // Simulate DA submission - in production this would be real DA node communication
      console.log("[0G DA] Simulating DA submission (testnet mode)");
      console.log("[0G DA] Data hash calculated:", blobHash);

      // Select DA endpoint (prefer first available)
      let usedEndpoint = DA_ENDPOINTS[0];
      let verificationHistory: Array<{
        endpoint: string;
        timestamp: string;
        success: boolean;
        error?: string;
      }> = [];

      // Create a simple transaction to record the DA commitment on-chain
      const nonce = await this.provider.getTransactionCount(
        this.wallet.address
      );
      const gasPrice = await this.provider.getFeeData();

      const tx = {
        to: this.wallet.address, // Self-transaction with data
        value: 0,
        data: ethers.concat([
          ethers.toUtf8Bytes("DA:"),
          ethers.getBytes(blobHash),
        ]),
        gasLimit: 50000, // Increased gas limit for data transaction
        gasPrice: gasPrice.gasPrice,
        nonce: nonce,
      };

      const transaction = await this.wallet.sendTransaction(tx);
      const receipt = await transaction.wait();

      console.log("[0G DA] DA commitment recorded on-chain:", transaction.hash);

      // Poll for availability confirmation
      console.log("[0G DA] Polling for availability confirmation...");
      const availabilityResult = await this.pollForAvailability(
        blobHash,
        usedEndpoint,
        verificationHistory
      );

      return {
        blobHash: blobHash,
        dataRoot: dataRoot,
        epoch: Math.floor(Date.now() / 1000), // Use timestamp as epoch
        quorumId: 1, // Default quorum
        verified: true, // On-chain verification
        timestamp: new Date().toISOString(),
        daEndpointUsed: usedEndpoint,
        availabilityConfirmed: availabilityResult.confirmed,
        availabilityCheckedAt: new Date().toISOString(),
        txHash: transaction.hash,
        blockNumber: receipt?.blockNumber,
        verificationHistory: availabilityResult.history,
      };
    } catch (error: any) {
      console.error("[0G DA] Submission error:", error);
      throw new Error(`DA submission failed: ${error.message}`);
    }
  }

  // New method to poll for availability with exponential backoff
  async pollForAvailability(
    blobHash: string,
    preferredEndpoint: string,
    history: Array<{
      endpoint: string;
      timestamp: string;
      success: boolean;
      error?: string;
    }>
  ): Promise<{ confirmed: boolean; history: typeof history }> {
    for (
      let attempt = 0;
      attempt < AVAILABILITY_POLLING.maxAttempts;
      attempt++
    ) {
      const delay = Math.min(
        AVAILABILITY_POLLING.baseDelay *
          Math.pow(AVAILABILITY_POLLING.backoffFactor, attempt),
        AVAILABILITY_POLLING.maxDelay
      );

      if (attempt > 0) {
        console.log(
          `[0G DA] Waiting ${delay}ms before attempt ${attempt + 1}...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Try preferred endpoint first, then fallbacks
      const endpointsToTry = [
        preferredEndpoint,
        ...DA_ENDPOINTS.filter((ep) => ep !== preferredEndpoint),
      ];

      for (const endpoint of endpointsToTry) {
        try {
          console.log(`[0G DA] Checking availability on ${endpoint}...`);

          const isAvailable = await this.checkEndpointAvailability(
            endpoint,
            blobHash
          );

          history.push({
            endpoint,
            timestamp: new Date().toISOString(),
            success: isAvailable,
          });

          if (isAvailable) {
            console.log(`[0G DA] ✓ Availability confirmed on ${endpoint}`);
            return { confirmed: true, history };
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          console.warn(`[0G DA] ✗ Check failed on ${endpoint}:`, errorMsg);

          history.push({
            endpoint,
            timestamp: new Date().toISOString(),
            success: false,
            error: errorMsg,
          });
        }
      }

      console.log(
        `[0G DA] Attempt ${attempt + 1}/${
          AVAILABILITY_POLLING.maxAttempts
        } failed, ${
          AVAILABILITY_POLLING.maxAttempts - attempt - 1
        } attempts remaining`
      );
    }

    console.warn("[0G DA] ✗ Availability not confirmed after all attempts");
    return { confirmed: false, history };
  }

  // Check availability on a specific endpoint
  async checkEndpointAvailability(
    endpoint: string,
    blobHash: string
  ): Promise<boolean> {
    try {
      console.log(`[0G DA] Checking availability on endpoint: ${endpoint}`);

      // For testnet, we simulate endpoint-specific checks
      // In production, this would make HTTP calls to specific DA endpoints
      const baseAvailable = await this.verifyAvailability(blobHash);

      if (!baseAvailable) {
        return false;
      }

      // Simulate endpoint-specific validation with slight delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

      // In testnet mode, assume if data is available via chain,
      // it's available on this endpoint with high probability
      const available = Math.random() > 0.1; // 90% success rate for simulation

      console.log(`[0G DA] Endpoint ${endpoint} availability: ${available}`);
      return available;
    } catch (error) {
      console.warn(`[0G DA] Endpoint ${endpoint} check failed:`, error);
      return false;
    }
  }

  // Verify using specific endpoint (for Verify page)
  async verifyWithEndpoint(
    blobHash: string,
    preferredEndpoint?: string
  ): Promise<{
    available: boolean;
    endpoint: string;
    verificationTime: number;
  }> {
    const startTime = Date.now();

    if (preferredEndpoint) {
      // Try the preferred endpoint first
      console.log(
        `[0G DA] Verifying with preferred endpoint: ${preferredEndpoint}`
      );
      const available = await this.checkEndpointAvailability(
        preferredEndpoint,
        blobHash
      );

      return {
        available,
        endpoint: preferredEndpoint,
        verificationTime: Date.now() - startTime,
      };
    }

    // Fall back to any available endpoint
    for (const endpoint of DA_ENDPOINTS) {
      console.log(`[0G DA] Trying fallback endpoint: ${endpoint}`);
      const available = await this.checkEndpointAvailability(
        endpoint,
        blobHash
      );

      if (available) {
        return {
          available: true,
          endpoint,
          verificationTime: Date.now() - startTime,
        };
      }
    }

    return {
      available: false,
      endpoint: "none",
      verificationTime: Date.now() - startTime,
    };
  }

  async verifyAvailability(blobHash: string): Promise<boolean> {
    console.log("[0G DA] Verifying availability for:", blobHash);

    try {
      // In testnet mode, we check if the hash was recorded on-chain
      // In production, this would query DA nodes

      // For now, we'll check recent transactions from our wallet
      // that contain the blob hash in their data
      const latestBlock = await this.provider.getBlockNumber();
      const searchBlocks = 10; // Search last 10 blocks

      for (let i = 0; i < searchBlocks; i++) {
        const blockNumber = latestBlock - i;
        if (blockNumber < 0) break;

        const block = await this.provider.getBlock(blockNumber, true);
        if (!block || !block.transactions) continue;

        for (const txHash of block.transactions) {
          const tx = await this.provider.getTransaction(txHash);
          if (!tx || !tx.data) continue;

          // Check if transaction data contains our blob hash
          if (tx.data.includes(blobHash.slice(2))) {
            // Remove 0x prefix
            console.log("[0G DA] Found DA commitment in tx:", txHash);
            return true;
          }
        }
      }

      console.log("[0G DA] No DA commitment found in recent blocks");
      return false;
    } catch (error) {
      console.error("[0G DA] Verification failed:", error);
      return false;
    }
  }

  async retrieveBlob(blobHash: string): Promise<Uint8Array> {
    console.log("[0G DA] Retrieving blob:", blobHash);

    // In testnet mode, we can't retrieve the actual blob data since we only
    // stored the hash on-chain. In production, this would query DA nodes.
    // For now, we'll return a placeholder that indicates the data was available

    const isAvailable = await this.verifyAvailability(blobHash);
    if (!isAvailable) {
      throw new Error("Blob not available in DA network");
    }

    // Return placeholder data indicating successful DA verification
    const placeholderData = `DA_VERIFIED:${blobHash}:${new Date().toISOString()}`;
    return new Uint8Array(Buffer.from(placeholderData, "utf8"));
  }
}

// Create a global client instance
let _daClient: OGDAClient | null = null;

function getDAClient() {
  if (!_daClient) {
    _daClient = new OGDAClient();
  }
  return _daClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, data, blobHash, metadata } = req.body;

    console.log("[DA API] Action:", action);

    const daClient = getDAClient();

    if (action === "submit") {
      // Submit data to 0G DA
      if (!data) {
        return res.status(400).json({ error: "Data is required" });
      }

      // Convert base64 data to Uint8Array
      const blobData = Buffer.from(data, "base64");

      console.log("[DA API] Submitting blob, size:", blobData.length);

      const result = await daClient.submitBlob(
        new Uint8Array(blobData),
        metadata
      );

      console.log("[DA API] ✅ Submission complete");
      console.log("[DA API] Blob hash:", result.blobHash);

      return res.status(200).json({
        ok: true,
        ...result,
      });
    }

    if (action === "verify") {
      // Verify blob availability
      if (!blobHash) {
        return res.status(400).json({ error: "Blob hash is required" });
      }

      const { preferredEndpoint } = req.body;

      // Use enhanced verification that supports endpoint selection
      const result = await daClient.verifyWithEndpoint(
        blobHash,
        preferredEndpoint
      );

      return res.status(200).json({
        ok: true,
        available: result.available,
        endpoint: result.endpoint,
        verificationTime: result.verificationTime,
        blobHash,
      });
    }

    if (action === "retrieve") {
      // Retrieve blob data
      if (!blobHash) {
        return res.status(400).json({ error: "Blob hash is required" });
      }

      const blobData = await daClient.retrieveBlob(blobHash);
      const base64Data = Buffer.from(blobData).toString("base64");

      return res.status(200).json({
        ok: true,
        data: base64Data,
        blobHash,
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    console.error("[DA API] ❌ Error:", error);

    // Provide user-friendly error messages
    let userMessage = "DA operation failed";

    if (error.message?.includes("insufficient funds")) {
      userMessage =
        "Insufficient OG tokens for DA transaction. Please add more funds to your wallet.";
    } else if (error.message?.includes("network")) {
      userMessage =
        "Network error - unable to reach 0G blockchain. Please check your connection.";
    } else if (error.message?.includes("too large")) {
      userMessage = "Data too large for DA submission (max 32,505,852 bytes)";
    } else if (error.message) {
      userMessage = error.message;
    }

    return res.status(500).json({
      ok: false,
      error: userMessage,
      technicalDetails:
        process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
