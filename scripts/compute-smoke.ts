import { callProvider, ensureLedger, listServices } from '../src/server/compute/broker.js';

(async () => {
  try {
    console.log('🚀 Starting 0G Compute smoke test...\n');
    
    // Step 1: Ensure ledger is funded
    console.log('📊 Ensuring ledger is funded...');
    await ensureLedger(0.02);
    console.log('✅ Ledger funded\n');
    
    // Step 2: List available services
    console.log('🔍 Listing available services...');
    const svcs = await listServices();
    console.log(`✅ Found ${svcs.length} services:`);
    svcs.forEach((s: any, i: number) => {
      console.log(`  ${i + 1}. ${s.model} (${s.provider})`);
    });
    console.log('');
    
    if (!svcs.length) {
      console.error('❌ No services available');
      return;
    }
    
    // Step 3: Call a provider
    const chosen = svcs[0];
    console.log(`🤖 Testing provider: ${chosen.model}`);
    console.log(`📡 Provider address: ${chosen.provider}\n`);
    
    const messages = [{ role: 'user', content: 'Say hello from DARA Forge' }];
    
    console.log('📤 Sending request...');
    const resp = await callProvider({ 
      providerAddress: chosen.provider, 
      messages 
    });
    
    console.log('\n🎉 Response received:');
    console.log(`Model: ${resp.model}`);
    console.log(`Provider: ${resp.provider}`);
    console.log(`Verified: ${resp.verified}`);
    console.log(`Chat ID: ${resp.chatID}`);
    console.log(`Answer: ${resp.answer.slice(0, 120)}${resp.answer.length > 120 ? '...' : ''}`);
    
    console.log('\n✅ Smoke test completed successfully!');
  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    process.exit(1);
  }
})();