// test-anchor-contract.js - Test if DaraAnchor contract is deployed and working
import 'dotenv/config';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.VITE_DARA_CONTRACT || '0x9E527D6a3ee4CB6B7671fa19B4f94c89Ca59c00f';
const RPC_URL = process.env.VITE_OG_RPC || 'https://evmrpc-testnet.0g.ai/';

const DARA_ANCHOR_ABI = [
  "function anchor(bytes32 root, bytes32 manifestHash, bytes32 projectId) external",
  "event DatasetAnchored(uint256 indexed id, bytes32 indexed root, bytes32 indexed manifestHash, bytes32 projectId, address uploader, uint256 timestamp)",
  "function nextId() external view returns (uint256)",
  "function datasets(uint256 id) external view returns (uint256 id, bytes32 root, bytes32 manifestHash, bytes32 projectId, address uploader, uint256 timestamp, bool verified, uint256 citationCount)"
];

async function testContract() {
  console.log('🔍 Testing DaraAnchor Contract');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('RPC:', RPC_URL);
  console.log('');

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      console.error('❌ Contract not deployed at', CONTRACT_ADDRESS);
      console.log('Deploy the contract first using: node scripts/deploy-anchor.cjs');
      return;
    }
    console.log('✅ Contract exists');
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DARA_ANCHOR_ABI, provider);
    
    // Try to read nextId
    try {
      const nextId = await contract.nextId();
      console.log('✅ Contract is readable - Next ID:', nextId.toString());
    } catch (error) {
      console.error('❌ Cannot read contract:', error.message);
      console.log('Contract may not be DaraAnchor or ABI mismatch');
      return;
    }
    
    // Test parameters
    const testRoot = ethers.keccak256(ethers.toUtf8Bytes('test-root'));
    const testManifest = ethers.keccak256(ethers.toUtf8Bytes('test-manifest'));
    const testProject = ethers.keccak256(ethers.toUtf8Bytes('dara-forge'));
    
    console.log('');
    console.log('Test Parameters:');
    console.log('Root:', testRoot);
    console.log('Manifest:', testManifest);
    console.log('Project:', testProject);
    
    // Estimate gas (no transaction sent)
    try {
      const privateKey = process.env.OG_STORAGE_PRIVATE_KEY || process.env.OG_DA_PRIVATE_KEY;
      if (!privateKey) {
        console.log('⚠️ No private key found - cannot test transaction');
        console.log('Set OG_STORAGE_PRIVATE_KEY or OG_DA_PRIVATE_KEY to test anchoring');
        return;
      }
      
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(wallet);
      
      console.log('');
      console.log('Testing with wallet:', wallet.address);
      
      const balance = await provider.getBalance(wallet.address);
      console.log('Wallet balance:', ethers.formatEther(balance), 'OG');
      
      if (Number(ethers.formatEther(balance)) < 0.01) {
        console.log('⚠️ Wallet balance too low for transaction');
        return;
      }
      
      // Estimate gas
      const gasEstimate = await contractWithSigner.anchor.estimateGas(testRoot, testManifest, testProject);
      console.log('✅ Gas estimate:', gasEstimate.toString());
      
      const feeData = await provider.getFeeData();
      const estimatedCost = gasEstimate * (feeData.gasPrice || 0n);
      console.log('Estimated cost:', ethers.formatEther(estimatedCost), 'OG');
      
      console.log('');
      console.log('✅ Contract is fully functional and ready for anchoring!');
      
    } catch (error) {
      console.error('❌ Transaction test failed:', error.message);
      if (error.data) {
        console.error('Error data:', error.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContract().catch(console.error);
