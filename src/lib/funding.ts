// Configuration for funding operations
const DEFAULT_FUNDING_AMOUNT = '0.1'; // 0.1 OG default
const MIN_BALANCE_THRESHOLD = '0.01'; // Auto-fund when below 0.01 OG
const MAX_AUTO_FUNDING_AMOUNT = '1.0'; // Maximum auto-funding amount

/**
 * Utility functions for managing 0G Compute account funding
 */

/**
 * Check if a balance amount meets the minimum threshold
 */
export function hasMinimumBalance(balanceFormatted: string): boolean {
  try {
    const balance = parseFloat(balanceFormatted);
    const threshold = parseFloat(MIN_BALANCE_THRESHOLD);
    return balance >= threshold;
  } catch {
    return false;
  }
}

/**
 * Get the recommended funding amount based on current balance
 */
export function getRecommendedFundingAmount(currentBalanceFormatted: string): string {
  try {
    const currentBalance = parseFloat(currentBalanceFormatted);
    const threshold = parseFloat(MIN_BALANCE_THRESHOLD);
    
    if (currentBalance >= threshold) {
      return '0'; // No funding needed
    }
    
    // Calculate funding amount to reach a comfortable level
    const targetBalance = parseFloat(DEFAULT_FUNDING_AMOUNT);
    const recommendedAmount = Math.max(targetBalance - currentBalance, parseFloat(MIN_BALANCE_THRESHOLD));
    
    // Cap at maximum auto-funding amount
    const cappedAmount = Math.min(recommendedAmount, parseFloat(MAX_AUTO_FUNDING_AMOUNT));
    
    return cappedAmount.toFixed(3);
  } catch {
    return DEFAULT_FUNDING_AMOUNT;
  }
}

/**
 * Format balance for display with appropriate precision
 */
export function formatBalance(balanceFormatted: string): string {
  try {
    const balance = parseFloat(balanceFormatted);
    
    if (balance === 0) {
      return '0 OG';
    }
    
    if (balance < 0.001) {
      return `${balance.toFixed(6)} OG`;
    }
    
    if (balance < 1) {
      return `${balance.toFixed(3)} OG`;
    }
    
    return `${balance.toFixed(2)} OG`;
  } catch {
    return `${balanceFormatted} OG`;
  }
}

/**
 * Estimate cost for a text analysis request
 */
export function estimateAnalysisCost(textLength: number, model: string = 'deepseek'): string {
  // Base cost estimation (these are rough estimates)
  const baseCostPerToken = 0.000001; // Very rough estimate in OG
  const estimatedTokens = Math.ceil(textLength / 4); // Rough token estimation
  const modelMultiplier = getModelCostMultiplier(model);
  
  const estimatedCost = estimatedTokens * baseCostPerToken * modelMultiplier;
  
  // Ensure minimum cost
  const minCost = 0.001; // 0.001 OG minimum
  const finalCost = Math.max(estimatedCost, minCost);
  
  return finalCost.toFixed(6);
}

/**
 * Get cost multiplier for different models
 */
function getModelCostMultiplier(model: string): number {
  const modelLower = model.toLowerCase();
  
  if (modelLower.includes('gpt-4') || modelLower.includes('claude')) {
    return 10; // Higher cost for premium models
  }
  
  if (modelLower.includes('deepseek') || modelLower.includes('llama')) {
    return 1; // Base cost
  }
  
  return 2; // Default multiplier for unknown models
}

/**
 * Check if there's sufficient balance for an operation
 */
export function hasSufficientBalance(
  availableBalance: string, 
  estimatedCost: string
): boolean {
  try {
    const balance = parseFloat(availableBalance);
    const cost = parseFloat(estimatedCost);
    
    // Add 20% buffer for safety
    const costWithBuffer = cost * 1.2;
    
    return balance >= costWithBuffer;
  } catch {
    return false;
  }
}

/**
 * Validate funding amount
 */
export function validateFundingAmount(amount: string): {
  isValid: boolean;
  error?: string;
  normalizedAmount?: string;
} {
  try {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        isValid: false,
        error: 'Amount must be a positive number'
      };
    }
    
    if (numAmount < 0.001) {
      return {
        isValid: false,
        error: 'Amount must be at least 0.001 OG'
      };
    }
    
    if (numAmount > 100) {
      return {
        isValid: false,
        error: 'Amount cannot exceed 100 OG'
      };
    }
    
    return {
      isValid: true,
      normalizedAmount: numAmount.toFixed(6)
    };
  } catch {
    return {
      isValid: false,
      error: 'Invalid amount format'
    };
  }
}

/**
 * Get funding suggestion message based on current state
 */
export function getFundingSuggestion(
  hasBalance: boolean,
  currentBalance: string,
  estimatedCost?: string
): {
  message: string;
  suggestedAmount: string;
  urgency: 'low' | 'medium' | 'high';
} {
  if (!hasBalance || !hasMinimumBalance(currentBalance)) {
    return {
      message: 'Your account balance is too low for 0G Compute operations.',
      suggestedAmount: getRecommendedFundingAmount(currentBalance),
      urgency: 'high'
    };
  }
  
  if (estimatedCost && !hasSufficientBalance(currentBalance, estimatedCost)) {
    return {
      message: `Insufficient balance for this operation (estimated cost: ${estimatedCost} OG).`,
      suggestedAmount: getRecommendedFundingAmount(currentBalance),
      urgency: 'medium'
    };
  }
  
  const balance = parseFloat(currentBalance);
  if (balance < 0.05) {
    return {
      message: 'Consider adding more credits to avoid interruptions.',
      suggestedAmount: DEFAULT_FUNDING_AMOUNT,
      urgency: 'low'
    };
  }
  
  return {
    message: 'Balance is sufficient for operations.',
    suggestedAmount: '0',
    urgency: 'low'
  };
}

/**
 * Create funding options for user selection
 */
export function getFundingOptions(): Array<{
  amount: string;
  label: string;
  description: string;
}> {
  return [
    {
      amount: '0.1',
      label: '0.1 OG',
      description: 'Good for several analyses'
    },
    {
      amount: '0.5',
      label: '0.5 OG', 
      description: 'Recommended for regular use'
    },
    {
      amount: '1.0',
      label: '1.0 OG',
      description: 'Extended usage'
    },
    {
      amount: '5.0',
      label: '5.0 OG',
      description: 'Heavy usage / development'
    }
  ];
}

/**
 * Parse transaction hash and provide user-friendly status
 */
export function parseFundingTransaction(txHash: string): {
  shortHash: string;
  explorerUrl: string;
} {
  const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  const explorerUrl = `https://chainscan-galileo.0g.ai/tx/${txHash}`;
  
  return {
    shortHash,
    explorerUrl
  };
}

// Export configuration constants for use in components
export const FUNDING_CONFIG = {
  DEFAULT_AMOUNT: DEFAULT_FUNDING_AMOUNT,
  MIN_THRESHOLD: MIN_BALANCE_THRESHOLD,
  MAX_AUTO_AMOUNT: MAX_AUTO_FUNDING_AMOUNT
} as const;