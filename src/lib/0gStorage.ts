// Browser-compatible 0G Storage service that uses API routes
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
  private walletAddress: string | null = null
  
  // Initialize with wallet connection
  async initialize(walletProvider: any): Promise<void> {
    try {
      if (!walletProvider) {
        throw new Error('Wallet provider not found')
      }

      // Get wallet address for API authentication
      const accounts = await walletProvider.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }
      
      this.walletAddress = accounts[0]
      console.log('0G Storage Service initialized with wallet:', this.walletAddress)
    } catch (error) {
      console.error('Failed to initialize 0G Storage:', error)
      throw error
    }
  }

  // Upload file to 0G Storage via API route
  async uploadFile(file: File): Promise<UploadResult> {
    if (!this.walletAddress) {
      throw new Error('Storage service not initialized with wallet')
    }

    try {
      console.log('Starting file upload to 0G Storage:', file.name)
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify({
        title: file.name,
        description: `Uploaded file: ${file.name}`,
        tags: [],
        version: '1.0',
        license: 'MIT',
        domain: 'general',
        contributors: [this.walletAddress],
        isPublic: true
      }))

      // Upload via API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Wallet-Address': this.walletAddress
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      if (!result.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      return {
        rootHash: result.rootHash,
        txHash: result.manifest?.uploadTime || '',
        size: file.size,
        filename: file.name
      }
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  // Upload multiple files with batch processing
  async uploadMultipleFiles(files: FileList | File[]): Promise<UploadResult[]> {
    if (!this.walletAddress) {
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

  // Download file with proper verification via API route
  async downloadFile(rootHash: string, filename: string): Promise<DownloadResult> {
    try {
      console.log('Downloading file with hash:', rootHash)
      
      const response = await fetch(`/api/download/${rootHash}?withProof=true&filename=${encodeURIComponent(filename)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }

      // For browser downloads, we'll trigger a download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return {
        success: true,
        filePath: `Downloaded: ${filename}`
      }
    } catch (error) {
      console.error('Download failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Verify file integrity via API route
  async verifyFile(file: File, expectedRootHash: string): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('expectedRootHash', expectedRootHash)

      const response = await fetch('/api/verify', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        return false
      }

      const result = await response.json()
      return result.verified === true
    } catch (error) {
      console.error('Verification failed:', error)
      return false
    }
  }

  // Check if service is ready
  isInitialized(): boolean {
    return this.walletAddress !== null
  }

  // Get wallet address
  async getAddress(): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Storage service not initialized')
    }
    return this.walletAddress
  }
}

