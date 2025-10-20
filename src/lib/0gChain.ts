import { ethers } from "ethers";
import { apiUrl } from "./api";

interface DatasetAnchor {
  datasetId: string;
  rootHash: string;
  timestamp: number;
  researcher: string;
  txHash: string;
}

export class OGChainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  // Use your deployed contract address from centralized config
  private readonly CONTRACT_ADDRESS =
    process.env.VITE_DARA_CONTRACT ||
    "0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9";
  private readonly CHAIN_ID = parseInt(
    process.env.VITE_OG_CHAIN_ID || "16602",
    10
  );

  // FIXED: Complete ABI for your DARA contract
  private readonly CONTRACT_ABI = [
    "function logData(string memory _fileId) external",
    "function logCounter() external view returns (uint256)",
    "event LogCreated(uint256 indexed logId, address indexed creator, string fileId, uint256 timestamp)",
  ];

  // Initialize with wallet connection - FIXED PATTERN
  async initialize(walletProvider: any): Promise<void> {
    try {
      if (!walletProvider) {
        throw new Error("Wallet provider not found");
      }

      // Ensure we're on the correct network
      await this.switchToOGNetwork(walletProvider);

      // Create ethers provider and signer
      this.provider = new ethers.BrowserProvider(walletProvider);
      this.signer = await this.provider.getSigner();

      // Initialize contract
      this.contract = new ethers.Contract(
        this.CONTRACT_ADDRESS,
        this.CONTRACT_ABI,
        this.signer
      );

      console.log("0G Chain Service initialized");
      console.log("Connected to address:", await this.signer.getAddress());
      console.log("Contract address:", this.CONTRACT_ADDRESS);
    } catch (error) {
      console.error("Failed to initialize 0G Chain service:", error);
      throw error;
    }
  }

  // FIXED: Switch to 0G network with proper error handling
  private async switchToOGNetwork(provider: any): Promise<void> {
    try {
      // Try to switch to 0G network
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${this.CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${this.CHAIN_ID.toString(16)}`,
              chainName: "Galileo (Testnet)",
              rpcUrls: [
                process.env.VITE_OG_RPC ||
                  import.meta.env.VITE_OG_RPC ||
                  "https://evmrpc-testnet.0g.ai/",
              ],
              nativeCurrency: {
                name: "0G",
                symbol: "0G",
                decimals: 18,
              },
              blockExplorerUrls: [
                process.env.VITE_OG_EXPLORER ||
                  import.meta.env.VITE_OG_EXPLORER ||
                  "https://chainscan-galileo.0g.ai",
              ],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Anchor dataset to blockchain via API route for better reliability
  async anchorDataset(rootHash: string): Promise<DatasetAnchor> {
    if (!this.signer) {
      throw new Error("Chain service not initialized");
    }

    try {
      console.log("Anchoring dataset to 0G Chain:", { rootHash });

      // Use API route for anchoring to handle any server-side requirements
      const response = await fetch(apiUrl("/api/anchor"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Wallet-Address": await this.signer.getAddress(),
        },
        body: JSON.stringify({
          rootHash,
          projectId: "dara-forge-default",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Anchoring failed");
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || "Anchoring failed");
      }

      return {
        datasetId: result.datasetId || rootHash,
        rootHash,
        timestamp: Date.now(),
        researcher: await this.signer.getAddress(),
        txHash: result.txHash,
      };
    } catch (error) {
      console.error("Failed to anchor dataset:", error);
      throw error;
    }
  }

  // Direct contract call for simple operations
  async getLogCounter(): Promise<number> {
    if (!this.contract) {
      throw new Error("Chain service not initialized");
    }

    try {
      const counter = await this.contract.logCounter();
      return Number(counter);
    } catch (error) {
      console.error("Failed to get log counter:", error);
      throw error;
    }
  }

  // Check if service is ready
  isInitialized(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  // Get current address
  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error("Chain service not initialized");
    }
    return await this.signer.getAddress();
  }

  // Get chain ID
  async getChainId(): Promise<number> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  // Get explorer URL for transaction
  getExplorerUrl(txHash: string): string {
    const baseUrl =
      process.env.VITE_OG_EXPLORER ||
      import.meta.env.VITE_OG_EXPLORER ||
      "https://chainscan-galileo.0g.ai";
    return `${baseUrl}/tx/${txHash}`;
  }
}
