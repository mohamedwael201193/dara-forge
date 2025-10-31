const { ethers } = require("hardhat");
require("dotenv/config");

async function main() {
  console.log("🚀 Deploying DARA Marketplace to 0G Mainnet...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying from account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "OG");

  // Get existing Research Passport contract address
  const RESEARCH_PASSPORT_CONTRACT = process.env.RESEARCH_PASSPORT_CONTRACT || 
    "0x3156F6E761D7c9dA0a88A6165864995f2b58854f";
  
  // Treasury address (can be same as deployer or separate wallet)
  const TREASURY_ADDRESS = deployer.address;

  console.log("📜 Research Passport Contract:", RESEARCH_PASSPORT_CONTRACT);
  console.log("🏦 Treasury Address:", TREASURY_ADDRESS);

  // Deploy marketplace
  const DARAMarketplace = await ethers.getContractFactory("DARAMarketplace");
  const marketplace = await DARAMarketplace.deploy(
    TREASURY_ADDRESS,
    RESEARCH_PASSPORT_CONTRACT
  );

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log("✅ DARA Marketplace deployed!");
  console.log("📍 Marketplace Address:", marketplaceAddress);
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
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  fs.writeFileSync(
    "deployment-marketplace.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-marketplace.json");

  console.log("\n🎯 Next Steps:");
  console.log("1. Add MARKETPLACE_CONTRACT to .env:");
  console.log(`   MARKETPLACE_CONTRACT=${marketplaceAddress}`);
  console.log(`   VITE_MARKETPLACE_CONTRACT=${marketplaceAddress}`);
  console.log("2. Update frontend with contract address");
  console.log("3. Create initial marketplace listings");
  console.log("4. Test buying with real OG tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
