import { VercelRequest, VercelResponse } from '@vercel/node';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk/browser';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const indexer = new Indexer(process.env.OG_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai');
    
    // THIS IS THE FIX - pass all 3 arguments
    const evmRpc = process.env.OG_EVM_RPC || 'https://evmrpc-testnet.0g.ai';
    const provider = new ethers.JsonRpcProvider(evmRpc);
    const signer = new ethers.Wallet(process.env.OG_PRIVATE_KEY!, provider);
    
    // Create file from request body
    const zgFile = await ZgFile.fromBuffer(Buffer.from(req.body.content, 'utf-8'));
    
    // Get merkle tree
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr) throw treeErr;
    
    // Upload with ALL 3 ARGUMENTS
    const [tx, uploadErr] = await indexer.upload(zgFile, evmRpc, signer);
    if (uploadErr) throw uploadErr;
    
    await zgFile.close();
    
    res.status(200).json({
      success: true,
      rootHash: tree.rootHash(),
      transactionHash: tx
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

