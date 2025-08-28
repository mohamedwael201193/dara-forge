// Error suppression utilities for non-critical console errors

export function suppressNonCriticalErrors() {
  // Suppress Coinbase metrics errors (401 from cca-lite.coinbase.com)
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args)
      
      // Suppress Coinbase metrics 401 errors
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes('coinbase.com/metrics') && 
          response.status === 401) {
        // Return a mock successful response to prevent console errors
        return new Response('{}', { status: 200 })
      }
      
      return response
    } catch (error) {
      // Only log non-Coinbase errors
      if (!args[0] || !args[0].toString().includes('coinbase.com')) {
        console.error('Fetch error:', error)
      }
      throw error
    }
  }

  // Suppress font preload warnings
  const originalConsoleWarn = console.warn
  console.warn = (...args) => {
    const message = args.join(' ')
    
    // Suppress font preload warnings
    if (message.includes('was preloaded using link preload but not used') ||
        message.includes('fonts.reown.com') ||
        message.includes('KHTeka-Medium.woff2')) {
      return // Suppress these warnings
    }
    
    // Allow other warnings through
    originalConsoleWarn(...args)
  }

  // Suppress storage cache warnings
  const originalConsoleLog = console.log
  console.log = (...args) => {
    const message = args.join(' ')
    
    // Suppress cache discard messages
    if (message.includes('Discarding cache for address eip155:')) {
      return // Suppress these logs
    }
    
    // Allow other logs through
    originalConsoleLog(...args)
  }
}

// Initialize error suppression
export function initializeErrorSuppression() {
  if (typeof window !== 'undefined') {
    suppressNonCriticalErrors()
  }
}

