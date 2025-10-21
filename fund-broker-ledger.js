// fund-broker-ledger.js - Add funds to 0G Compute broker ledger
import 'dotenv/config';
import { ethers } from 'ethers';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createZGComputeNetworkBroker } = require('@0glabs/0g-serving-broker');

const RPC_URL = process.env.OG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
const PRIVATE_KEY = process.env.OG_COMPUTE_PRIVATE_KEY || process.env.OG_STORAGE_PRIVATE_KEY;

async function fundLedger() {
  if (!PRIVATE_KEY) {
    console.error('❌ OG_COMPUTE_PRIVATE_KEY or OG_STORAGE_PRIVATE_KEY required');
    return;
  }

  console.log('💰 Funding 0G Compute Broker Ledger');
  console.log('RPC:', RPC_URL);
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('Wallet:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet balance:', ethers.formatEther(balance), 'OG');
    
    if (Number(ethers.formatEther(balance)) < 5) {
      console.log('⚠️ Wallet balance too low (need at least 5 OG)');
      console.log('Get testnet tokens from faucet first');
      return;
    }
    
    console.log('');
    console.log('Creating broker...');
    const broker = await createZGComputeNetworkBroker(wallet);
    console.log('✅ Broker created');
    
    // Check current ledger balance
    try {
      const account = await broker.ledger.getLedger();
      const currentBalance = Number(ethers.formatEther(account.totalBalance));
      console.log('Current ledger balance:', currentBalance, 'OG');
      
      if (currentBalance >= 4) {
        console.log('✅ Ledger already has sufficient funds');
        return;
      }
    } catch (error) {
      if (String(error).includes('does not exist')) {
        console.log('Ledger account does not exist yet');
      } else {
        throw error;
      }
    }
    
    // Add 5 OG to ledger
    const amountToAdd = 5.0;
    console.log('');
    console.log(`Adding ${amountToAdd} OG to ledger...`);
    
    try {
      await broker.ledger.addLedger(amountToAdd);
      console.log('✅ Ledger funded successfully!');
    } catch (error) {
      if (String(error).includes('already exists')) {
        console.log('Ledger exists, trying depositFund instead...');
        await broker.ledger.depositFund(amountToAdd);
        console.log('✅ Funds deposited successfully!');
      } else {
        throw error;
      }
    }
    
    // Verify
    const account = await broker.ledger.getLedger();
    const newBalance = Number(ethers.formatEther(account.totalBalance));
    console.log('New ledger balance:', newBalance, 'OG');
    console.log('');
    console.log('✅ Broker ledger is now funded and ready for compute tasks!');
    
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

fundLedger().catch(console.error);
