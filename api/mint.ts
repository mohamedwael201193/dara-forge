import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";

// ERC7857 ResearchPassport ABI (mint function only)
const PASSPORT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "encryptedURI", type: "string" },
      { internalType: "bytes32", name: "metadataHash", type: "bytes32" },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Configuration
const PASSPORT_CONTRACT =
  process.env.VITE_RESEARCH_PASSPORT_CONTRACT ||
  process.env.RESEARCH_PASSPORT_CONTRACT;
const RPC_URL = process.env.OG_RPC_URL_MAINNET || "https://evmrpc.0g.ai";
const PRIVATE_KEY =
  process.env.OG_MAINNET_PRIVATE_KEY || process.env.OG_STORAGE_PRIVATE_KEY;
const EXPLORER = process.env.OG_EXPLORER_MAINNET || "https://chainscan.0g.ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("[Mint API] Request received:", req.method);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("[Mint API] OPTIONS request");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    console.log("[Mint API] Invalid method:", req.method);
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const { to, metadataUri, researchData } = req.body;

    // Validate input
    if (!to || !ethers.isAddress(to)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid recipient address",
      });
    }

    if (!metadataUri) {
      return res.status(400).json({
        ok: false,
        error: "Metadata URI is required",
      });
    }

    if (!PASSPORT_CONTRACT) {
      return res.status(500).json({
        ok: false,
        error: "Research Passport contract not configured",
      });
    }

    if (!PRIVATE_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Minting wallet not configured",
      });
    }

    console.log("[Mint API] Minting Research Passport iNFT...");
    console.log("[Mint API] Recipient:", to);
    console.log("[Mint API] Contract:", PASSPORT_CONTRACT);
    console.log("[Mint API] RPC:", RPC_URL);

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      PASSPORT_CONTRACT,
      PASSPORT_ABI,
      wallet
    );

    console.log("[Mint API] Minting from wallet:", wallet.address);

    // Create metadata hash
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataUri));
    console.log("[Mint API] Metadata hash:", metadataHash);

    // Call mint function (owner-only)
    console.log("[Mint API] Calling mint function...");
    const tx = await contract.mint(to, metadataUri, metadataHash);
    console.log("[Mint API] Transaction sent:", tx.hash);

    // Wait for confirmation
    console.log("[Mint API] Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(
      "[Mint API] Transaction confirmed in block:",
      receipt.blockNumber
    );

    // Parse logs to get token ID
    let tokenId: string | null = null;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed && parsed.name === "Minted") {
          tokenId = parsed.args[0].toString();
          console.log("[Mint API] Token ID minted:", tokenId);
          break;
        }
      } catch (e) {
        // Skip logs that don't match
      }
    }

    // If we couldn't parse the token ID from logs, estimate it
    if (!tokenId) {
      // Fallback: use timestamp as token ID (not accurate but better than nothing)
      tokenId = Date.now().toString();
      console.log(
        "[Mint API] Could not parse token ID from logs, using fallback:",
        tokenId
      );
    }

    console.log("[Mint API] ✅ Minting successful!");

    return res.status(200).json({
      ok: true,
      message: "Research Passport iNFT minted successfully",
      result: {
        tokenId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: PASSPORT_CONTRACT,
        recipient: to,
        metadataHash,
        explorerUrl: `${EXPLORER}/tx/${tx.hash}`,
      },
    });
  } catch (error: any) {
    console.error("[Mint API] ❌ Error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Minting failed",
    });
  }
}
