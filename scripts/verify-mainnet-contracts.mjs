// =============================================================================
// CONTRACT VERIFICATION SCRIPT FOR 0G MAINNET BLOCK EXPLORER
// =============================================================================
// Verifies deployed contracts on https://chainscan.0g.ai

import { exec } from "child_process";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const execPromise = util.promisify(exec);

async function verifyContract(contractAddress, constructorArgs = [], contractName = "") {
  console.log(`\n🔍 Verifying ${contractName || 'contract'}: ${contractAddress}`);
  
  try {
    const argsString = constructorArgs.length > 0 
      ? constructorArgs.map(arg => `"${arg}"`).join(" ")
      : "";
    
    const command = `npx hardhat verify --network og-mainnet --config hardhat.config.cjs ${contractAddress} ${argsString}`;

    console.log("📝 Command:", command);
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes("Already Verified")) console.error(stderr);
    
    console.log(`✅ ${contractName || 'Contract'} verified successfully!`);
    console.log(`🔗 View at: https://chainscan.0g.ai/address/${contractAddress}`);
    
    return true;
  } catch (error) {
    if (error.message.includes("Already Verified") || error.stdout?.includes("Already Verified")) {
      console.log(`ℹ️  ${contractName || 'Contract'} already verified`);
      console.log(`🔗 View at: https://chainscan.0g.ai/address/${contractAddress}`);
      return true;
    }
    console.error(`❌ Verification failed for ${contractName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("\n🔍 0G Mainnet Contract Verification");
  console.log("=".repeat(60));

  // Load addresses from contracts/addresses.json
  const addressesPath = path.join(__dirname, "../contracts/addresses.json");
  
  let addressesContent;
  try {
    addressesContent = readFileSync(addressesPath, "utf8");
  } catch (error) {
    console.error("❌ contracts/addresses.json not found!");
    console.log("ℹ️  Deploy contracts first using deployment scripts");
    process.exit(1);
  }

  const addresses = JSON.parse(addressesContent);
  console.log("📋 Loaded addresses from contracts/addresses.json\n");
  console.log("🌐 Network: 0G Mainnet (Chain ID: 16661)");
  console.log("🔗 Explorer: https://chainscan.0g.ai\n");

  let successCount = 0;
  let failCount = 0;

  // Verify DaraAnchor
  if (addresses.DaraAnchor?.mainnet) {
    const success = await verifyContract(
      addresses.DaraAnchor.mainnet,
      [],
      "DaraAnchor"
    );
    success ? successCount++ : failCount++;
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between verifications
  }

  // Verify ERC7857ResearchPassport
  if (addresses.ERC7857ResearchPassport?.mainnet) {
    const deployer = addresses.ERC7857ResearchPassport.deployer;
    const oracle = addresses.ERC7857ResearchPassport.oracle;
    
    const success = await verifyContract(
      addresses.ERC7857ResearchPassport.mainnet,
      [deployer, oracle],
      "ERC7857ResearchPassport"
    );
    success ? successCount++ : failCount++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Verify MockOracleVerifier
  if (addresses.ERC7857ResearchPassport?.oracle) {
    const success = await verifyContract(
      addresses.ERC7857ResearchPassport.oracle,
      [],
      "MockOracleVerifier"
    );
    success ? successCount++ : failCount++;
  }

  // Summary
  console.log("\n📊 Verification Summary");
  console.log("=".repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log("=".repeat(60));

  if (successCount > 0) {
    console.log("\n🎉 Contract(s) verified on 0G Mainnet block explorer!");
    console.log("🔗 Block Explorer: https://chainscan.0g.ai");
  }

  if (failCount > 0) {
    console.log("\n⚠️  Some verifications failed. You can verify manually:");
    console.log("   1. Go to https://chainscan.0g.ai");
    console.log("   2. Search for your contract address");
    console.log("   3. Click 'Verify & Publish' and follow instructions");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification Error:", error);
    process.exit(1);
  });
