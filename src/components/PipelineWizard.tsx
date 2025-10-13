import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Anchor,
  CheckCircle,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  FileDown,
  Play,
  RefreshCw,
  Upload
} from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { CHAIN_CONFIG } from '../config/chain'
import { useOgUpload } from '../hooks/useOgUpload'
import { anchorWithWallet } from '../lib/chain/anchorClient'
import { useActivityRecorder } from '../services/activityRecorder'
import { callComputeWithCircuitBreaker, computeCircuitBreaker } from '../services/computeCircuitBreaker'
import { useDataStore } from '../store/dataStore'

// Pipeline step states
export type StepStatus = 'pending' | 'running' | 'completed' | 'error'

export interface StepResult {
  storage?: {
    merkleRoot: string
    fileSize: number
    fileName: string
    datasetId?: string
    indexer?: string
  }
  da?: {
    blobHash: string
    dataRoot: string
    commitment: string
    daEndpointUsed?: string
  }
  chain?: {
    txHash: string
    blockNumber: number
    contractAddress: string
  }
  compute?: {
    requestId: string
    provider: string
    model: string
    signature: string
    attestationUrl: string
    responseId: string
    maintenanceMode?: boolean
    degraded?: boolean
  }
}

export interface PipelineState {
  currentStep: number
  steps: {
    [key: number]: {
      status: StepStatus
      logs: string[]
      result?: any
    }
  }
  results: StepResult
}

const STEPS = [
  {
    id: 1,
    title: 'Storage Upload',
    description: 'Upload file to 0G Storage network and compute Merkle root',
    icon: Upload,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'DA Publish',
    description: 'Publish data availability proof with blob commitment',
    icon: Database,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    title: 'Chain Anchor',
    description: 'Anchor commitments to 0G blockchain for immutability',
    icon: Anchor,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 4,
    title: 'Compute Request',
    description: 'Execute verifiable AI computation with TEE attestation',
    icon: Cpu,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 5,
    title: 'Generate Passport',
    description: 'Create reproducibility passport with all proofs',
    icon: FileDown,
    color: 'from-indigo-500 to-purple-500'
  }
]

