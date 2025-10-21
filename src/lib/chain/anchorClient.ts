import { DARA_ANCHOR_ABI } from "@/lib/abis/daraAnchor";
import { requireEthersSigner } from "@/lib/ethersClient";
import { ethers } from "ethers";

const EXPLORER =
  import.meta.env.VITE_OG_EXPLORER || "https://chainscan-galileo.0g.ai";
const DARA_CONTRACT = import.meta.env.VITE_DARA_CONTRACT as `0x${string}`;

function toBytes32Smart(v?: string): `0x${string}` {
  if (!v) return ("0x" + "00".repeat(32)) as `0x${string}`;
  const hx = v.startsWith("0x") ? v : `0x${v}`;
  if (/^0x[0-9a-fA-F]{64}$/.test(hx)) return hx as `0x${string}`;
  return ethers.id(v) as `0x${string}`;
}

export async function anchorWithWallet(
  rootHash: `0x${string}`,
  manifest?: string,
  project?: string,
  metadata?: {
    datasetId?: string;
    storageIndexer?: string;
    daEndpoint?: string;
    description?: string;
  }
) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(rootHash)) {
    throw new Error("rootHash must be bytes32 0x…64 hex");
  }

  console.log("[Chain Anchor] Starting anchor transaction...");
  console.log("[Chain Anchor] Root hash:", rootHash);
  console.log("[Chain Anchor] Contract:", DARA_CONTRACT);

  const signer = await requireEthersSigner();
  const contract = new ethers.Contract(DARA_CONTRACT, DARA_ANCHOR_ABI, signer);

  const manifestBytes32 = toBytes32Smart(manifest ?? rootHash);
  const projectBytes32 = toBytes32Smart(project ?? "dara-forge");

  console.log("[Chain Anchor] Manifest hash:", manifestBytes32);
  console.log("[Chain Anchor] Project ID:", projectBytes32);

  // Estimate gas first to catch errors early and ensure enough gas
  let tx;
  try {
    const gasEstimate = await contract.anchor.estimateGas(
      rootHash,
      manifestBytes32,
      projectBytes32
    );
    console.log("[Chain Anchor] Gas estimate:", gasEstimate.toString());

    // Add 20% buffer to gas estimate to prevent out-of-gas errors
    const gasLimit = (gasEstimate * 120n) / 100n;
    console.log("[Chain Anchor] Using gas limit:", gasLimit.toString());

    // Submit the transaction with explicit gas limit
    tx = await contract.anchor(rootHash, manifestBytes32, projectBytes32, {
      gasLimit: gasLimit,
    });
    console.log("[Chain Anchor] Transaction submitted:", tx.hash);
  } catch (estimateError: any) {
    console.error(
      "[Chain Anchor] Gas estimation failed, retrying without explicit gas..."
    );
    // If estimation fails, try without explicit gas (let wallet estimate)
    tx = await contract.anchor(rootHash, manifestBytes32, projectBytes32);
    console.log(
      "[Chain Anchor] Transaction submitted (wallet gas estimate):",
      tx.hash
    );
  }

  // Wait for confirmation
  const rc = await tx.wait();
  console.log("[Chain Anchor] Transaction confirmed in block:", rc.blockNumber);

  // Parse the DatasetAnchored event to get the dataset ID
  let datasetId: string | null = null;
  const iface = new ethers.Interface(DARA_ANCHOR_ABI);

  for (const log of rc.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "DatasetAnchored") {
        datasetId = parsed.args.id.toString();
        console.log("[Chain Anchor] Dataset ID:", datasetId);
        break;
      }
    } catch (error) {
      // Skip logs that don't match our interface
    }
  }

  const explorerUrl = `${EXPLORER}/tx/${rc.hash}`;

  // Record the anchor activity in the data store
  // Note: We can't use hooks here, so we'll return the activity data
  // for the caller to record
  const activityData = {
    txHash: rc.hash as `0x${string}`,
    explorerUrl,
    blockNumber: rc.blockNumber,
    datasetId: datasetId || metadata?.datasetId || "unknown",
    rootHash,
    manifestHash: manifestBytes32,
    projectId: projectBytes32,
    contractAddress: DARA_CONTRACT,
    timestamp: new Date().toISOString(),
    metadata: {
      gasUsed: rc.gasUsed?.toString(),
      gasPrice: rc.gasPrice?.toString(),
      confirmations: 1,
      storageIndexer: metadata?.storageIndexer,
      daEndpoint: metadata?.daEndpoint,
      description:
        metadata?.description ||
        `Anchored dataset ${datasetId || "unknown"} to 0G Chain`,
    },
  };

  console.log("[Chain Anchor] ✅ Anchor complete:", activityData);

  return {
    txHash: rc.hash as `0x${string}`,
    explorerUrl,
    activityData,
  };
}
