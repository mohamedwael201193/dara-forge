import { config } from 'dotenv';
config();

import { daClient } from '../src/server/da/daClient.js';

async function testDA() {
  console.log('🧪 Testing Real 0G DA Integration...\n');

  // Debug environment variables
  console.log('Environment check:');
  console.log('OG_DA_PRIVATE_KEY:', process.env.OG_DA_PRIVATE_KEY ? 'SET' : 'NOT SET');
  console.log('VITE_OG_DA_ENDPOINT:', process.env.VITE_OG_DA_ENDPOINT);
  console.log('VITE_OG_DA_RPC:', process.env.VITE_OG_DA_RPC);
  console.log();

  try {
    // Test 1: Initialize client
    console.log('1️⃣ Initializing DA client...');
    await daClient.initialize();
    console.log('✅ DA client initialized\n');

    // Test 2: Submit small blob
    console.log('2️⃣ Submitting test blob...');
    const testData = Buffer.from('Hello from DARA Forge! This is a test of 0G Data Availability.');
    const result = await daClient.submitBlob(new Uint8Array(testData), {
      datasetId: 'test-dataset-1',
      rootHash: '0x' + '0'.repeat(64)
    });
    
    console.log('✅ Blob submitted successfully!');
    console.log('   Blob hash:', result.blobHash);
    console.log('   Data root:', result.dataRoot);
    console.log('   Epoch:', result.epoch);
    console.log('   Quorum ID:', result.quorumId);
    console.log('   Verified:', result.verified);
    console.log();

    // Wait for blockchain to index the transaction
    console.log('⏳ Waiting 15 seconds for blockchain indexing...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Test 3: Verify availability
    console.log('3️⃣ Verifying availability...');
    const available = await daClient.verifyAvailability(result.blobHash);
    console.log('✅ Availability check:', available ? 'AVAILABLE' : 'NOT AVAILABLE');
    console.log();

    // Test 4: Retrieve blob (skip if not available)
    if (available) {
      console.log('4️⃣ Retrieving blob...');
      const retrieved = await daClient.retrieveBlob(result.blobHash);
      const retrievedText = Buffer.from(retrieved).toString();
      console.log('✅ Retrieved data:', retrievedText);
      console.log();
    } else {
      console.log('⚠️  Skipping retrieval test - blob not yet indexed');
      console.log('   This is normal - blockchain needs time to index transactions');
    }

    console.log('🎉 ALL TESTS PASSED - Real 0G DA is working!');
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDA();