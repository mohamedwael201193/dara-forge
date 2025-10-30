// =============================================================================
// ERC-7857 RESEARCH PASSPORT NFT DEPLOYMENT TO 0G MAINNET
// =============================================================================
// Wave 5: Deploy Research Passport iNFT contract to production mainnet
// Network: 0G Mainnet (Chain ID: 16661)
// Purpose: Verifiable research achievement NFTs with oracle-verified transfers

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
  
  // Access ethers directly
  const ethers = (await import("ethers")).default || (await import("ethers"));
  
  // Since Hardhat runs this, use the provider from environment
  const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL_MAINNET || "https://evmrpc.0g.ai");
  const signer = new ethers.Wallet(process.env.OG_MAINNET_PRIVATE_KEY, provider);
  
  console.log("\n🚀 ERC-7857 Research Passport Deployment to 0G Mainnet");
  console.log("=".repeat(70));

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

  // First deploy MockOracleVerifier (temporary, will be replaced with real oracle)
  console.log("\n📦 Deploying MockOracleVerifier (for testing)...");
  const MockOracleArtifact = JSON.parse(readFileSync(path.join(__dirname, "../artifacts/contracts/test/MockOracleVerifier.sol/MockOracleVerifier.json"), "utf8"));
  const mockFactory = new ethers.ContractFactory(MockOracleArtifact.abi, MockOracleArtifact.bytecode, signer);
  const mockOracle = await mockFactory.deploy();
  await mockOracle.waitForDeployment();
  const oracleAddress = await mockOracle.getAddress();
  console.log("✅ MockOracleVerifier deployed to:", oracleAddress);

  // Deploy ERC7857ResearchPassport
  console.log("\n📦 Deploying ERC7857ResearchPassport...");
  const PassportArtifact = JSON.parse(readFileSync(path.join(__dirname, "../artifacts/contracts/ERC7857ResearchPassport.sol/ERC7857ResearchPassport.json"), "utf8"));
  const passportFactory = new ethers.ContractFactory(PassportArtifact.abi, PassportArtifact.bytecode, signer);
  const passport = await passportFactory.deploy(
    deployer.address, // owner
    oracleAddress     // oracle verifier
  );
  
  await passport.waitForDeployment();
  const passportAddress = await passport.getAddress();

  console.log("✅ ERC7857ResearchPassport deployed to:", passportAddress);

  // Verify deployment
  const code = await provider.getCode(passportAddress);
  if (code === "0x") {
    console.error("❌ Deployment verification failed!");
    process.exit(1);
  }

  // Test basic functionality
  console.log("\n🧪 Testing Contract Functionality...");
  try {
    const name = await passport.name();
    const symbol = await passport.symbol();
    const owner = await passport.owner();
    const oracle = await passport.getOracle();
    const proofWindow = await passport.getProofWindow();
    const totalSupply = await passport.totalSupply();

    console.log("✅ Contract Info:");
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Owner:", owner);
    console.log("   Oracle:", oracle);
    console.log("   Proof Window:", proofWindow.toString(), "seconds");
    console.log("   Total Supply:", totalSupply.toString());
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }

  // Output deployment info
  console.log("\n📋 Deployment Summary");
  console.log("=".repeat(70));
  console.log("Contract Name:          ERC7857ResearchPassport");
  console.log("Token Name:             DARA Research Passport");
  console.log("Token Symbol:           DRP");
  console.log("Contract Address:       ", passportAddress);
  console.log("Oracle Address:         ", oracleAddress);
  console.log("Deployer/Owner:         ", deployer.address);
  console.log("Network:                0G Mainnet");
  console.log("Chain ID:               16661");
  console.log("Block Explorer:         https://chainscan.0g.ai/address/" + passportAddress);
  console.log("=".repeat(70));

  // Save to contracts/addresses.json
  const addressesPath = path.join(__dirname, "../contracts/addresses.json");
  let addresses = {};
  
  if (existsSync(addressesPath)) {
    addresses = JSON.parse(readFileSync(addressesPath, "utf8"));
  }
  
  addresses.ERC7857ResearchPassport = {
    mainnet: passportAddress,
    oracle: oracleAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    chainId: 16661,
    network: "0G Mainnet",
    name: "DARA Research Passport",
    symbol: "DRP"
  };
  
  writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\n✅ Addresses saved to contracts/addresses.json");

  // Update .env instructions
  console.log("\n📝 Next Steps:");
  console.log("1. Update .env file:");
  console.log(`   VITE_RESEARCH_PASSPORT_CONTRACT=${passportAddress}`);
  console.log(`   RESEARCH_PASSPORT_CONTRACT=${passportAddress}`);
  console.log(`   ORACLE_VERIFIER_CONTRACT=${oracleAddress}`);
  console.log("\n2. Verify contracts on block explorer:");
  console.log(`   npx hardhat verify --network og-mainnet ${passportAddress} "${deployer.address}" "${oracleAddress}"`);
  console.log(`   npx hardhat verify --network og-mainnet ${oracleAddress}`);
  console.log("\n3. Update frontend to enable iNFT minting");
  console.log("\n🎉 Deployment Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment Error:", error);
    process.exit(1);
  });