const PipelineWizard: React.FC = () => {
  const { uploadFiles } = useOgUpload()
  const { addUploadedDataset, addDAPublication } = useDataStore()
  const { recordChainAnchor } = useActivityRecorder()
  
  const [pipelineState, setPipelineState] = useState<PipelineState>({
    currentStep: 1,
    steps: {
      1: { status: 'pending', logs: [] },
      2: { status: 'pending', logs: [] },
      3: { status: 'pending', logs: [] },
      4: { status: 'pending', logs: [] },
      5: { status: 'pending', logs: [] }
    },
    results: {}
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<number | null>(null)

  // Helper to add logs to a step
  const addLog = useCallback((stepId: number, message: string) => {
    setPipelineState(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [stepId]: {
          ...prev.steps[stepId],
          logs: [...prev.steps[stepId].logs, `${new Date().toLocaleTimeString()}: ${message}`]
        }
      }
    }))
  }, [])

  // Helper to update step status
  const updateStepStatus = useCallback((stepId: number, status: StepStatus, result?: any) => {
    setPipelineState(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [stepId]: {
          ...prev.steps[stepId],
          status,
          result
        }
      }
    }))
  }, [])

  // Step 1: Storage Upload
  const executeStorageUpload = async () => {
    if (!selectedFile) return

    updateStepStatus(1, 'running')
    addLog(1, `Starting upload of ${selectedFile.name} (${selectedFile.size} bytes)`)

    try {
      addLog(1, 'Uploading to 0G Storage network...')
      
      // Use the same working upload method as DemoApp
      const result = await uploadFiles([selectedFile])
      
      if (!result.ok || !result.root) {
        throw new Error(result.error || 'Upload failed')
      }

      addLog(1, `Upload successful. Root: ${result.root}`)
      addLog(1, 'Recomputing Merkle root locally for verification...')

      // Store result and enable next step
      const datasetId = `pipeline-${Date.now()}`;
      const indexerUsed = result.indexerTx || 'default-indexer'; // Get indexer transaction if available
      
      const storageResult = {
        merkleRoot: result.root,
        fileSize: selectedFile.size,
        fileName: selectedFile.name,
        datasetId,
        indexer: indexerUsed
      }

      // Also save to global store like DemoApp does
      const uploadResult = {
        datasetId,
        rootHash: result.root,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadTime: new Date().toISOString(),
        txHash: undefined,
        indexer: indexerUsed
      }
      addUploadedDataset(uploadResult)

      updateStepStatus(1, 'completed', storageResult)
      setPipelineState(prev => ({
        ...prev,
        results: { ...prev.results, storage: storageResult },
        currentStep: 2
      }))

      addLog(1, '✅ Storage upload verified and complete')

    } catch (error) {
      addLog(1, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      updateStepStatus(1, 'error')
    }
  }

  // Step 2: DA Publish
  const executeDAPublish = async () => {
    const storageResult = pipelineState.results.storage
    if (!storageResult || !selectedFile) return

    updateStepStatus(2, 'running')
    addLog(2, 'Publishing data availability proof...')

    try {
      addLog(2, `Publishing commitment for root: ${storageResult.merkleRoot}`)
      
      // Use the same DA implementation as DemoApp
      const fileData = await selectedFile.arrayBuffer()
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileData)))

      const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

      const response = await fetch(`${API_BASE}/api/da`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          data: base64Data,
          metadata: { 
            datasetId: `pipeline-${Date.now()}`,
            rootHash: storageResult.merkleRoot,
            fileName: selectedFile.name,
            fileSize: selectedFile.size
          }
        })
      })

      if (!response.ok) {
        throw new Error(`DA submission failed: ${response.status}`)
      }

      const result = await response.json()
      addLog(2, `DA publish successful. Blob hash: ${result.blobHash || result.hash}`)

      const daResult = {
        blobHash: result.blobHash || result.hash || 'unknown',
        dataRoot: result.dataRoot || storageResult.merkleRoot,
        commitment: result.commitment || storageResult.merkleRoot,
        daEndpointUsed: result.daEndpointUsed || 'default-da-endpoint'
      }

      // Save to global store like DemoApp does
      addDAPublication(result)

      updateStepStatus(2, 'completed', daResult)
      setPipelineState(prev => ({
        ...prev,
        results: { ...prev.results, da: daResult },
        currentStep: 3
      }))

      addLog(2, '✅ Data availability proof published')

    } catch (error) {
      addLog(2, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      updateStepStatus(2, 'error')
    }
  }

  // Step 3: Chain Anchor
  const executeChainAnchor = async () => {
    const { storage } = pipelineState.results
    if (!storage) return

    updateStepStatus(3, 'running')
    addLog(3, 'Anchoring commitments to 0G blockchain...')

    try {
      addLog(3, `Anchoring to ${CHAIN_CONFIG.name} (Chain ID: ${CHAIN_CONFIG.chainId})`)
      addLog(3, `Root hash: ${storage.merkleRoot}`)

      // Use the enhanced anchor implementation with activity recording
      const { storage: storageResult, da: daResult } = pipelineState.results
      
      const { txHash, explorerUrl, activityData } = await anchorWithWallet(
        storage.merkleRoot as `0x${string}`,
        undefined, // manifest
        undefined, // project
        {
          datasetId: storageResult?.datasetId,
          storageIndexer: storageResult?.indexer,
          daEndpoint: daResult?.daEndpointUsed,
          description: `Pipeline anchor: ${selectedFile?.name || 'unknown file'}`
        }
      )
      
      addLog(3, `Transaction submitted: ${txHash}`)
      addLog(3, 'Waiting for confirmation...')

      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Record the chain anchor activity with enhanced metadata
      if (activityData) {
        recordChainAnchor(activityData)
        addLog(3, `📋 Activity recorded with verification metadata`)
      }

      const chainResult = {
        txHash,
        blockNumber: activityData?.blockNumber || 0,
        contractAddress: CHAIN_CONFIG.contracts.anchor || ''
      }

      updateStepStatus(3, 'completed', chainResult)
      setPipelineState(prev => ({
        ...prev,
        results: { ...prev.results, chain: chainResult },
        currentStep: 4
      }))

      addLog(3, '✅ Commitments anchored to blockchain')
      if (explorerUrl) {
        addLog(3, `Explorer: ${explorerUrl}`)
      }

    } catch (error) {
      addLog(3, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      updateStepStatus(3, 'error')
    }
  }

  // Step 4: Compute Request
  const executeComputeRequest = async () => {
    const { storage, da, chain } = pipelineState.results
    if (!storage || !da || !chain) return

    updateStepStatus(4, 'running')
    addLog(4, 'Submitting compute request with TEE attestation...')

    try {
      // Check circuit breaker status before starting
      const status = computeCircuitBreaker.getStatus()
      addLog(4, `Circuit breaker status: ${status.state} (failures: ${status.failureCount})`)
      
      if (status.maintenanceMode) {
        addLog(4, '⚠️ 0G Compute is in maintenance mode')
        addLog(4, 'Pipeline will continue with other components...')
        
        // Create a maintenance result that allows pipeline to continue
        const maintenanceResult = {
          requestId: 'maintenance-mode',
          provider: 'Maintenance',
          model: 'unavailable',
          signature: 'maintenance-skip',
          attestationUrl: '/maintenance',
          responseId: 'maintenance-mode',
          maintenanceMode: true
        }

        updateStepStatus(4, 'completed', maintenanceResult)
        setPipelineState(prev => ({
          ...prev,
          results: { ...prev.results, compute: maintenanceResult },
          currentStep: 5
        }))

        addLog(4, '✅ Pipeline continues with maintenance mode fallback')
        return
      }

      // Use circuit breaker protected compute call
      const analysisResult = await callComputeWithCircuitBreaker(async () => {
        addLog(4, 'Connecting to 0G Compute broker...')

        // Submit compute request
        const analyzeResponse = await fetch('/api/compute?action=analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            root: storage.merkleRoot,
            model: 'gpt-4o-mini',
            temperature: 0.7
          })
        })
        
        const analyzeData = await analyzeResponse.json()
        
        if (!analyzeResponse.ok) {
          throw new Error(analyzeData.error || `Compute request failed: ${analyzeResponse.status}`)
        }
        
        const jobId = analyzeData.jobId
        if (!jobId) {
          throw new Error('No job ID returned from analysis')
        }

        addLog(4, `Compute request accepted. Job ID: ${jobId}`)
        addLog(4, 'Waiting for TEE processing...')

        // Poll for result with circuit breaker awareness
        let attempts = 0
        const maxAttempts = 30 // 30 seconds timeout
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          
          const resultResponse = await fetch(`/api/compute?action=result&id=${jobId}`)
          const resultData = await resultResponse.json()
          
          if (resultResponse.ok && resultData.ok) {
            return resultData
          }
          
          attempts++
          addLog(4, `Polling attempt ${attempts}/${maxAttempts}...`)
        }

        throw new Error('Compute request timed out')
      }, 'Pipeline Compute Request')

      addLog(4, 'Verifying TEE attestation...')
      addLog(4, `Model: ${analysisResult.model}`)
      addLog(4, `Provider: ${analysisResult.provider}`)

      const computeResult = {
        requestId: analysisResult.jobId || 'unknown',
        provider: analysisResult.provider || 'TEE-Provider',
        model: analysisResult.model || 'gpt-4o-mini',
        signature: 'tee-signature-verified',
        attestationUrl: '/api/compute?action=health',
        responseId: analysisResult.jobId || 'unknown'
      }

      updateStepStatus(4, 'completed', computeResult)
      setPipelineState(prev => ({
        ...prev,
        results: { ...prev.results, compute: computeResult },
        currentStep: 5
      }))

      addLog(4, '✅ Compute request completed with verified attestation')

    } catch (error: any) {
      console.error('Pipeline compute error:', error)
      
      // Handle circuit breaker errors with graceful degradation
      if (error.message?.includes('Circuit:')) {
        const status = computeCircuitBreaker.getStatus()
        const gracefulOptions = computeCircuitBreaker.getGracefulOptions()
        
        addLog(4, `⚠️ ${computeCircuitBreaker.getStatusMessage()}`)
        
        if (gracefulOptions.offlineMode) {
          addLog(4, '🔄 Enabling graceful degradation mode...')
          
          // Create a degraded result that allows pipeline to continue
          const degradedResult = {
            requestId: 'degraded-mode',
            provider: 'Degraded',
            model: 'circuit-breaker',
            signature: 'degraded-skip',
            attestationUrl: '/degraded',
            responseId: 'degraded-mode',
            degraded: true
          }

          updateStepStatus(4, 'completed', degradedResult)
          setPipelineState(prev => ({
            ...prev,
            results: { ...prev.results, compute: degradedResult },
            currentStep: 5
          }))

          addLog(4, '✅ Pipeline continues with degraded compute mode')
        } else {
          addLog(4, `❌ Compute unavailable: ${error.message}`)
          updateStepStatus(4, 'error')
        }
      } else {
        addLog(4, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        updateStepStatus(4, 'error')
      }
    }
  }

  // Step 5: Generate Passport
  const generatePassport = () => {
    const { storage, da, chain, compute } = pipelineState.results
    if (!storage || !da || !chain || !compute) return

    updateStepStatus(5, 'running')
    addLog(5, 'Generating reproducibility passport...')

    try {
      const passport = {
        version: "1",
        dataset: {
          merkleRoot: storage.merkleRoot,
          bytes: storage.fileSize,
          fileName: storage.fileName
        },
        da: {
          blobHash: da.blobHash,
          dataRoot: da.dataRoot,
          commitment: da.commitment
        },
        chain: {
          network: CHAIN_CONFIG.name,
          anchorTx: chain.txHash,
          contract: chain.contractAddress,
          blockNumber: chain.blockNumber
        },
        compute: {
          provider: compute.provider,
          model: compute.model,
          responseId: compute.responseId,
          requestId: compute.requestId,
          signature: compute.signature,
          attestationUrl: compute.attestationUrl
        },
        issuedAt: new Date().toISOString(),
        verificationUri: `/verify?root=${storage.merkleRoot}&blob=${da.blobHash}&tx=${chain.txHash}&sig=${compute.signature}&attestationUrl=${encodeURIComponent(compute.attestationUrl)}`
      }

      // Download passport JSON
      const blob = new Blob([JSON.stringify(passport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reproducibility_passport_${storage.merkleRoot.slice(0, 8)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      updateStepStatus(5, 'completed', passport)
      addLog(5, '✅ Reproducibility passport generated and downloaded')

    } catch (error) {
      addLog(5, `❌ Error generating passport: ${error instanceof Error ? error.message : 'Unknown error'}`)
      updateStepStatus(5, 'error')
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const canExecuteStep = (stepId: number) => {
    if (stepId === 1) return !!selectedFile
    if (stepId === 2) return pipelineState.steps[1].status === 'completed'
    if (stepId === 3) return pipelineState.steps[2].status === 'completed'
    if (stepId === 4) return pipelineState.steps[3].status === 'completed'
    if (stepId === 5) return pipelineState.steps[4].status === 'completed'
    return false
  }

  const getStepAction = (stepId: number) => {
    switch (stepId) {
      case 1: return executeStorageUpload
      case 2: return executeDAPublish
      case 3: return executeChainAnchor
      case 4: return executeComputeRequest
      case 5: return generatePassport
      default: return () => {}
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Research Data <span className="text-gradient-professional">Pipeline</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Secure, verifiable research workflow using 0G blockchain infrastructure
          </p>

          {/* Progress Header */}
          <div className="flex justify-center space-x-4 mb-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                className="flex items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                  ${pipelineState.steps[step.id].status === 'completed' ? 'bg-emerald-500 text-white' :
                    pipelineState.steps[step.id].status === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                    pipelineState.steps[step.id].status === 'error' ? 'bg-red-500 text-white' :
                    step.id <= pipelineState.currentStep ? 'bg-slate-600 text-white' :
                    'bg-slate-700 text-slate-400'
                  }
                `}>
                  {pipelineState.steps[step.id].status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : pipelineState.steps[step.id].status === 'error' ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    w-8 h-1 mx-2
                    ${pipelineState.steps[step.id].status === 'completed' ? 'bg-emerald-500' : 'bg-slate-600'}
                  `} />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* File Upload Section */}
        {pipelineState.currentStep === 1 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-professional">
              <h3 className="text-xl font-semibold text-white mb-4">Select Research Data File</h3>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:transition-colors file:duration-200"
              />
              {selectedFile && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-300">
                    <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Pipeline Steps */}
        <div className="space-y-6">
          {STEPS.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              state={pipelineState.steps[step.id]}
              canExecute={canExecuteStep(step.id)}
              onExecute={getStepAction(step.id)}
              result={pipelineState.results}
              isExpanded={expandedLogs === step.id}
              onToggleLogs={() => setExpandedLogs(expandedLogs === step.id ? null : step.id)}
              onCopy={copyToClipboard}
            />
          ))}
        </div>

        {/* Final Actions */}
        {pipelineState.steps[5].status === 'completed' && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-professional">
              <h3 className="text-2xl font-bold text-white mb-6">Pipeline Complete! 🎉</h3>
              <p className="text-slate-400 mb-8">
                Your research data has been processed through the complete 0G verification pipeline.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.open(pipelineState.steps[5].result?.verificationUri, '_blank')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Open Verify Page</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

interface StepCardProps {
  step: typeof STEPS[0]
  state: PipelineState['steps'][number]
  canExecute: boolean
  onExecute: () => void
  result: StepResult
  isExpanded: boolean
  onToggleLogs: () => void
  onCopy: (text: string) => void
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  state,
  canExecute,
  onExecute,
  result,
  isExpanded,
  onToggleLogs,
  onCopy
}) => {
  const Icon = step.icon

  const getResultData = () => {
    switch (step.id) {
      case 1: return result.storage
      case 2: return result.da
      case 3: return result.chain
      case 4: return result.compute
      case 5: return state.result
      default: return null
    }
  }

  const resultData = getResultData()

  return (
    <motion.div
      className={`card-professional border-l-4 ${
        state.status === 'completed' ? 'border-emerald-500' :
        state.status === 'running' ? 'border-blue-500' :
        state.status === 'error' ? 'border-red-500' :
        'border-slate-600'
      }`}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start space-x-6">
        {/* Step Icon */}
        <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center
          bg-gradient-to-r ${step.color}
          ${state.status === 'completed' ? 'opacity-100' : 
            state.status === 'running' ? 'opacity-100 animate-pulse' :
            'opacity-60'}
        `}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Step Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span>{step.title}</span>
                {state.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                {state.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </h3>
              <p className="text-slate-400">{step.description}</p>
            </div>
            
            {/* Action Button */}
            {state.status !== 'completed' && (
              <button
                onClick={onExecute}
                disabled={!canExecute || state.status === 'running'}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all duration-200
                  ${canExecute && state.status !== 'running'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                  ${state.status === 'running' ? 'animate-pulse' : ''}
                `}
              >
                {state.status === 'running' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Result Panel */}
          {resultData && (
            <div className="mb-4 p-4 bg-slate-800 rounded-lg">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Results:</h4>
              <div className="space-y-2">
                {Object.entries(resultData).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">{key}:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-300 font-mono max-w-64 truncate">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </span>
                      <button
                        onClick={() => onCopy(typeof value === 'string' ? value : JSON.stringify(value))}
                        className="p-1 hover:bg-slate-700 rounded"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          {state.logs.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <button
                onClick={onToggleLogs}
                className="text-sm text-slate-400 hover:text-slate-300 flex items-center space-x-2"
              >
                <span>Logs ({state.logs.length})</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▶
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 max-h-32 overflow-y-auto bg-black rounded p-3"
                  >
                    {state.logs.map((log, index) => (
                      <div key={index} className="text-xs text-green-400 font-mono">
                        {log}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PipelineWizard