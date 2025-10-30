// =============================================================================
// DARA ANCHOR CONTRACT DEPLOYMENT TO 0G MAINNET
// =============================================================================
// Wave 5: Deploy DaraAnchor contract to production mainnet
// Network: 0G Mainnet (Chain ID: 16661)
// Purpose: Immutable on-chain research data commitments

import dotenv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function main() {
  // Get hardhat runtime environment
  const hre = await import("hardhat");
  
  // Access ethers from the extended hre.default
  const ethers = (await import("ethers")).default || (await import("ethers"));
  
  // Since Hardhat runs this, use the provider from hre
  const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL_MAINNET || "https://evmrpc.0g.ai");
  const signer = new ethers.Wallet(process.env.OG_MAINNET_PRIVATE_KEY, provider);
  
  console.log("\n🚀 DARA Anchor Deployment to 0G Mainnet");
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
    console.error("❌ Wrong network! Expected Chain ID 16661 (0G Mainnet)");
    process.exit(1);
  }

  console.log("\n📦 Deploying DaraAnchor Contract...");

  // Load contract
  const DaraAnchorArtifact = JSON.parse(readFileSync(path.join(__dirname, "../artifacts/contracts/DaraAnchor.sol/DaraAnchor.json"), "utf8"));
  const factory = new ethers.ContractFactory(DaraAnchorArtifact.abi, DaraAnchorArtifact.bytecode, signer);
  const daraAnchor = await factory.deploy();
  
  await daraAnchor.waitForDeployment();
  const contractAddress = await daraAnchor.getAddress();

  console.log("✅ DaraAnchor deployed to:", contractAddress);

  // Verify deployment
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    console.error("❌ Deployment verification failed!");
    process.exit(1);
  }

  // Test basic functionality
  console.log("\n🧪 Testing Contract Functionality...");
  try {
    const nextId = await daraAnchor.nextId();
    console.log("✅ Contract is functional. Next ID:", nextId.toString());
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }

  // Output deployment info
  console.log("\n📋 Deployment Summary");
  console.log("=" .repeat(60));
  console.log("Contract Name:      DaraAnchor");
  console.log("Contract Address:   ", contractAddress);
  console.log("Deployer:           ", deployer.address);
  console.log("Network:            0G Mainnet");
  console.log("Chain ID:           16661");
  console.log("Block Explorer:     https://chainscan.0g.ai/address/" + contractAddress);
  console.log("=" .repeat(60));

  // Save to contracts/addresses.json
  const addressesPath = path.join(__dirname, "../contracts/addresses.json");
  let addresses = {};
  
  if (existsSync(addressesPath)) {
    addresses = JSON.parse(readFileSync(addressesPath, "utf8"));
  }
  
  addresses.DaraAnchor = {
    mainnet: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    chainId: 16661,
    network: "0G Mainnet"
  };
  
  writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\n✅ Address saved to contracts/addresses.json");

  // Update .env instructions
  console.log("\n📝 Next Steps:");
  console.log("1. Update .env file:");
  console.log(`   VITE_DARA_CONTRACT=${contractAddress}`);
  console.log(`   DARA_CONTRACT=${contractAddress}`);
  console.log("\n2. Verify contract on block explorer:");
  console.log(`   npx hardhat verify --network og-mainnet ${contractAddress}`);
  console.log("\n3. Update server.js with new contract address");
  console.log("\n🎉 Deployment Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment Error:", error);
    process.exit(1);
  });
