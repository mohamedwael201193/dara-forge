import { DARA_ANCHOR_ABI } from "@/lib/abis/daraAnchor";
import { requireEthersSigner } from "@/lib/ethersClient";
import { ethers } from "ethers";

const EXPLORER = import.meta.env.VITE_OG_EXPLORER || "https://chainscan-galileo.0g.ai";
const DARA_CONTRACT = import.meta.env.VITE_DARA_CONTRACT as `0x${string}`;

function toBytes32Smart(v?: string): `0x${string}` {
  if (!v) return ("0x" + "00".repeat(32)) as `0x${string}`;
  const hx = v.startsWith("0x") ? v : `0x${v}`;
  if (/^0x[0-9a-fA-F]{64}$/.test(hx)) return hx as `0x${string}`;
  return ethers.id(v) as `0x${string}`;
}

export async function anchorWithWallet(rootHash: `0x${string}`, manifest?: string, project?: string) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(rootHash)) throw new Error("rootHash must be bytes32 0x…64 hex");
  const signer = await requireEthersSigner();
  const contract = new ethers.Contract(DARA_CONTRACT, DARA_ANCHOR_ABI, signer);
  const tx = await contract.anchor(rootHash, toBytes32Smart(manifest ?? rootHash), toBytes32Smart(project ?? "dara-forge"));
  const rc = await tx.wait();
  return { txHash: rc.hash as `0x${string}`, explorerUrl: `${EXPLORER}/tx/${rc.hash}` };
}