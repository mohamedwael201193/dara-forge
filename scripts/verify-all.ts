#!/usr/bin/env tsx
/**
 * DARA Forge End-to-End Verification CLI
 * 
 * This script demonstrates the complete 0G technology stack:
 * 1. Upload file to 0G Storage
 * 2. Publish to 0G Data Availability
 * 3. Anchor on 0G Chain
 * 4. Process with 0G Compute + TEE attestation
 * 5. Generate reproducibility passport
 * 
 * Usage: npm run verify:all
 */

import { config } from 'dotenv'
import { ethers } from 'ethers'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config()

// Configuration from environment (never hardcoded)
const CONFIG = {
  // Network Configuration
  rpcUrl: process.env.OG_RPC || process.env.VITE_OG_RPC,
  chainId: parseInt(process.env.OG_CHAIN_ID || process.env.VITE_OG_CHAIN_ID || '16602'),
  indexerUrl: process.env.OG_INDEXER || process.env.VITE_OG_INDEXER,
  
  // Private Keys (server-side only)
  privateKey: process.env.OG_PRIVATE_KEY || process.env.DARA_PRIVATE_KEY,
  
  // Contract Addresses
  daraContract: process.env.DARA_CONTRACT || process.env.VITE_DARA_CONTRACT,
  flowContract: process.env.OG_FLOW_CONTRACT || process.env.VITE_OG_FLOW_CONTRACT,
  anchorContract: process.env.ANCHOR_CONTRACT || process.env.VITE_ANCHOR_CONTRACT,
  
  // File Configuration
  sampleFile: './samples/sample.txt',
  outputFile: './dist/passport.json'
}

// Validation
function validateConfig() {
  const required = ['rpcUrl', 'privateKey', 'indexerUrl', 'daraContract']
  const missing = required.filter(key => !CONFIG[key as keyof typeof CONFIG])
  
  if (missing.length > 0) {
    console.error(`ERROR: Missing required environment variables: ${missing.join(', ')}`)
    console.error('Please check your .env file')
    process.exit(1)
  }
  
  if (!existsSync(CONFIG.sampleFile)) {
    console.error(`ERROR: Sample file not found: ${CONFIG.sampleFile}`)
    process.exit(1)
  }
}

// Utility functions
function log(key: string, value: any) {
  console.log(`${key}=${value}`)
}

function createProvider() {
  return new ethers.JsonRpcProvider(CONFIG.rpcUrl)
}

function createWallet() {
  const provider = createProvider()
  return new ethers.Wallet(CONFIG.privateKey!, provider)
}

