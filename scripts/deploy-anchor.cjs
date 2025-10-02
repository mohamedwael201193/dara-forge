const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DaraAnchor to Galileo (16602)...");
  const Factory = await ethers.getContractFactory("DaraAnchor");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log(`DaraAnchor deployed at: ${addr}`);
  console.log("ACTION: Set DARA_CONTRACT (server) and VITE_DARA_CONTRACT (client) to this address, then redeploy Vercel.");
}

main().catch((e) => { console.error(e); process.exit(1); });