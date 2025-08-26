import { ethers } from "ethers";

export async function uploadFileViaApi(file: File, addr: string) {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("metadata", JSON.stringify({
    title: file.name,
    description: `Uploaded file: ${file.name}`,
    contributors: [addr],
    isPublic: true,
  }));
  const r = await fetch("/api/upload", {
    method: "POST",
    body: fd,
    headers: { "X-Wallet-Address": addr },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.success) throw new Error(data?.message || `Upload failed (${r.status})`);
  return data as { rootHash: string; txHash: string; filename: string; size: number };
}

// New function for client-side anchoring with wallet
export async function anchorWithWallet(datasetId: string, rootHashHex: string, metadata: any) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const rh = ethers.hexlify(ethers.zeroPadValue(rootHashHex, 32));
  const contract = new ethers.Contract(import.meta.env.VITE_DARA_CONTRACT!, [
    "function anchorDataset(string datasetId, bytes32 rootHash, string metadata) external returns (uint256)"
  ], signer);
  const tx = await contract.anchorDataset(datasetId, rh, JSON.stringify(metadata || {}));
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}


