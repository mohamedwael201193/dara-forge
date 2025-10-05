import { config } from 'dotenv';
config(); // Load .env file

import { analyzeWithAI, getBroker, listServices } from '../src/server/compute/broker.js';

async function test() {
  try {
    console.log('🧪 Testing Real 0G Compute Integration...\n');
    
    // Add environment check
    if (!process.env.OG_COMPUTE_PRIVATE_KEY) {
      throw new Error('OG_COMPUTE_PRIVATE_KEY not found in .env file');
    }
    
    console.log('✅ Environment loaded');
    console.log('   Private key found:', process.env.OG_COMPUTE_PRIVATE_KEY.substring(0, 10) + '...\n');
    
    // Test 1: Broker initialization
    console.log('1️⃣ Initializing broker...');
    const broker = await getBroker();
    console.log('✅ Broker initialized\n');
    
    // Test 2: Account check
    console.log('2️⃣ Checking account...');
    const account = await broker.ledger.getLedger();
    console.log('✅ Account balance:', account.totalBalance.toString(), 'wei\n');
    
    // Test 3: List services
    console.log('3️⃣ Listing services...');
    const services = await listServices();
    console.log('✅ Found', services.length, 'services');
    services.forEach((s: any, i: number) => {
      console.log(`   ${i + 1}. ${s.model || 'unknown'} @ ${s.provider}`);
    });
    console.log();
    
    // Test 4: Run analysis
    console.log('4️⃣ Running AI analysis...');
    const result = await analyzeWithAI('Explain blockchain in research');
    console.log('✅ Analysis complete!\n');
    
    console.log('📊 Results:');
    console.log('   Provider:', result.provider);
    console.log('   Model:', result.model);
    console.log('   Verified:', result.verified);
    console.log('   Answer length:', result.answer.length, 'characters');
    console.log('   First 200 chars:', result.answer.substring(0, 200) + '...');
    
    console.log('\n🎉 ALL TESTS PASSED - Real 0G Compute is working!');
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();