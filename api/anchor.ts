import { ethers } from 'ethers';

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      route: 'anchor',
      description: 'Anchor datasets to 0G Chain'
    });
  }
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const startTime = Date.now();
  const OG_RPC_URL = must('OG_RPC_URL');
  const PRIV = must('OG_STORAGE_PRIVATE_KEY');
  const CONTRACT_ADDRESS = process.env.VITE_DARA_CONTRACT || '0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9';

  try {
    const { rootHash, manifestHash, projectId } = req.body; // Added manifestHash
    
    if (!rootHash) {
      return res.status(400).json({ 
        ok: false, 
        error: 'rootHash is required' 
      });
    }

    // Convert rootHash and projectId to bytes32 if they are strings
    // For simplicity, assuming they are already valid hex strings for bytes32
    // In a real app, you'd add validation/conversion logic
    const rootBytes32 = rootHash.startsWith('0x') ? rootHash : '0x' + rootHash;
    const manifestBytes32 = manifestHash.startsWith('0x') ? manifestHash : '0x' + manifestHash;
    const projectBytes32 = projectId.startsWith('0x') ? projectId : '0x' + projectId;

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const signer = new ethers.Wallet(PRIV, provider);
    
    // Contract ABI for DARA contract - updated to match anchor function
    const contractABI = [
      "function anchor(bytes32 root, bytes32 manifestHash, bytes32 projectId) external",
      "function getDataset(uint256 id) external view returns (tuple(uint256 id, bytes32 root, bytes32 manifestHash, bytes32 projectId, address uploader, uint256 timestamp, bool verified, uint256 citationCount))",
      "event DatasetAnchored(uint256 indexed id, bytes32 indexed root, bytes32 indexed manifestHash, bytes32 projectId, address uploader, uint256 timestamp)"
    ];
    
    // Initialize contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    console.log('Anchoring to 0G Chain:', { rootHash, manifestHash, projectId });
    
    // Call contract function - changed from logData to anchor
    const tx = await contract.anchor(rootBytes32, manifestBytes32, projectBytes32);
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    // Fetch the newly anchored dataset ID (assuming it's the latest one or can be derived)
    // For now, we'll return the rootHash as a temporary datasetId
    const datasetId = rootHash; // This needs to be properly retrieved from the contract event or state
    
    const totalDuration = Date.now() - startTime;

    return res.status(200).json({
      ok: true,
      datasetId: datasetId,
      rootHash,
      manifestHash,
      projectId: projectId || 'default',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      contractAddress: CONTRACT_ADDRESS,
      explorerUrl: `${process.env.VITE_OG_EXPLORER || 'https://chainscan-galileo.0g.ai'}/tx/${receipt.hash}`,
      performance: {
        totalDuration,
        confirmationTime: totalDuration
      },
      network: {
        rpc: OG_RPC_URL,
        chainId: (await provider.getNetwork()).chainId.toString()
      }
    });

  } catch (err: any) {
    console.error('[anchor] Error:', err);
    
    return res.status(500).json({ 
      ok: false, 
      error: String(err?.message || err),
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    });
  }
}

