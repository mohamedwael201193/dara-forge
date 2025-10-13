// DARA Feature Flags - Safe Development Environment
// Runtime feature toggles for gradual rollout and safe testing

import React from 'react'

export interface FeatureFlags {
  UI_V2: boolean
  ENHANCED_PIPELINE: boolean
  VERIFY_PAGE: boolean
  CLI_TOOLS: boolean
  INFT_SYSTEM: boolean
  DEBUG_MODE: boolean
}

// Environment variable helpers with runtime support
const getEnvBoolean = (key: string, fallback: boolean = false): boolean => {
  if (typeof window !== 'undefined') {
    // Client-side: Check runtime config first, then localStorage for dev overrides
    const runtimeValue = (window as any).__DARA_CONFIG__?.[key]
    if (runtimeValue !== undefined) {
      return runtimeValue === 'true' || runtimeValue === true
    }
    
    // Allow localStorage overrides in development
    if (import.meta.env.DEV) {
      const localValue = localStorage.getItem(`DARA_${key}`)
      if (localValue !== null) {
        return localValue === 'true'
      }
    }
  }
  
  // Server-side: Use process.env
  const envValue = process.env[`DARA_${key}`] || process.env[`VITE_DARA_${key}`]
  if (envValue !== undefined) {
    return envValue === 'true'
  }
  
  return fallback
}

// Feature flag configuration
export const FEATURE_FLAGS: FeatureFlags = {
  // Core UI redesign flag - enables new pipeline UI
  UI_V2: getEnvBoolean('UI_V2', true),
  
  // Enhanced pipeline workflow (Storage → DA → Chain → Compute)
  ENHANCED_PIPELINE: getEnvBoolean('ENHANCED_PIPELINE', false),
  
  // Verification page and tools
  VERIFY_PAGE: getEnvBoolean('VERIFY_PAGE', false),
  
  // CLI verification tools
  CLI_TOOLS: getEnvBoolean('CLI_TOOLS', false),
  
  // Intelligent NFTs system (ERC-7857)
  INFT_SYSTEM: getEnvBoolean('INFT_SYSTEM', false),
  
  // Debug mode with extended logging
  DEBUG_MODE: getEnvBoolean('DEBUG_MODE', import.meta.env.DEV || false)
}

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[feature]
}

// Development helper to toggle features at runtime
export const setFeatureFlag = (feature: keyof FeatureFlags, enabled: boolean): void => {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    localStorage.setItem(`DARA_${feature}`, enabled.toString())
    console.log(`🚩 Feature flag ${feature} set to ${enabled} (page reload required)`)
  }
}

// Debug info for development
export const getFeatureFlagStatus = (): Record<string, boolean> => {
  return { ...FEATURE_FLAGS }
}

// Feature flag component wrapper
export const withFeatureFlag = <T extends Record<string, any>>(
  feature: keyof FeatureFlags,
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<T>
) => {
  return (props: T) => {
    if (isFeatureEnabled(feature)) {
      return <Component {...props} />
    }
    
    if (FallbackComponent) {
      return <FallbackComponent {...props} />
    }
    
    return null
  }
}

// Development console commands (available in dev mode)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__DARA_FLAGS__ = {
    get: getFeatureFlagStatus,
    set: setFeatureFlag,
    enable: (feature: keyof FeatureFlags) => setFeatureFlag(feature, true),
    disable: (feature: keyof FeatureFlags) => setFeatureFlag(feature, false),
    reset: () => {
      Object.keys(FEATURE_FLAGS).forEach(key => {
        localStorage.removeItem(`DARA_${key}`)
      })
      console.log('🚩 All feature flags reset (page reload required)')
    }
  }
}