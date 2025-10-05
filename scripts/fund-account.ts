import { config } from 'dotenv';
config();

import { ethers } from 'ethers';
import nodeCrypto from 'node:crypto';
import { createRequire } from 'node:module';

if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeCrypto.webcrypto;
}

const require = createRequire(import.meta.url);
const sdk = require('@0glabs/0g-serving-broker');
const createZGComputeNetworkBroker = sdk.createZGComputeNetworkBroker;

async function fund() {
  const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY;
  const rpcUrl = 'https://evmrpc-testnet.0g.ai';
  
  console.log('💰 Funding 0G Compute Account...\n');
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey!, provider);
  
  console.log('Wallet:', wallet.address);
  
  const broker = await createZGComputeNetworkBroker(wallet);
  
  console.log('\n📊 Current Status:');
  try {
    const account = await broker.ledger.getLedger();
    console.log('Current balance:', ethers.formatEther(account.totalBalance), 'OG');
  } catch (e) {
    console.log('No account exists yet');
  }
  
  console.log('\n💵 Adding 0.5 OG to account...');
  
  try {
    // First try depositFund
    const tx = await broker.ledger.depositFund(0.5);
    console.log('✅ Funds added via depositFund');
    console.log('Transaction:', tx);
  } catch (e1) {
    try {
      // If that fails, try addLedger
      const tx = await broker.ledger.addLedger(0.5);
      console.log('✅ Account created/funded via addLedger');
      console.log('Transaction:', tx);
    } catch (e2) {
      console.error('❌ Both funding methods failed');
      console.error('Error 1:', e1);
      console.error('Error 2:', e2);
      process.exit(1);
    }
  }
  
  // Wait for transaction
  console.log('\n⏳ Waiting 10 seconds for confirmation...');
  await new Promise(r => setTimeout(r, 10000));
  
  console.log('\n📊 New Status:');
  const account = await broker.ledger.getLedger();
  console.log('New balance:', ethers.formatEther(account.totalBalance), 'OG');
  console.log('\n✅ Account funded successfully!');
}

fund().catch(console.error);