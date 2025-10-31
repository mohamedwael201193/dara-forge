// =============================================================================
// DARA MARKETPLACE CONTRACT DEPLOYMENT TO 0G MAINNET
// =============================================================================
// Wave 5: Deploy DARAMarketplace contract for trading research iNFTs
// Network: 0G Mainnet (Chain ID: 16661)
// Purpose: Decentralized marketplace for research NFT trading

import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function main() {
  // Get hardhat runtime environment
  const hre = await import("hardhat");
  
  // Access ethers
  const ethers = (await import("ethers")).default || (await import("ethers"));
  
  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(
    process.env.OG_RPC_URL_MAINNET || "https://evmrpc.0g.ai"
  );
  const signer = new ethers.Wallet(process.env.OG_MAINNET_PRIVATE_KEY, provider);
  
  console.log("\n🚀 DARA Marketplace Deployment to 0G Mainnet");
  console.log("=".repeat(60));

  // Get deployer account
  const deployer = signer;
  console.log("📍 Deployer address:", deployer.address);

  // Check balance
  const balance = await provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "OG");

  if (balance < ethers.parseEther("0.1")) {
    console.error("❌ Insufficient balance! Need at least 0.1 OG for deployment");
    process.exit(1);
  }

  // Get network info
  const network = await provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());

  if (network.chainId !== 16661n) {
    console.error(`❌ Wrong network! Expected chain ID 16661, got ${network.chainId}`);
    process.exit(1);
  }

  // Get Research Passport contract address
  const RESEARCH_PASSPORT_CONTRACT = 
    process.env.RESEARCH_PASSPORT_CONTRACT || 
    "0x3156F6E761D7c9dA0a88A6165864995f2b58854f";
  
  // Treasury address (deployer by default)
  const TREASURY_ADDRESS = deployer.address;

  console.log("\n📋 Deployment Parameters:");
  console.log("Research Passport Contract:", RESEARCH_PASSPORT_CONTRACT);
  console.log("Treasury Address:", TREASURY_ADDRESS);
  console.log("");

  // Read contract artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/DARAMarketplace.sol/DARAMarketplace.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  console.log("📝 Deploying DARAMarketplace contract...");
  
  // Create contract factory
  const ContractFactory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  // Deploy contract
  const marketplace = await ContractFactory.deploy(
    TREASURY_ADDRESS,
    RESEARCH_PASSPORT_CONTRACT
  );

  console.log("⏳ Waiting for deployment transaction...");
  await marketplace.waitForDeployment();

  const marketplaceAddress = await marketplace.getAddress();

  console.log("\n✅ DARAMarketplace deployed successfully!");
  console.log("📍 Contract Address:", marketplaceAddress);
  console.log("🔗 Explorer:", `https://chainscan.0g.ai/address/${marketplaceAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: "0G Mainnet",
    chainId: 16661,
    marketplaceContract: marketplaceAddress,
    researchPassportContract: RESEARCH_PASSPORT_CONTRACT,
    treasury: TREASURY_ADDRESS,
    platformFee: "2.5%",
    royalty: "5%",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    deploymentTx: marketplace.deploymentTransaction()?.hash,
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const outputPath = path.join(__dirname, "../deployment-marketplace.json");
  writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment-marketplace.json");

  console.log("\n🎯 Next Steps:");
  console.log("1. Add to .env file:");
  console.log(`   MARKETPLACE_CONTRACT=${marketplaceAddress}`);
  console.log(`   VITE_MARKETPLACE_CONTRACT=${marketplaceAddress}`);
  console.log("");
  console.log("2. Create marketplace listings:");
  console.log("   npx hardhat run scripts/create-marketplace-listings.mjs --network og-mainnet");
  console.log("");
  console.log("3. Test on frontend:");
  console.log("   Visit https://dara-forge.vercel.app/research-infts");
  console.log("");

  console.log("✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
