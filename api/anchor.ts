import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";

function toBytes32Smart(v?: string): `0x${string}` {
  if (!v) return ("0x" + "00".repeat(32)) as `0x${string}`;
  const hexLike = v.startsWith("0x") ? v : `0x${v}`;
  if (/^0x[0-9a-fA-F]{64}$/.test(hexLike)) return hexLike as `0x${string}`;
  return ethers.id(v) as `0x${string}`;
}

async function handleStatus(_req: VercelRequest, res: VercelResponse) {
  try {
    const rpcOk = !!process.env.OG_RPC_URL;
    const pkOk = !!process.env.OG_STORAGE_PRIVATE_KEY;
    const addr = process.env.DARA_CONTRACT || "";
    const hasAddr = !!addr;

    let chainId: string | null = null;
    let hasCode: boolean | null = null;

    if (rpcOk && hasAddr) {
      const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL!);
      const net = await provider.getNetwork();
      chainId = net.chainId?.toString?.() ?? null;
      const code = await provider.getCode(addr);
      hasCode = !!code && code !== "0x";
    }

    return res.status(200).json({
      ok: true,
      env: { OG_RPC_URL: rpcOk, OG_STORAGE_PRIVATE_KEY: pkOk, DARA_CONTRACT: hasAddr },
      network: { chainId },
      contract: { address: addr, hasCode }
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "status error" });
  }
}

async function handleAnchor(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { rootHash, manifestHash, projectId } = (req.body ?? {}) as {
      rootHash?: string; manifestHash?: string; projectId?: string;
    };
    if (!rootHash || !/^0x[0-9a-fA-F]{64}$/.test(rootHash)) {
      return res.status(400).json({ ok: false, error: "rootHash must be 32-byte hex" });
    }

    const OG_RPC_URL = process.env.OG_RPC_URL;
    const PRIV = process.env.OG_STORAGE_PRIVATE_KEY;
    const CONTRACT_ADDRESS = process.env.DARA_CONTRACT;
    if (!OG_RPC_URL) return res.status(500).json({ ok: false, error: "Missing OG_RPC_URL" });
    if (!PRIV) return res.status(500).json({ ok: false, error: "Missing OG_STORAGE_PRIVATE_KEY" });
    if (!CONTRACT_ADDRESS) return res.status(500).json({ ok: false, error: "Missing DARA_CONTRACT" });

    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const signer = new ethers.Wallet(PRIV, provider);

    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (!code || code === "0x") {
      return res.status(500).json({ ok: false, error: `No contract at ${CONTRACT_ADDRESS} on current network` });
    }
    const ABI = [
      "function anchor(bytes32 root, bytes32 manifestHash, bytes32 projectId) external",
      "event DatasetAnchored(uint256 indexed id, bytes32 indexed root, bytes32 indexed manifestHash, bytes32 projectId, address uploader, uint256 timestamp)"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const root = rootHash as `0x${string}`;
    const manifest = toBytes32Smart(manifestHash);
    const project = toBytes32Smart(projectId || "dara-forge");

    const tx = await contract.anchor(root, manifest, project);
    const receipt = await tx.wait();

    const iface = new ethers.Interface(ABI);
    let datasetId: string | null = null;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === "DatasetAnchored") {
          datasetId = parsed.args.id.toString();
          break;
        }
      } catch {}
    }

    const explorer = process.env.VITE_OG_EXPLORER || "https://chainscan-galileo.0g.ai";
    const net = await provider.getNetwork();

    return res.status(200).json({
      ok: true,
      datasetId,
      rootHash: root,
      manifestHash: manifest,
      projectId: project,
      txHash: receipt.hash,
      chainId: net.chainId.toString(),
      explorerUrl: `${explorer}/tx/${receipt.hash}`
    });
  } catch (e: any) {
    console.error("Anchor error:", e?.stack || e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || "anchor failed" });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  if (action === 'status') {
    return handleStatus(req, res);
  } else if (!action || action === 'anchor') {
    return handleAnchor(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid action. Use ?action=status or POST for anchoring' });
  }
}

