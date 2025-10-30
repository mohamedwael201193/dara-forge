/**
 * Wave 5 Pipeline API Test Script
 * Tests all backend endpoints for mainnet deployment
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000';

// Color output for better readability
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Step ${step}: ${message}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

async function testHealthCheck() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    log('✓ Health Check: Server is running', 'green');
    log(`  Status: ${data.status}`, 'blue');
    return true;
  } catch (error) {
    log('✗ Health Check Failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    return false;
  }
}

async function testStorageUpload() {
  logStep(1, 'Testing Storage Upload (Mainnet)');
  
  try {
    // Read sample file
    const samplePath = path.join(__dirname, 'samples', 'sample.txt');
    if (!fs.existsSync(samplePath)) {
      log('! Warning: samples/sample.txt not found, creating test file', 'yellow');
      fs.mkdirSync(path.join(__dirname, 'samples'), { recursive: true });
      fs.writeFileSync(samplePath, 'This is a test research file for Wave 5 pipeline testing.');
    }
    
    const fileContent = fs.readFileSync(samplePath, 'utf-8');
    log(`  File size: ${fileContent.length} bytes`, 'blue');
    
    // Upload to storage
    const formData = new FormData();
    const blob = new Blob([fileContent], { type: 'text/plain' });
    formData.append('file', blob, 'sample.txt');
    
    const response = await fetch(`${API_BASE}/api/storage/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    log('✓ Storage Upload Successful', 'green');
    log(`  CID: ${data.cid || 'N/A'}`, 'blue');
    log(`  Merkle Root: ${data.merkleRoot || 'N/A'}`, 'blue');
    log(`  Storage URL: ${data.storageUrl || 'N/A'}`, 'blue');
    
    return data;
  } catch (error) {
    log('✗ Storage Upload Failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    return null;
  }
}

async function testAnchor(merkleRoot) {
  logStep(2, 'Testing Anchor to Chain (Mainnet)');
  
  if (!merkleRoot) {
    log('! Skipping: No merkle root from storage', 'yellow');
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/anchor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merkleRoot: merkleRoot,
        metadata: 'ipfs://QmTest123'
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    log('✓ Anchor Transaction Successful', 'green');
    log(`  Transaction Hash: ${data.txHash || 'N/A'}`, 'blue');
    log(`  Explorer URL: ${data.explorerUrl || 'N/A'}`, 'blue');
    log(`  Block: ${data.blockNumber || 'N/A'}`, 'blue');
    
    return data;
  } catch (error) {
    log('✗ Anchor Failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    return null;
  }
}

async function testComputeAnalyze(cid) {
  logStep(3, 'Testing Compute Analysis (Testnet)');
  
  if (!cid) {
    log('! Skipping: No CID from storage', 'yellow');
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/compute/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cid: cid
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    log('✓ Compute Job Submitted', 'green');
    log(`  Response ID: ${data.responseId || 'N/A'}`, 'blue');
    log(`  Status: ${data.status || 'N/A'}`, 'blue');
    
    // Poll for completion
    if (data.responseId) {
      log('\n  Polling for results...', 'yellow');
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const statusResponse = await fetch(`${API_BASE}/api/compute/status/${data.responseId}`);
        const statusData = await statusResponse.json();
        
        log(`  [${attempts + 1}/${maxAttempts}] Status: ${statusData.status}`, 'blue');
        
        if (statusData.status === 'completed') {
          log('✓ Compute Analysis Completed', 'green');
          log(`  Result: ${JSON.stringify(statusData.result || {}, null, 2)}`, 'blue');
          return statusData;
        } else if (statusData.status === 'failed') {
          log('✗ Compute Analysis Failed', 'red');
          log(`  Error: ${statusData.error}`, 'red');
          return null;
        }
        
        attempts++;
      }
      
      log('! Compute polling timeout', 'yellow');
    }
    
    return data;
  } catch (error) {
    log('✗ Compute Analysis Failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    return null;
  }
}

async function testDAPublish(data) {
  logStep(4, 'Testing DA Publication (Testnet)');
  
  if (!data) {
    log('! Skipping: No data to publish', 'yellow');
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/da/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: JSON.stringify(data),
        metadata: {
          source: 'pipeline-test',
          timestamp: Date.now()
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const result = await response.json();
    log('✓ DA Publication Successful', 'green');
    log(`  Batch ID: ${result.batchId || 'N/A'}`, 'blue');
    log(`  Commitment: ${result.commitment || 'N/A'}`, 'blue');
    
    return result;
  } catch (error) {
    log('✗ DA Publication Failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    return null;
  }
}

async function runFullPipelineTest() {
  log('\n' + '='.repeat(60), 'cyan');
  log('DARA Forge Wave 5 - Pipeline API Test', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Check server health
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    log('\n✗ Server is not responding. Please start the server with: npm run dev:full', 'red');
    return;
  }
  
  log('\nStarting full pipeline test...', 'yellow');
  
  // Step 1: Storage Upload
  const storageResult = await testStorageUpload();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
  
  // Step 2: Anchor
  const anchorResult = storageResult ? await testAnchor(storageResult.merkleRoot) : null;
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
  
  // Step 3: Compute
  const computeResult = storageResult ? await testComputeAnalyze(storageResult.cid) : null;
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
  
  // Step 4: DA
  const daResult = computeResult ? await testDAPublish(computeResult) : null;
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Health Check:      ${isHealthy ? '✓ PASS' : '✗ FAIL'}`, isHealthy ? 'green' : 'red');
  log(`Storage Upload:    ${storageResult ? '✓ PASS' : '✗ FAIL'}`, storageResult ? 'green' : 'red');
  log(`Anchor to Chain:   ${anchorResult ? '✓ PASS' : '✗ FAIL'}`, anchorResult ? 'green' : 'red');
  log(`Compute Analysis:  ${computeResult ? '✓ PASS' : '✗ FAIL'}`, computeResult ? 'green' : 'red');
  log(`DA Publication:    ${daResult ? '✓ PASS' : '✗ FAIL'}`, daResult ? 'green' : 'red');
  
  const allPassed = isHealthy && storageResult && anchorResult && computeResult && daResult;
  log('\n' + '='.repeat(60), 'cyan');
  log(allPassed ? '✓ ALL TESTS PASSED' : '! SOME TESTS FAILED', allPassed ? 'green' : 'yellow');
  log('='.repeat(60) + '\n', 'cyan');
  
  if (allPassed) {
    log('Next step: Test iNFT minting via frontend UI at http://localhost:5173', 'yellow');
    log('Navigate to Pipeline page and complete the flow to mint an iNFT', 'yellow');
  } else {
    log('Please check the errors above and ensure:', 'yellow');
    log('  1. Server is running (npm run dev:full)', 'yellow');
    log('  2. .env has all required keys', 'yellow');
    log('  3. Wallet has sufficient OG tokens', 'yellow');
    log('  4. Network connections are stable', 'yellow');
  }
}

// Run the test
runFullPipelineTest().catch(error => {
  log('\n✗ Test script error:', 'red');
  log(error.stack, 'red');
  process.exit(1);
});
