import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk'
import { ethers } from 'ethers'

interface UploadResult {
  rootHash: string
  txHash: string
  size: number
  filename: string
}

interface DownloadResult {
  success: boolean
  filePath?: string
  error?: string
}

export class OGStorageService {
  private indexer: Indexer
  private provider: ethers.JsonRpcProvider
  private signer: ethers.Wallet | null = null
  
  // Updated to use correct 0G endpoints
  private readonly RPC_URL = process.env.VITE_OG_RPC || 'https://evmrpc-testnet.0g.ai/'
  private readonly INDEXER_RPC = process.env.VITE_OG_INDEXER || 'https://indexer-storage-testnet-turbo.0g.ai'
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.RPC_URL)
    this.indexer = new Indexer(this.INDEXER_RPC)
  }

  // Initialize with wallet connection
  async initialize(walletProvider: any): Promise<void> {
    try {
      if (!walletProvider) {
        throw new Error('Wallet provider not found')
      }

      // Create ethers provider from wallet
      const ethersProvider = new ethers.BrowserProvider(walletProvider)
      const signer = await ethersProvider.getSigner()
      this.signer = signer
      
      console.log('0G Storage Service initialized with wallet:', await signer.getAddress())
    } catch (error) {
      console.error('Failed to initialize 0G Storage:', error)
      throw error
    }
  }

  // FIXED: Upload file to 0G Storage using correct SDK pattern
  async uploadFile(file: File): Promise<UploadResult> {
    if (!this.signer) {
      throw new Error('Storage service not initialized with wallet')
    }

    try {
      console.log('Starting file upload to 0G Storage:', file.name)
      
      // Convert File to ZgFile - CORRECT METHOD
      const zgFile = new ZgFile(file)
      
      // Generate Merkle tree for verification
      const [tree, treeErr] = await zgFile.merkleTree()
      if (treeErr !== null) {
        throw new Error(`Error generating Merkle tree: ${treeErr}`)
      }

      const rootHash = tree?.rootHash()
      if (!rootHash) {
        throw new Error('Failed to generate root hash')
      }

      console.log('File Root Hash:', rootHash)

      // Upload to 0G network - CORRECT SDK USAGE
      const [tx, uploadErr] = await this.indexer.upload(zgFile, this.RPC_URL, this.signer)
      if (uploadErr !== null) {
        throw new Error(`Upload error: ${uploadErr}`)
      }

      console.log('Upload successful! Transaction:', tx)

      // Clean up resources
      await zgFile.close()

      return {
        rootHash,
        txHash: tx,
        size: file.size,
        filename: file.name
      }
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  // FIXED: Upload multiple files with batch processing
  async uploadMultipleFiles(files: FileList | File[]): Promise<UploadResult[]> {
    if (!this.signer) {
      throw new Error('Storage service not initialized with wallet')
    }

    const results: UploadResult[] = []
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      try {
        const result = await this.uploadFile(file)
        results.push(result)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        // Continue with other files, but track the error
        results.push({
          rootHash: '',
          txHash: '',
          size: file.size,
          filename: `${file.name} (FAILED: ${error.message})`
        })
      }
    }

    return results
  }

  // FIXED: Download file with proper verification
  async downloadFile(rootHash: string, filename: string): Promise<DownloadResult> {
    try {
      console.log('Downloading file with hash:', rootHash)
      
      // Create output path
      const outputPath = `./downloads/${filename}`
      
      // Download with Merkle proof verification - CORRECT METHOD
      const downloadErr = await this.indexer.download(rootHash, outputPath, true)
      
      if (downloadErr !== null) {
        throw new Error(`Download error: ${downloadErr}`)
      }

      console.log('Download successful!')
      return {
        success: true,
        filePath: outputPath
      }
    } catch (error) {
      console.error('Download failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // FIXED: Verify file integrity
  async verifyFile(file: File, expectedRootHash: string): Promise<boolean> {
    try {
      const zgFile = new ZgFile(file)
      const [tree, treeErr] = await zgFile.merkleTree()
      
      if (treeErr !== null) {
        await zgFile.close()
        return false
      }

      const actualRootHash = tree?.rootHash()
      await zgFile.close()
      
      return actualRootHash === expectedRootHash
    } catch (error) {
      console.error('Verification failed:', error)
      return false
    }
  }

  // Check if service is ready
  isInitialized(): boolean {
    return this.signer !== null
  }

  // Get signer address
  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Storage service not initialized')
    }
    return await this.signer.getAddress()
  }
}

