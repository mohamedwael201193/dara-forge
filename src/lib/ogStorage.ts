"use client";

import { ethers } from "ethers";

const RPC_URL = process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc-testnet.0g.ai/";
const INDEXER_RPC = (process.env.NEXT_PUBLIC_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");

// Use CDN import directly to bypass Node.js built-in issues in Vite
async function loadOgSdk(): Promise<any> {
  return await import("https://esm.sh/@0glabs/0g-ts-sdk/dist/zgstorage.esm.js");
}

/**
 * Upload a Blob to 0G Storage in the browser using the user's MetaMask signer.
 * Returns the file Merkle root (rootHash) and the upload tx hash (string).
 */
export async function uploadBlobTo0GStorageViaBrowser(
  blob: Blob,
  filename: string
): Promise<{ rootHash: string; txHash: string }> {
  const mod = await loadOgSdk();
  const Indexer = (mod as any).Indexer;
  const SDKBlob = (mod as any).Blob; // SDK's browser Blob with merkleTree()

  if (!Indexer || !SDKBlob) {
    throw new Error("0G SDK exports not found. Expected { Indexer, Blob }.");
  }

  // Wrap the DOM Blob in SDK Blob to access merkleTree()
  const file = new SDKBlob(blob, filename);

  // Compute Merkle root (storage fileId)
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null) throw new Error(`Merkle tree error: ${treeErr}`);
  const rootHash = tree.rootHash();

  // MetaMask signer (ethers v6)
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();

  const indexer = new Indexer(INDEXER_RPC);
  const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer);
  if (uploadErr !== null) throw new Error(`0G upload error: ${uploadErr}`);

  await file.close?.();

  const txHash = typeof tx === "string" ? tx : tx?.hash || tx?.transactionHash || String(tx);
  return { rootHash, txHash };
}

/** Build an indexer gateway URL to fetch by root hash (optional "name" to hint filename) */
export function gatewayUrlForRoot(rootHash: string, name?: string) {
  const base = INDEXER_RPC.replace(/\/$/, "");
  const n = name ? `&name=${encodeURIComponent(name)}` : "";
  return `${base}/file?root=${encodeURIComponent(rootHash)}${n}`;
}


