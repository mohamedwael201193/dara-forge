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

async function fundProviders() {
  const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY;
  const rpcUrl = 'https://evmrpc-testnet.0g.ai';
  
  console.log('💰 Funding All Provider Sub-Accounts...\n');
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey!, provider);
  
  console.log('Wallet:', wallet.address);
  
  const broker = await createZGComputeNetworkBroker(wallet);
  
  // Get current balance
  console.log('\n📊 Current Main Account Status:');
  const account = await broker.ledger.getLedger();
  console.log('Main account balance:', ethers.formatEther(account.totalBalance), 'OG');
  
  // Get all services
  const services = await broker.inference.listService();
  console.log('\n🔍 Found', services.length, 'providers to fund:');
  
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    console.log(`\n${i + 1}. Provider: ${service.provider}`);
    console.log(`   Model: ${service.model || 'unknown'}`);
    
    try {
      // Acknowledge the provider first
      await broker.inference.acknowledgeProviderSigner(service.provider);
      console.log('   ✅ Provider acknowledged');
      
      // Try to fund this specific provider with 1 OG
      console.log('   💵 Adding 1.0 OG for this provider...');
      
      try {
        await broker.ledger.depositFund(1.0);
        console.log('   ✅ Funded via depositFund');
      } catch (e1) {
        try {
          await broker.ledger.addLedger(1.0);
          console.log('   ✅ Funded via addLedger');
        } catch (e2: any) {
          console.log('   ❌ Funding failed:', e2.message);
        }
      }
      
      // Wait a bit between providers
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error: any) {
      console.log('   ❌ Provider setup failed:', error.message);
    }
  }
  
  console.log('\n📊 Final Status:');
  const finalAccount = await broker.ledger.getLedger();
  console.log('Final balance:', ethers.formatEther(finalAccount.totalBalance), 'OG');
  console.log('\n✅ Provider funding complete!');
  console.log('\n🧪 Run "npm run test:compute" to test the providers');
}

fundProviders().catch(console.error);