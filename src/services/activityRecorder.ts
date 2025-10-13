/**
 * Activity Recording Service
 * 
 * Provides functions to record various activities to the data store,
 * ensuring consistent activity tracking across the application.
 */

import { useDataStore } from '@/store/dataStore';

export interface ChainAnchorActivity {
  txHash: string;
  explorerUrl: string;
  blockNumber: number;
  datasetId: string;
  rootHash: string;
  manifestHash: string;
  projectId: string;
  contractAddress: string;
  timestamp: string;
  metadata: {
    gasUsed?: string;
    gasPrice?: string;
    confirmations: number;
    storageIndexer?: string;
    daEndpoint?: string;
    description: string;
  };
}

// Hook-based activity recorder (use in components)
export function useActivityRecorder() {
  const { addChainAnchor } = useDataStore();
  
  const recordChainAnchor = (activityData: ChainAnchorActivity) => {
    console.log('[Activity Recorder] Recording chain anchor:', activityData.txHash);
    
    addChainAnchor({
      txHash: activityData.txHash,
      timestamp: activityData.timestamp,
      rootHash: activityData.rootHash,
      explorerUrl: activityData.explorerUrl,
      datasetId: activityData.datasetId,
      blockNumber: activityData.blockNumber,
      contractAddress: activityData.contractAddress,
      manifestHash: activityData.manifestHash,
      projectId: activityData.projectId,
      gasUsed: activityData.metadata.gasUsed,
      gasPrice: activityData.metadata.gasPrice,
      confirmations: activityData.metadata.confirmations,
      status: 'confirmed',
      description: activityData.metadata.description,
      // Enhanced verification metadata  
      verificationMetadata: {
        storageIndexer: activityData.metadata.storageIndexer,
        daEndpoint: activityData.metadata.daEndpoint,
        verifyLinks: {
          storage: activityData.metadata.storageIndexer ? 
            `/verify?type=storage&root=${activityData.rootHash}&indexer=${activityData.metadata.storageIndexer}` : 
            undefined,
          da: activityData.metadata.daEndpoint ? 
            `/verify?type=da&hash=${activityData.rootHash}&endpoint=${activityData.metadata.daEndpoint}` : 
            undefined,
          chain: `/verify?type=chain&tx=${activityData.txHash}&contract=${activityData.contractAddress}`
        }
      }
    });
  };
  
  return {
    recordChainAnchor
  };
}

// Non-hook version for use in utilities (like anchorClient)
export class ActivityRecorder {
  
  /**
   * Record a chain anchor activity
   * This version returns the activity data for manual recording
   */
  static createChainAnchorActivity(data: {
    txHash: string;
    explorerUrl: string;
    blockNumber: number;
    datasetId?: string;
    rootHash: string;
    manifestHash: string;
    projectId: string;
    contractAddress: string;
    gasUsed?: string;
    gasPrice?: string;
    storageIndexer?: string;
    daEndpoint?: string;
    description?: string;
  }): ChainAnchorActivity {
    
    return {
      txHash: data.txHash,
      explorerUrl: data.explorerUrl,
      blockNumber: data.blockNumber,
      datasetId: data.datasetId || 'unknown',
      rootHash: data.rootHash,
      manifestHash: data.manifestHash,
      projectId: data.projectId,
      contractAddress: data.contractAddress,
      timestamp: new Date().toISOString(),
      metadata: {
        gasUsed: data.gasUsed,
        gasPrice: data.gasPrice,
        confirmations: 1,
        storageIndexer: data.storageIndexer,
        daEndpoint: data.daEndpoint,
        description: data.description || `Anchored dataset ${data.datasetId || 'unknown'} to 0G Chain`
      }
    };
  }
  
  /**
   * Generate verification links for an anchor activity
   */
  static generateVerificationLinks(activity: ChainAnchorActivity) {
    return {
      storage: activity.metadata.storageIndexer ? 
        `/verify?type=storage&root=${activity.rootHash}&indexer=${activity.metadata.storageIndexer}` : 
        undefined,
      da: activity.metadata.daEndpoint ? 
        `/verify?type=da&hash=${activity.rootHash}&endpoint=${activity.metadata.daEndpoint}` : 
        undefined,
      chain: `/verify?type=chain&tx=${activity.txHash}&contract=${activity.contractAddress}`,
      explorer: activity.explorerUrl
    };
  }
}

export default ActivityRecorder;