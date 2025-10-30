#!/usr/bin/env node

/**
 * Simple Pipeline Test - Wave 5
 * Quick validation of backend endpoints
 */

console.log('\n====================================');
console.log('  DARA Forge - Pipeline Test');
console.log('  Wave 5 Mainnet Deployment');
console.log('====================================\n');

const API_BASE = 'http://localhost:3000';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🔄 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status} OK`);
      console.log(`   📦 Response:`, JSON.stringify(data, null, 2).substring(0, 200));
      return { success: true, data };
    } else {
      console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
      console.log(`   📦 Error:`, JSON.stringify(data, null, 2).substring(0, 200));
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const results = [];
  
  // Test 1: Health Check
  results.push(await testEndpoint(
    'Health Check',
    `${API_BASE}/api/health`
  ));
  
  // Test 2: Compute Health
  results.push(await testEndpoint(
    'Compute Health',
    `${API_BASE}/api/compute/health`
  ));
  
  // Summary
  console.log('\n\n====================================');
  console.log('  Test Summary');
  console.log('====================================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}\n`);
  
  if (passed === total) {
    console.log('🎉 All basic health checks passed!\n');
    console.log('Next steps:');
    console.log('  1. Open http://localhost:5173 in your browser');
    console.log('  2. Connect your wallet to 0G Mainnet (Chain ID 16661)');
    console.log('  3. Navigate to Pipeline page');
    console.log('  4. Test full flow:');
    console.log('     • Upload file to storage');
    console.log('     • Anchor to blockchain');
    console.log('     • Run compute analysis');
    console.log('     • Publish to DA');
    console.log('     • Mint iNFT');
    console.log('\n📚 See TESTING_GUIDE.md for detailed instructions\n');
  } else {
    console.log('⚠️  Some endpoints are not responding.');
    console.log('   Make sure the server is running: npm run dev:full\n');
  }
}

runTests().catch(err => {
  console.error('\n❌ Test script error:', err);
  process.exit(1);
});
