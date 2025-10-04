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

async function tryEsm(spec: string): Promise<BrokerModule | null> {
  try {
    const m = (await import(spec)) as BrokerModule;
    return m;
  } catch {
    return null;
  }
}

async function tryCjs(spec: string): Promise<any | null> {
  try {
    const { createRequire } = await import("node:module");
    const req = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = req(spec);
    return m as BrokerModule;
  } catch {
    return null;
  }
}

async function loadBrokerFactory(): Promise<{
  create: (wallet: any) => Promise<any>;
  moduleKind: "esm" | "cjs" | "unknown";
  modulePath: string;
}> {
  const override = process.env.BROKER_IMPORT_PATH;
  const base = "@0glabs/0g-serving-broker";
  const candidates = override
    ? [override]
    : [
        base,
        `${base}/index.js`,
        `${base}/dist/index.js`,
        `${base}/dist/cjs/index.cjs`,
        `${base}/dist/cjs/index.js`,
      ];

  const errors: string[] = [];

  for (const p of candidates) {
    // 1) try ESM
    const esm = await tryEsm(p);
    if (esm) {
      const fn =
        esm.createZGComputeNetworkBroker ||
        esm.default?.createZGComputeNetworkBroker;
      if (typeof fn === "function") {
        _modKind = esm.createZGComputeNetworkBroker ? "esm" : "cjs";
        _modPath = p;
        return { create: fn, moduleKind: _modKind, modulePath: p };
      }
      errors.push(`ESM ${p} loaded but no createZGComputeNetworkBroker export`);
    }

    // 2) try CJS
    const cjs = await tryCjs(p);
    if (cjs) {
      const fn =
        cjs.createZGComputeNetworkBroker ||
        cjs.default?.createZGComputeNetworkBroker;
      if (typeof fn === "function") {
        _modKind = cjs.createZGComputeNetworkBroker ? "cjs" : "esm";
        _modPath = p;
        return { create: fn, moduleKind: _modKind, modulePath: p };
      }
      errors.push(`CJS ${p} loaded but no createZGComputeNetworkBroker export`);
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

// Normalize balance shape across SDK versions
function getBalanceNumber(ledger: any): number {
  const b = ledger?.balance ?? ledger?.totalBalance ?? ledger?.total ?? "0";
  const n = Number(b);
  return Number.isFinite(n) ? n : 0;
}

// Attempt all known funding APIs across SDK versions
async function fundAccount(b: any, amount: number) {
  // Newer
  if (typeof b?.ledger?.addLedger === "function") {
    return b.ledger.addLedger(amount);
  }
  // Also used in docs
  if (typeof b?.ledger?.depositFund === "function") {
    return b.ledger.depositFund(amount);
  }
  // Some versions may expose explicit account creation
  if (typeof b?.ledger?.addAccount === "function") {
    return b.ledger.addAccount(amount);
  }
  throw new Error("No compatible ledger funding API found (addLedger | depositFund | addAccount).");
}

export async function ensureLedger(min = Number(process.env.OG_COMPUTE_MIN || "0.1")) {
  const b = await getBroker();
  const led = await b.ledger.getLedger().catch(() => ({ balance: "0" }));
  const bal = getBalanceNumber(led);
  if (bal < min) {
    // Fund with (min - bal) rounded up a bit
    const toFund = Math.max(min - bal, min);
    await fundAccount(b, toFund);
  }
  return { before: bal };
}

// Explicit init endpoint can call this to force creation/funding
export async function initComputeAccount(amount = Number(process.env.OG_COMPUTE_INIT_AMOUNT || "0.1")) {
  const b = await getBroker();
  await fundAccount(b, amount);
  const ledger = await b.ledger.getLedger().catch(() => ({ balance: "0" }));
  return { ok: true, ledger };
}