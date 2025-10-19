// scripts/compute-fund.ts
import "dotenv/config";
import { ethers } from "ethers";
import { createRequire } from "node:module";

// Load 0G SDK via CommonJS to avoid ESM issues
const require = createRequire(import.meta.url);
let createZGComputeNetworkBroker: any;

try {
  const sdk = require("@0glabs/0g-serving-broker");
  createZGComputeNetworkBroker = sdk.createZGComputeNetworkBroker;
  if (!createZGComputeNetworkBroker) {
    throw new Error("createZGComputeNetworkBroker not found in SDK");
  }
} catch (error) {
  console.error("Failed to load SDK:", error);
  throw new Error("0G SDK failed to load - this is a critical error");
}

async function main() {
  const rpc = process.env.OG_RPC || "https://evmrpc-testnet.0g.ai";
  const pk = process.env.OG_COMPUTE_PRIVATE_KEY!;
  if (!pk) throw new Error("Missing OG_COMPUTE_PRIVATE_KEY");

  // Use the provider you want to run with (or pass via CLI)
  const providerAddress =
    process.env.OG_COMPUTE_PREF_PROVIDER ||
    process.argv[2] || // allow: tsx scripts/compute-fund.ts 0xProvider...
    "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3";

  // How much to move into the sub-account (covers "response reservation" too)
  const amountEth =
    process.env.OG_COMPUTE_FUND_AMOUNT || process.argv[3] || "0.5";
  const amount = ethers.parseEther(amountEth);

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);

  console.log("🔗 RPC:", rpc);
  console.log("👛 Broker wallet:", wallet.address);
  console.log("🤝 Provider signer (sub-account key):", providerAddress);
  console.log("💸 Funding sub-account with:", amountEth, "OG");

  // Use default 0.5.4 contracts (they work) - based on our successful smoke test
  console.log("🔧 Initializing broker with default contracts...");
  const broker = await createZGComputeNetworkBroker(wallet);

  // Good practice: acknowledge provider first (idempotent)
  try {
    await broker.inference.acknowledgeProviderSigner(providerAddress);
    console.log("✅ Provider acknowledged");
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (/already|ack/i.test(msg))
      console.log("ℹ️ Provider already acknowledged");
    else throw e;
  }

  // Check current ledger status
  const ledger: any = (broker as any).ledger;
  console.log("🔍 Checking ledger status...");

  try {
    const account = await ledger.getLedger();
    const balance = Number(ethers.formatEther(account.totalBalance || 0));
    console.log("🏦 Main ledger balance:", balance, "OG");

    if (balance < Number(amountEth) + 0.5) {
      // Need extra for transfer
      const needed = Number(amountEth) + 0.5 - balance;
      console.log(`💰 Depositing ${needed.toFixed(2)} OG to main ledger...`);
      await ledger.depositFund(needed);
      console.log("✅ Ledger topped up");
    }
  } catch (error: any) {
    if (error.message?.includes("does not exist")) {
      console.log("🏦 Creating new ledger account...");
      await ledger.addLedger(Number(amountEth) + 0.5);
      console.log("✅ Ledger created");
    } else {
      throw error;
    }
  }

  // Transfer funds from main ledger → provider's sub-account
  console.log("💸 Transferring funds to provider sub-account...");

  try {
    await ledger.transferFund(providerAddress, amount);
  } catch (e: any) {
    console.error("Transfer error details:", e);
    throw new Error(`Failed to transfer funds: ${e.message}`);
  }

  console.log(
    "✅ Transfer submitted. Waiting a few seconds for it to settle..."
  );
  await new Promise((r) => setTimeout(r, 6000));

  // Optional: verify sub-account balance if SDK exposes it
  if (ledger.getSubAccountBalance) {
    const subBal = await ledger.getSubAccountBalance(providerAddress);
    console.log(
      "🧾 Provider sub-account balance:",
      subBal?.toString?.() || subBal
    );
  }

  console.log("🎉 Done. Re-run your smoke test or the Tech → Compute action.");
}

main().catch((e) => {
  console.error("❌ Funding failed:", e);
  process.exit(1);
});
