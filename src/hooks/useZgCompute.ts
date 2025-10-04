import { useCallback, useEffect, useState } from 'react';

// Types for the compute API responses
interface ComputeAccount {
  address: string;
  totalBalance: string;
  locked: string;
  available: string;
  totalBalanceFormatted: string;
  lockedFormatted: string;
  availableFormatted: string;
}

interface ComputeService {
  name: string;
  provider: string;
  type: string;
  url: string;
  inputPrice: string;
  outputPrice: string;
  priceFormatted: {
    input: string;
    output: string;
  };
}

interface ComputeHealth {
  status: 'healthy' | 'error';
  broker?: {
    endpoint: string;
    connected: boolean;
  };
  account?: {
    address: string;
    available: string;
  };
  services?: {
    count: number;
    names: string[];
  };
  error?: string;
  timestamp: string;
}

interface AnalysisResult {
  ok: boolean;
  model: string;
  provider: string;
  root: string | null;
  verified: boolean;
  content: string;
  usage: any;
  timestamp: string;
}

interface AnalysisRequest {
  text?: string;
  root?: string;
  model?: string;
  temperature?: number;
}

/**
 * Hook for managing 0G Compute health and diagnostics
 */
export function useZgComputeHealth() {
  const [health, setHealth] = useState<ComputeHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/compute?action=health');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      setHealth(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Health check failed';
      setError(message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-check health on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    health,
    loading,
    error,
    checkHealth,
    isHealthy: health?.status === 'healthy'
  };
}

/**
 * Hook for managing 0G Compute account and funding
 */
export function useZgComputeAccount() {
  const [account, setAccount] = useState<ComputeAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/compute?action=diagnostics');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      if (data.account) {
        setAccount(data.account);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch account';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCredit = useCallback(async (amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/compute?action=topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      // Refresh account after successful topup
      await fetchAccount();
      
      return data.txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add credit';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAccount]);

  return {
    account,
    loading,
    error,
    fetchAccount,
    addCredit,
    hasBalance: account ? parseFloat(account.availableFormatted) > 0 : false
  };
}

/**
 * Hook for running AI analysis through 0G Compute
 */
export function useZgComputeAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = useCallback(async (request: AnalysisRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Start analysis
      const analyzeResponse = await fetch('/api/compute?action=analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const analyzeData = await analyzeResponse.json();
      
      if (!analyzeResponse.ok) {
        throw new Error(analyzeData.error || `HTTP ${analyzeResponse.status}`);
      }
      
      const jobId = analyzeData.jobId;
      if (!jobId) {
        throw new Error('No job ID returned from analysis');
      }
      
      // Poll for result
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const resultResponse = await fetch(`/api/compute?action=result&id=${jobId}`);
        const resultData = await resultResponse.json();
        
        if (resultResponse.ok && resultData.ok) {
          setResult(resultData);
          return resultData;
        }
        
        attempts++;
      }
      
      throw new Error('Analysis timed out');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    runAnalysis,
    clearResult,
    hasResult: !!result
  };
}

/**
 * Hook for listing available 0G Compute services
 */
export function useZgComputeServices() {
  const [services, setServices] = useState<ComputeService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/compute?action=diagnostics');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      if (data.services?.details) {
        setServices(data.services.details);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    serviceCount: services.length
  };
}

/**
 * Comprehensive hook that combines all 0G Compute functionality
 */
export function useZgCompute() {
  const health = useZgComputeHealth();
  const account = useZgComputeAccount();
  const analysis = useZgComputeAnalysis();
  const services = useZgComputeServices();

  const isReady = health.isHealthy && account.hasBalance && services.serviceCount > 0;

  return {
    health,
    account,
    analysis,
    services,
    isReady,
    refresh: async () => {
      await Promise.all([
        health.checkHealth(),
        account.fetchAccount(),
        services.fetchServices()
      ]);
    }
  };
}