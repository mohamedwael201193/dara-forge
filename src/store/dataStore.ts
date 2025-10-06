import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UploadResult {
  datasetId: string;
  rootHash: string;
  fileName: string;
  fileSize: number;
  uploadTime: string;
  txHash?: string;
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
  chainAnchors: { txHash: string; rootHash: string; timestamp: string }[];
  
  // Actions
  setCurrentUpload: (upload: UploadResult | null) => void;
  addUploadedDataset: (upload: UploadResult) => void;
  setCurrentDA: (da: DAResult | null) => void;
  addDAPublication: (da: DAResult) => void;
  setCurrentCompute: (compute: ComputeResult | null) => void;
  addComputeResult: (compute: ComputeResult) => void;
  addChainAnchor: (anchor: { txHash: string; rootHash: string; timestamp: string }) => void;
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