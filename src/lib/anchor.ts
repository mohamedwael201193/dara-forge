// src/lib/anchor.ts
import { writeContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wallet";
import daraAbi from "@/abi/Dara.json";

const CONTRACT = import.meta.env.VITE_DARA_CONTRACT as `0x${string}` | undefined;

/**
 * Anchor a dataset root on-chain (stub-friendly).
 * Throws with a helpful message if CONTRACT is not provided.
 */
export async function anchorData(root: `0x${string}`) {
  if (!CONTRACT) throw new Error("Missing VITE_DARA_CONTRACT env var");
  return writeContract(wagmiConfig, {
    address: CONTRACT,
    abi: daraAbi as any,
    functionName: "anchorData",
    args: [root],
  });
}

