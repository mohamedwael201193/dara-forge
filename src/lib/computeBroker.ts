import { createZGComputeNetworkBroker, type ZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { ethers } from "ethers";

let broker: ZGComputeNetworkBroker | null = null;

export async function getBroker() {
  if (broker) return broker;
  const rpc = process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const pk = process.env.OG_COMPUTE_PRIVATE_KEY;
  if (!pk) throw new Error("Missing OG_COMPUTE_PRIVATE_KEY");
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  broker = await createZGComputeNetworkBroker(wallet);
  return broker;
}

export async function ensureLedger(min = Number(process.env.OG_MIN_LEDGER_BALANCE || "0.05")) {
  const b = await getBroker();
  const l = await b.ledger.getLedger();
  // Check available balance property (could be balance, availableBalance, etc.)
  const bal = Number((l as any).balance || (l as any).availableBalance || "0");
  if (bal < min) {
    await b.ledger.addLedger(min); // fund to threshold as number
  }
  return { balance: bal };
}