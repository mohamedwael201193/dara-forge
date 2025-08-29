import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Play, Clock, CheckCircle, XCircle, BarChart3, Brain, Cpu, TrendingUp, Eye } from 'lucide-react';
import { ogComputeService, ComputeJobStatus, ComputeJobResult } from '../../services/ogCompute';
import { ResearchStatus } from '../../contracts/DaraResearch';

interface ComputeJobManagerProps {
  tokenId: number;
  datasetRoot: string;
  currentStatus: ResearchStatus;
  onJobCompleted: (jobId: string, outputRoot: string) => void;
}

export const ComputeJobManager: React.FC<ComputeJobManagerProps> = ({
  tokenId,
  datasetRoot,
  currentStatus,
  onJobCompleted
}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [selectedJobType, setSelectedJobType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeJobs, setActiveJobs] = useState<Map<string, ComputeJobStatus>>(new Map());
  const [jobResults, setJobResults] = useState<Map<string, ComputeJobResult>>(new Map());
  const [showResults, setShowResults] = useState<string | null>(null);

  const jobTypes = ogComputeService.getAvailableJobTypes();

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'ai-analysis': return <Brain className="w-4 h-4" />;
      case 'ml-training': return <Cpu className="w-4 h-4" />;
      case 'data-processing': return <BarChart3 className="w-4 h-4" />;
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      case 'visualization': return <Eye className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running': return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleSubmitJob = async () => {
    if (!selectedJobType || !walletClient || !address) return;

    setIsSubmitting(true);
    try {
      const jobId = await ogComputeService.submitComputeJob({
        tokenId,
        jobType: selectedJobType,
        inputDataRoot: datasetRoot,
        parameters: {
          model: import.meta.env.VITE_DEFAULT_AI_MODEL || 'research-analyzer-v1',
          maxProcessingTime: 300 // 5 minutes
        }
      }, walletClient);

      // Start monitoring the job
      const cleanup = ogComputeService.monitorJobProgress(jobId, (status) => {
        setActiveJobs(prev => new Map(prev.set(jobId, status)));
        
        if (status.status === 'completed' && status.outputDataRoot) {
          handleJobCompleted(jobId, status.outputDataRoot);
        }
      });

      // Store cleanup function for later use
      (window as any)[`cleanup_${jobId}`] = cleanup;

      setSelectedJobType('');
    } catch (error) {
      console.error('Error submitting compute job:', error);
      alert('Failed to submit compute job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobCompleted = async (jobId: string, outputRoot: string) => {
    try {
      if (walletClient) {
        await ogComputeService.completeComputeJob(tokenId, jobId, outputRoot, walletClient);
        onJobCompleted(jobId, outputRoot);
      }

      // Fetch job results
      const results = await ogComputeService.getJobResults(jobId);
      setJobResults(prev => new Map(prev.set(jobId, results)));
    } catch (error) {
      console.error('Error completing compute job:', error);
    }
  };

  const handleViewResults = (jobId: string) => {
    setShowResults(showResults === jobId ? null : jobId);
  };

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      activeJobs.forEach((_, jobId) => {
        const cleanup = (window as any)[`cleanup_${jobId}`];
        if (cleanup) cleanup();
      });
    };
  }, []);

  const canSubmitJob = currentStatus === ResearchStatus.Uploaded && address;

  return (
    <div className="space-y-6">
      {/* Job Submission */}
      {canSubmitJob && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Compute Job</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job Type
              </label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Choose a job type...</option>
                {jobTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmitJob}
              disabled={!selectedJobType || isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting Job...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Submit Compute Job
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Jobs */}
      {activeJobs.size > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Compute Jobs</h3>
          
          <div className="space-y-4">
            {Array.from(activeJobs.entries()).map(([jobId, status]) => (
              <div key={jobId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getJobTypeIcon(jobId.split('_')[0])}
                    <span className="font-medium text-gray-900">Job {jobId.slice(-8)}</span>
                    {getStatusIcon(status.status)}
                    <span className="text-sm text-gray-600 capitalize">{status.status}</span>
                  </div>
                  
                  {status.status === 'completed' && jobResults.has(jobId) && (
                    <button
                      onClick={() => handleViewResults(jobId)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {showResults === jobId ? 'Hide Results' : 'View Results'}
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Progress: {status.progress}%
                  {status.status === 'completed' && status.endTime && (
                    <span className="ml-4">
                      Completed in {Math.floor((status.endTime - status.startTime) / 60)} minutes
                    </span>
                  )}
                </div>

                {/* Job Results */}
                {showResults === jobId && jobResults.has(jobId) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Results</h4>
                    {(() => {
                      const results = jobResults.get(jobId)!;
                      return (
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Summary</h5>
                            <p className="text-sm text-gray-600">{results.results.summary}</p>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Key Insights</h5>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {results.results.insights.map((insight, index) => (
                                <li key={index}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Metrics</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(results.results.metrics).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                  <span className="font-medium">
                                    {typeof value === 'number' && value < 1 ? 
                                      (value * 100).toFixed(1) + '%' : 
                                      value.toString()
                                    }
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {!canSubmitJob && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              {!address ? 'Connect your wallet to submit compute jobs' : 
               'Dataset must be uploaded before submitting compute jobs'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

