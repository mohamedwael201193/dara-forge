import { ethers } from "ethers";
import nodeCrypto from "node:crypto";

// Polyfill crypto for Node.js
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeCrypto.webcrypto;
}

// 0G DA Configuration
const DA_ENDPOINT =
  process.env.VITE_OG_DA_ENDPOINT || "https://da-testnet.0g.ai";
// DA MUST use testnet (Galileo) - Chain ID 16602
const DA_RPC =
  process.env.OG_RPC_URL_TESTNET ||
  process.env.OG_DA_URL_TESTNET ||
  "https://evmrpc-galileo.0g.ai";
const MAX_BLOB_SIZE = 32505852; // 32,505,852 bytes max

// DA Contract Address (from docs)
const ENTRANCE_CONTRACT = "0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9";

interface DASubmissionResult {
  blobHash: string;
  dataRoot: string;
  epoch: number;
  quorumId: number;
  verified: boolean;
  timestamp: string;
  txHash?: string;
  blockNumber?: number;
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

      console.log("[0G DA] DA commitment recorded on-chain");
      console.log("[0G DA] Transaction hash:", transaction.hash);
      console.log("[0G DA] Block number:", receipt?.blockNumber);

      // Store transaction hash for faster verification
      const txHash = transaction.hash;

      return {
        blobHash: blobHash,
        dataRoot: dataRoot,
        epoch: Math.floor(Date.now() / 1000),
        quorumId: 1,
        verified: true,
        timestamp: new Date().toISOString(),
        txHash: txHash,
        blockNumber: receipt?.blockNumber,
      };
    } catch (error: any) {
      console.error("[0G DA] Submission error:", error);
      throw new Error(`DA submission failed: ${error.message}`);
    }
  }

  async verifyAvailability(blobHash: string): Promise<boolean> {
    console.log("[0G DA] Verifying availability for:", blobHash);

    try {
      await this.initialize();

      const latestBlock = await this.provider.getBlockNumber();
      const searchBlocks = 50; // INCREASED from 10 to 50 blocks

      console.log(
        "[0G DA] Searching last",
        searchBlocks,
        "blocks from block",
        latestBlock
      );

      for (let i = 0; i < searchBlocks; i++) {
        const blockNumber = latestBlock - i;
        if (blockNumber < 0) break;

        try {
          const block = await this.provider.getBlock(blockNumber, true);
          if (!block || !block.transactions) continue;

          for (const txHash of block.transactions) {
            try {
              const tx = await this.provider.getTransaction(txHash);
              if (!tx || !tx.data) continue;

              // More robust hash checking
              const cleanBlobHash = blobHash.toLowerCase().replace("0x", "");
              const cleanTxData = tx.data.toLowerCase();

              if (cleanTxData.includes(cleanBlobHash)) {
                console.log(
                  "[0G DA] ✅ Found DA commitment in block",
                  blockNumber
                );
                console.log("[0G DA] Transaction:", txHash);
                return true;
              }
            } catch (txError) {
              // Skip individual transaction errors
              continue;
            }
          }
        } catch (blockError: any) {
          console.warn(
            "[0G DA] Error reading block",
            blockNumber,
            blockError.message
          );
          continue;
        }
      }

      console.log(
        "[0G DA] ⚠️  No DA commitment found in last",
        searchBlocks,
        "blocks"
      );
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

let _daClient: OGDAClient | null = null;

export const daClient = {
  get instance() {
    if (!_daClient) {
      _daClient = new OGDAClient();
    }
    return _daClient;
  },

  async initialize() {
    return this.instance.initialize();
  },

  async submitBlob(
    data: Uint8Array,
    metadata?: {
      datasetId?: string;
      rootHash?: string;
    }
  ) {
    return this.instance.submitBlob(data, metadata);
  },

  async verifyAvailability(blobHash: string) {
    return this.instance.verifyAvailability(blobHash);
  },

  async retrieveBlob(blobHash: string) {
    return this.instance.retrieveBlob(blobHash);
  },
};
