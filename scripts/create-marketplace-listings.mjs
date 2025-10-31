// =============================================================================
// CREATE MARKETPLACE LISTINGS - Populate with sample research iNFTs
// =============================================================================

import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Sample research iNFTs to list
const sampleListings = [
  {
    tokenId: 1,
    price: "2500000000000000000", // 2.5 OG
    quantity: 50,
    metadata: {
      title: "Zero-Knowledge AI Consensus Protocol",
      category: "AI",
      researchType: "AI & Blockchain Convergence",
      quality: 98,
      citations: 47,
      imageUrl:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      verificationHash: "0x7a69a4c0e0785a9890e1a890000000000000000000000000000000000000000001",
    },
  },
  {
    tokenId: 2,
    price: "1800000000000000000", // 1.8 OG
    quantity: 75,
    metadata: {
      title: "Decentralized Storage Optimization",
      category: "Blockchain",
      researchType: "Distributed Systems",
      quality: 95,
      citations: 31,
      imageUrl:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
      verificationHash: "0x7a69a4c0e0785a9890e1a890000000000000000000000000000000000000000002",
    },
  },
  {
    tokenId: 3,
    price: "3200000000000000000", // 3.2 OG
    quantity: 30,
    metadata: {
      title: "Quantum-Resistant Blockchain Signatures",
      category: "Cryptography",
      researchType: "Quantum Cryptography",
      quality: 100,
      citations: 62,
      imageUrl:
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
      verificationHash: "0x7a69a4c0e0785a9890e1a890000000000000000000000000000000000000000003",
    },
  },
  {
    tokenId: 4,
    price: "1500000000000000000", // 1.5 OG
    quantity: 100,
    metadata: {
      title: "Bio-Inspired Consensus Mechanisms",
      category: "Biology",
      researchType: "Bio-Computing",
      quality: 91,
      citations: 23,
      imageUrl:
        "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&q=80",
      verificationHash: "0x7a69a4c0e0785a9890e1a890000000000000000000000000000000000000000004",
    },
  },
  {
    tokenId: 5,
    price: "10000000000000000", // 0.01 OG (almost free!)
    quantity: 1000,
    metadata: {
      title: "Welcome to DARA Research iNFTs",
      category: "Education",
      researchType: "Getting Started with DARA",
      quality: 100,
      citations: 1234,
      imageUrl:
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
      verificationHash: "0x7a69a4c0e0785a9890e1a890000000000000000000000000000000000000000005",
    },
  },
];

async function main() {
  console.log("🎨 Creating marketplace listings on 0G Mainnet...\n");

  const ethers = (await import("ethers")).default || (await import("ethers"));
  
  const provider = new ethers.JsonRpcProvider(
    process.env.OG_RPC_URL_MAINNET || "https://evmrpc.0g.ai"
  );
  const signer = new ethers.Wallet(process.env.OG_MAINNET_PRIVATE_KEY, provider);

  // Generate proper bytes32 hashes
  sampleListings[0].metadata.verificationHash = ethers.keccak256(ethers.toUtf8Bytes("ZK-AI-Consensus-1"));
  sampleListings[1].metadata.verificationHash = ethers.keccak256(ethers.toUtf8Bytes("Storage-Optimization-2"));
  sampleListings[2].metadata.verificationHash = ethers.keccak256(ethers.toUtf8Bytes("Quantum-Signatures-3"));
  sampleListings[3].metadata.verificationHash = ethers.keccak256(ethers.toUtf8Bytes("Bio-Consensus-4"));
  sampleListings[4].metadata.verificationHash = ethers.keccak256(ethers.toUtf8Bytes("Welcome-NFT-5"));

  console.log("📝 Listing from account:", signer.address);

  const balance = await provider.getBalance(signer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "OG\n");

  const MARKETPLACE_CONTRACT =
    process.env.MARKETPLACE_CONTRACT ||
    process.env.VITE_MARKETPLACE_CONTRACT;

  if (!MARKETPLACE_CONTRACT) {
    throw new Error("MARKETPLACE_CONTRACT not set in .env");
  }

  const RESEARCH_PASSPORT_CONTRACT =
    process.env.RESEARCH_PASSPORT_CONTRACT ||
    "0x3156F6E761D7c9dA0a88A6165864995f2b58854f";

  console.log("📍 Marketplace Contract:", MARKETPLACE_CONTRACT);
  console.log("📍 Research Passport Contract:", RESEARCH_PASSPORT_CONTRACT);
  console.log("\n🔨 Creating listings...\n");

  // Read marketplace artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/DARAMarketplace.sol/DARAMarketplace.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  // Connect to marketplace contract
  const marketplace = new ethers.Contract(
    MARKETPLACE_CONTRACT,
    artifact.abi,
    signer
  );

  // Create each listing
  for (let i = 0; i < sampleListings.length; i++) {
    const listing = sampleListings[i];

    try {
      console.log(
        `${i + 1}/${sampleListings.length} Creating: ${listing.metadata.title}`
      );
      console.log(`   Price: ${ethers.formatEther(listing.price)} OG`);
      console.log(`   Quantity: ${listing.quantity}`);

      const tx = await marketplace.createListing(
        RESEARCH_PASSPORT_CONTRACT,
        listing.tokenId,
        listing.price,
        listing.quantity,
        listing.metadata
      );

      console.log(`   📤 TX sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
      console.log(
        `   🔗 ${process.env.OG_EXPLORER_MAINNET || "https://chainscan.0g.ai"}/tx/${tx.hash}\n`
      );
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log("✅ All listings created!");
  console.log("\n🎯 Next Steps:");
  console.log("1. Test locally: npm run dev");
  console.log("2. Visit http://localhost:5173/research-infts");
  console.log("3. Connect your wallet");
  console.log("4. Browse and buy research iNFTs!");
  console.log("5. Try claiming the FREE welcome NFT!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
