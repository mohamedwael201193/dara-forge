import { ethers } from "ethers";

// Pull config from env with safe defaults (docs values)
const RPC_URL = process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc-testnet.0g.ai/";
const INDEXER_RPC = (process.env.NEXT_PUBLIC_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");

/**
 * Upload a Blob to 0G Storage using the TS SDK in the browser with the user\'s wallet as signer.
 * Returns the file\'s Merkle root (rootHash) and the upload transaction hash (txHash).
 */
export async function uploadBlobTo0GStorageViaBrowser(blob: Blob, filename: string): Promise<{ rootHash: string; txHash: string }> {
  // Dynamically import the ESM browser build to avoid SSR issues
  const mod = await import("@0glabs/0g-ts-sdk");
  if (!mod) throw new Error("0G TS SDK not found. Ensure @0glabs/0g-ts-sdk is installed.");

  const Indexer = (mod as any).Indexer;
  // The SDK exposes a Blob class for browser usage (not the DOM Blob).
  const OgBlob = (mod as any).Blob || (mod as any).ZgBlob || (mod as any).ZgFile;
  if (!Indexer || !OgBlob) throw new Error("0G SDK browser exports missing (Indexer/Blob).");

  // Wrap the input into the SDK\'s Blob
  const file = new OgBlob(blob, filename);

  // Build Merkle tree and get root
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null) throw new Error(`Merkle tree error: ${treeErr}`);
  const rootHash = tree.rootHash();

  // Create indexer and signer from MetaMask
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const indexer = new Indexer(INDEXER_RPC);

  // Upload
  const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer);
  if (uploadErr !== null) throw new Error(`0G upload error: ${uploadErr}`);
  await file.close?.();

  // tx may be a string or object; normalize
  const txHash = typeof tx === "string" ? tx : tx?.hash || tx?.transactionHash || String(tx);

  return { rootHash, txHash };
}

/** Convenience: build an HTTP gateway URL to download by root hash */
export function gatewayUrlForRoot(rootHash: string, name?: string) {
  const base = INDEXER_RPC.replace(/\/$/, "");
  const n = name ? `&name=${encodeURIComponent(name)}` : "";
  return `${base}/file?root=${encodeURIComponent(rootHash)}${n}`;
}


