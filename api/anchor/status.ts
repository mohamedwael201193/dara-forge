import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
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