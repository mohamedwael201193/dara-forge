import { daClient } from './daClient.js';

export interface DAPublishResult {
  success: boolean;
  blobHash: string;
  dataRoot: string;
  epoch: number;
  quorumId: number;
  verified: boolean;
  size: number;
  timestamp: string;
  metadata?: any;
}

export interface DARetrievalResult {
  success: boolean;
  data: Uint8Array;
  size: number;
  blobHash: string;
}

/**
 * Publish data to 0G Data Availability network
 * @param data - Data to publish (string, Buffer, or Uint8Array)
 * @param metadata - Optional metadata (dataset ID, root hash, etc.)
 * @returns DA publication result with blob hash and verification status
 */
export async function publishToDA(
  data: string | Buffer | Uint8Array,
  metadata?: {
    datasetId?: string;
    rootHash?: string;
    description?: string;
  }
): Promise<DAPublishResult> {
  console.log('[0G DA Service] Publishing data to DA network...');
  
  try {
    // Convert data to Uint8Array
    let dataArray: Uint8Array;
    if (typeof data === 'string') {
      dataArray = new TextEncoder().encode(data);
    } else if (Buffer.isBuffer(data)) {
      dataArray = new Uint8Array(data);
    } else {
      dataArray = data;
    }

    console.log('[0G DA Service] Data size:', dataArray.length, 'bytes');
    
    if (metadata) {
      console.log('[0G DA Service] Metadata:', metadata);
    }

    // Submit to DA network
    const result = await daClient.submitBlob(dataArray, metadata);
    
    console.log('[0G DA Service] Publication successful!');
    console.log('[0G DA Service] Blob Hash:', result.blobHash);
    console.log('[0G DA Service] Verified:', result.verified);

    return {
      success: true,
      blobHash: result.blobHash,
      dataRoot: result.dataRoot,
      epoch: result.epoch,
      quorumId: result.quorumId,
      verified: result.verified,
      size: dataArray.length,
      timestamp: result.timestamp,
      metadata
    };

  } catch (error: any) {
    console.error('[0G DA Service] Publication failed:', error);
    throw new Error(`DA publication failed: ${error.message}`);
  }
}

/**
 * Verify data availability on 0G DA network
 * @param blobHash - Hash of the blob to verify
 * @returns true if data is available, false otherwise
 */
export async function verifyDAAvailability(blobHash: string): Promise<boolean> {
  console.log('[0G DA Service] Verifying availability for blob:', blobHash);
  
  try {
    const isAvailable = await daClient.verifyAvailability(blobHash);
    console.log('[0G DA Service] Availability status:', isAvailable);
    return isAvailable;
  } catch (error: any) {
    console.error('[0G DA Service] Verification failed:', error);
    return false;
  }
}

/**
 * Retrieve data from 0G DA network
 * @param blobHash - Hash of the blob to retrieve
 * @returns Retrieved data and metadata
 */
export async function retrieveFromDA(blobHash: string): Promise<DARetrievalResult> {
  console.log('[0G DA Service] Retrieving data from DA network...');
  
  try {
    const data = await daClient.retrieveBlob(blobHash);
    
    console.log('[0G DA Service] Data retrieved successfully');
    console.log('[0G DA Service] Size:', data.length, 'bytes');

    return {
      success: true,
      data,
      size: data.length,
      blobHash
    };

  } catch (error: any) {
    console.error('[0G DA Service] Retrieval failed:', error);
    throw new Error(`DA retrieval failed: ${error.message}`);
  }
}

/**
 * Get DA client status and configuration
 * @returns DA client status information
 */
export async function getDAStatus() {
  console.log('[0G DA Service] Getting DA client status...');
  
  try {
    await daClient.initialize();
    
    return {
      status: 'connected',
      endpoint: process.env.VITE_OG_DA_ENDPOINT,
      rpc: process.env.VITE_OG_DA_RPC,
      maxBlobSize: 32505852,
      wallet: '0x' + '***', // Hide private details
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[0G DA Service] Status check failed:', error);
    throw new Error(`DA status check failed: ${error.message}`);
  }
}