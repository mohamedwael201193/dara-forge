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
    const { rootHash, projectId } = req.body;
    
    if (!rootHash) {
      return res.status(400).json({ 
        ok: false, 
        error: 'rootHash is required' 
      });
    }

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const signer = new ethers.Wallet(PRIV, provider);
    
    // Contract ABI for DARA contract
    const contractABI = [
      "function logData(string memory _fileId) external",
      "function logCounter() external view returns (uint256)",
      "event LogCreated(uint256 indexed logId, address indexed creator, string fileId, uint256 timestamp)"
    ];
    
    // Initialize contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    console.log('Anchoring to 0G Chain:', { rootHash, projectId });
    
    // Call contract function
    const tx = await contract.logData(rootHash);
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    // Get log counter for dataset ID
    const logCounter = await contract.logCounter();
    
    const totalDuration = Date.now() - startTime;

    return res.status(200).json({
      ok: true,
      datasetId: logCounter.toString(),
      rootHash,
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

