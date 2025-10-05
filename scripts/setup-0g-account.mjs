import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

async function setupAccount() {
  const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY;
  if (!privateKey) {
    console.error('Missing OG_COMPUTE_PRIVATE_KEY in .env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai');
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('Wallet address:', wallet.address);
  
  // Check native balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Native balance:', ethers.formatEther(balance), 'OG');
  
  if (Number(ethers.formatEther(balance)) < 0.1) {
    console.error('ERROR: Wallet needs at least 0.1 OG');
    console.error('Get testnet tokens from: https://faucet.0g.ai');
    process.exit(1);
  }
  
  // Create broker and setup account using dynamic import
  const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
  const broker = await createZGComputeNetworkBroker(wallet);
  
  try {
    const account = await broker.ledger.getLedger();
    console.log('✅ Account exists with balance:', ethers.formatEther(account.totalBalance), 'OG');
  } catch (e) {
    console.log('Creating new account...');
    await broker.ledger.addLedger(0.01);
    console.log('✅ Account created with 0.01 OG');
  }
  
  // List available services
  const services = await broker.inference.listService();
  console.log(`
📡 Found ${services.length} compute services:`);
  services.forEach(s => {
    console.log(`  - ${s.model || 'Unknown'} @ ${s.provider}`);
  });
  
  console.log('\n✅ 0G Compute setup complete!');
}

setupAccount().catch(console.error);