// Step 1: Upload to 0G Storage
async function uploadToStorage(): Promise<{ merkleRoot: string; indexerTx: string }> {
  try {
    log('STEP', '1_STORAGE_UPLOAD')
    
    const fileContent = readFileSync(CONFIG.sampleFile)
    const wallet = createWallet()
    
    // Create FormData for upload
    const form = new FormData()
    const blob = new Blob([fileContent], { type: 'text/plain' })
    form.append('file', blob, 'sample.txt')
    
    // Upload via storage API
    const response = await fetch('http://localhost:3000/api/storage/upload', {
      method: 'POST',
      body: form,
      headers: {
        'X-Wallet-Address': wallet.address
      }
    })
    
    if (!response.ok) {
      throw new Error(`Storage upload failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    const merkleRoot = result.root
    const indexerTx = result.indexerTx
    
    log('STORAGE_ROOT', merkleRoot)
    log('STORAGE_TX', indexerTx)
    
    return { merkleRoot, indexerTx }
  } catch (error) {
    console.error('STORAGE_ERROR:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Step 2: Publish to DA
async function publishToDA(merkleRoot: string): Promise<{ blobHash: string; dataRoot: string }> {
  try {
    log('STEP', '2_DA_PUBLISH')
    
    const fileContent = readFileSync(CONFIG.sampleFile, 'base64')
    
    const response = await fetch('http://localhost:3000/api/da?action=submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: fileContent,
        metadata: {
          filename: 'sample.txt',
          merkleRoot,
          timestamp: new Date().toISOString()
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`DA publish failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    const blobHash = result.blobHash
    const dataRoot = result.dataRoot
    
    log('DA_BLOB_HASH', blobHash)
    log('DA_DATA_ROOT', dataRoot)
    
    return { blobHash, dataRoot }
  } catch (error) {
    console.error('DA_ERROR:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Step 3: Anchor on Chain
async function anchorOnChain(merkleRoot: string): Promise<{ txHash: string; blockNumber: number }> {
  try {
    log('STEP', '3_CHAIN_ANCHOR')
    
    const wallet = createWallet()
    
    // Simple contract interaction to anchor the merkle root
    const tx = await wallet.sendTransaction({
      to: CONFIG.anchorContract,
      data: ethers.id(`anchor(${merkleRoot})`).substring(0, 10), // Simple anchor call
      gasLimit: 100000
    })
    
    const receipt = await tx.wait()
    
    log('CHAIN_TX_HASH', receipt!.hash)
    log('CHAIN_BLOCK', receipt!.blockNumber)
    
    return { 
      txHash: receipt!.hash,
      blockNumber: receipt!.blockNumber
    }
  } catch (error) {
    console.error('CHAIN_ERROR:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Step 4: Compute with TEE Attestation
async function processWithCompute(merkleRoot: string): Promise<{ jobId: string; attestation: string; signature: string }> {
  try {
    log('STEP', '4_COMPUTE_PROCESS')
    
    // Submit compute job
    const submitResponse = await fetch('http://localhost:3000/api/compute?action=analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: `Verify file with merkle root: ${merkleRoot}`,
        model: 'llama-3.1-8b',
        provider: 'Ritual',
        merkleRoot
      })
    })
    
    if (!submitResponse.ok) {
      throw new Error(`Compute submit failed: ${submitResponse.statusText}`)
    }
    
    const submitResult = await submitResponse.json()
    const jobId = submitResult.jobId
    
    log('COMPUTE_JOB_ID', jobId)
    
    // Poll for results
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const statusResponse = await fetch(`http://localhost:3000/api/compute?action=status&jobId=${jobId}`)
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json()
        
        if (statusResult.status === 'completed') {
          // Verify TEE signature
          const verifyResponse = await fetch('http://localhost:3000/api/compute?action=verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              jobId,
              signature: statusResult.signature,
              attestation: statusResult.attestation
            })
          })
          
          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json()
            
            if (verifyResult.verified) {
              log('COMPUTE_VERIFIED', 'true')
              log('COMPUTE_ATTESTATION', statusResult.attestation)
              log('COMPUTE_SIGNATURE', statusResult.signature)
              
              return {
                jobId,
                attestation: statusResult.attestation,
                signature: statusResult.signature
              }
            } else {
              throw new Error('Compute signature verification failed')
            }
          }
        }
      }
      
      attempts++
    }
    
    throw new Error('Compute job timeout')
  } catch (error) {
    console.error('COMPUTE_ERROR:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Step 5: Generate Reproducibility Passport
async function generatePassport(
  merkleRoot: string,
  blobHash: string,
  dataRoot: string,
  txHash: string,
  blockNumber: number,
  jobId: string,
  attestation: string,
  signature: string
) {
  try {
    log('STEP', '5_PASSPORT_GENERATION')
    
    const passport = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      chainId: CONFIG.chainId,
      network: 'Galileo Testnet',
      
      // File Information
      file: {
        name: 'sample.txt',
        merkleRoot,
        size: readFileSync(CONFIG.sampleFile).length
      },
      
      // Storage Verification
      storage: {
        root: merkleRoot,
        indexerUrl: CONFIG.indexerUrl,
        verificationUrl: `${CONFIG.indexerUrl}/file?root=${merkleRoot}`,
        status: 'verified'
      },
      
      // DA Verification
      dataAvailability: {
        blobHash,
        dataRoot,
        network: '0G DA Network',
        status: 'published'
      },
      
      // Chain Anchor
      blockchain: {
        txHash,
        blockNumber,
        chainId: CONFIG.chainId,
        contract: CONFIG.anchorContract,
        explorerUrl: `https://chainscan-galileo.0g.ai/tx/${txHash}`,
        status: 'anchored'
      },
      
      // Compute Attestation
      computation: {
        jobId,
        provider: 'TEE Network',
        attestation,
        signature,
        verified: true,
        status: 'attested'
      },
      
      // Verification Links
      verification: {
        storageProof: `${CONFIG.indexerUrl}/proof?root=${merkleRoot}`,
        daVerification: `/api/da/verify?blobHash=${blobHash}`,
        chainVerification: `/api/chain/tx?hash=${txHash}`,
        computeVerification: `/api/compute?action=verify&jobId=${jobId}`,
        fullVerification: `/verify?root=${merkleRoot}&blob=${blobHash}&dataRoot=${dataRoot}&tx=${txHash}&sig=${signature}`
      }
    }
    
    // Ensure output directory exists
    const outputDir = join(process.cwd(), 'dist')
    if (!existsSync(outputDir)) {
      const { mkdirSync } = await import('fs')
      mkdirSync(outputDir, { recursive: true })
    }
    
    // Write passport to file
    writeFileSync(CONFIG.outputFile, JSON.stringify(passport, null, 2))
    
    log('PASSPORT_FILE', CONFIG.outputFile)
    log('PASSPORT_SIZE', readFileSync(CONFIG.outputFile).length)
    
    return passport
  } catch (error) {
    console.error('PASSPORT_ERROR:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Main execution
async function main() {
  try {
    log('START_TIME', new Date().toISOString())
    log('NETWORK', `${CONFIG.chainId}`)
    log('RPC_URL', CONFIG.rpcUrl!)
    log('SAMPLE_FILE', CONFIG.sampleFile)
    
    // Validate configuration
    validateConfig()
    
    // Execute pipeline
    const { merkleRoot, indexerTx } = await uploadToStorage()
    const { blobHash, dataRoot } = await publishToDA(merkleRoot)
    const { txHash, blockNumber } = await anchorOnChain(merkleRoot)
    const { jobId, attestation, signature } = await processWithCompute(merkleRoot)
    
    // Generate passport
    await generatePassport(
      merkleRoot,
      blobHash,
      dataRoot,
      txHash,
      blockNumber,
      jobId,
      attestation,
      signature
    )
    
    log('STATUS', 'SUCCESS')
    log('END_TIME', new Date().toISOString())
    
    // Success exit
    process.exit(0)
    
  } catch (error) {
    console.error('FATAL_ERROR:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('UNHANDLED_ERROR:', error)
    process.exit(1)
  })
}