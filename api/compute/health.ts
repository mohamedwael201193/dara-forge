import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

export default async function handler(_req: any, res: any) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.OG_EVM_RPC!);
    const wallet = new ethers.Wallet(process.env.OG_PRIVATE_KEY!, provider);
    const broker = await createZGComputeNetworkBroker(wallet);

    const listFn = (broker as any).inference?.listService?.bind((broker as any).inference)
      ?? (broker as any).listService?.bind(broker);
    const services = listFn ? await listFn() : [];

    res.status(200).json({ ok: true, servicesCount: services?.length ?? 0 });
  } catch (err: any) {
    console.error("Health check failed:", err);
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

