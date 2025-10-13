import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UploadResult {
  datasetId: string;
  rootHash: string;
  fileName: string;
  fileSize: number;
  uploadTime: string;
  txHash?: string;
  // Enhanced fields for verification parity
  indexer?: string;
  uploadEndpoint?: string;
  manifestPath?: string;
}

interface DAResult {
  blobHash: string;
  dataRoot: string;
  epoch: number;
  quorumId: number;
  verified: boolean;
  timestamp: string;
  txHash?: string;
  blockNumber?: number;
  // Enhanced fields for publish-verify parity
  daEndpointUsed?: string;
  availabilityConfirmed?: boolean;
  availabilityCheckedAt?: string;
  retryAttempts?: number;
  verificationHistory?: Array<{
    endpoint: string;
    timestamp: string;
    success: boolean;
    error?: string;
  }>;
}

interface ComputeResult {
  answer: string;
  provider: string;
  model: string;
  verified: boolean;
  chatID: string;
  timestamp: string;
  rootHash?: string;
  input?: string;
}

interface ChainAnchorResult {
  txHash: string;
  timestamp: string;
  rootHash: string;
  explorerUrl: string;
  datasetId: string;
  blockNumber?: number;
  contractAddress?: string;
  manifestHash?: string;
  projectId?: string;
  gasUsed?: string;
  gasPrice?: string;
  confirmations?: number;
  status?: 'pending' | 'confirmed' | 'failed';
  description?: string;
  // Enhanced verification metadata for publish-verify parity
  verificationMetadata?: {
    storageIndexer?: string;
    daEndpoint?: string;
    verifyLinks?: {
      storage?: string;
      da?: string;
      chain?: string;
    };
  };
}

interface DataStore {
  // Storage Data
  uploadedDatasets: UploadResult[];
  currentUpload: UploadResult | null;
  
  // DA Data
  daPublications: DAResult[];
  currentDA: DAResult | null;
  
  // Compute Data
  computeResults: ComputeResult[];
  currentCompute: ComputeResult | null;
  
  // Chain Data
  chainAnchors: ChainAnchorResult[];
  
  // Actions
  setCurrentUpload: (upload: UploadResult | null) => void;
  addUploadedDataset: (upload: UploadResult) => void;
  setCurrentDA: (da: DAResult | null) => void;
  addDAPublication: (da: DAResult) => void;
  setCurrentCompute: (compute: ComputeResult | null) => void;
  addComputeResult: (compute: ComputeResult) => void;
  addChainAnchor: (anchor: ChainAnchorResult) => void;
  clearAllData: () => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      // Initial state
      uploadedDatasets: [],
      currentUpload: null,
      daPublications: [],
      currentDA: null,
      computeResults: [],
      currentCompute: null,
      chainAnchors: [],
      
      // Actions
      setCurrentUpload: (upload) => set({ currentUpload: upload }),
      
      addUploadedDataset: (upload) => 
        set((state) => ({
          uploadedDatasets: [...state.uploadedDatasets, upload],
          currentUpload: upload
        })),
      
      setCurrentDA: (da) => set({ currentDA: da }),
      
      addDAPublication: (da) =>
        set((state) => ({
          daPublications: [...state.daPublications, da],
          currentDA: da
        })),
      
      setCurrentCompute: (compute) => set({ currentCompute: compute }),
      
      addComputeResult: (compute) =>
        set((state) => ({
          computeResults: [...state.computeResults, compute],
          currentCompute: compute
        })),
      
      addChainAnchor: (anchor) =>
        set((state) => ({
          chainAnchors: [...state.chainAnchors, anchor]
        })),
      
      clearAllData: () =>
        set({
          uploadedDatasets: [],
          currentUpload: null,
          daPublications: [],
          currentDA: null,
          computeResults: [],
          currentCompute: null,
          chainAnchors: []
        })
    }),
    {
      name: 'dara-forge-data', // localStorage key
      partialize: (state) => ({
        // Only persist essential data
        uploadedDatasets: state.uploadedDatasets,
        daPublications: state.daPublications,
        computeResults: state.computeResults,
        chainAnchors: state.chainAnchors
      })
    }
  )
);