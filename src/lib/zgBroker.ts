import { ethers } from "ethers";

type BrokerModule = {
  createZGComputeNetworkBroker?: (wallet: any) => Promise<any>;
  default?: { createZGComputeNetworkBroker?: (wallet: any) => Promise<any> };
};

let _broker: any | null = null;
let _modKind: "esm" | "cjs" | "unknown" | null = null;
let _modPath: string | null = null;

export function brokerDiagnostics() {
  return { kind: _modKind, path: _modPath };
}

async function loadBrokerFactory(): Promise<{
  create: (wallet: any) => Promise<any>;
  moduleKind: "esm" | "cjs" | "unknown";
  modulePath: string;
}> {
  const override = process.env.BROKER_IMPORT_PATH;
  const candidates = override
    ? [override]
    : [
        "@0glabs/0g-serving-broker",
        "@0glabs/0g-serving-broker/index.js",
        "@0glabs/0g-serving-broker/dist/index.js",
        "@0glabs/0g-serving-broker/dist/cjs/index.cjs",
        "@0glabs/0g-serving-broker/dist/cjs/index.js",
      ];

  const errors: string[] = [];

  for (const p of candidates) {
    try {
      const mod = (await import(p)) as BrokerModule;
      const fn =
        mod?.createZGComputeNetworkBroker ||
        mod?.default?.createZGComputeNetworkBroker;
      if (typeof fn === "function") {
        const kind =
          mod?.createZGComputeNetworkBroker ? "esm" :
          mod?.default?.createZGComputeNetworkBroker ? "cjs" :
          "unknown";
        return { create: fn, moduleKind: kind, modulePath: p };
      }
      errors.push(`Loaded ${p} but no createZGComputeNetworkBroker export`);
    } catch (e: any) {
      errors.push(`${p}: ${e?.message || String(e)}`);
    }
  }
  throw new Error(`Failed to load 0G broker module. Tried: ${candidates.join(", ")}. Errors: ${errors.join(" | ")}`);
}

export async function getBroker() {
  if (_broker) return _broker;

  const { create, moduleKind, modulePath } = await loadBrokerFactory();
  _modKind = moduleKind;
  _modPath = modulePath;

  const rpc = process.env.OG_RPC_URL || process.env.OG_COMPUTE_RPC || "https://evmrpc-testnet.0g.ai";
  const pk =
    process.env.OG_COMPUTE_PRIVATE_KEY ||
    process.env.OG_COMPUTE_API_KEY ||
    process.env.OG_STORAGE_PRIVATE_KEY;

  if (!rpc) throw new Error("Missing env OG_RPC_URL/OG_COMPUTE_RPC");
  if (!pk) throw new Error("Missing env OG_COMPUTE_PRIVATE_KEY/OG_COMPUTE_API_KEY/OG_STORAGE_PRIVATE_KEY");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);

  _broker = await create(wallet);
  return _broker;
}

export async function ensureLedger(min = 0.05) {
  const b = await getBroker();
  const led = await b.ledger.getLedger().catch(() => ({ balance: "0" }));
  const bal = Number(led.balance || "0");
  if (bal < min) await b.ledger.addLedger(String(min));
  return { before: bal };
}