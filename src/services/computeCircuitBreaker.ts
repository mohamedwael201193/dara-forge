/**
 * Compute Circuit Breaker Service
 *
 * Implements circuit breaker pattern for 0G Compute API calls to handle
 * maintenance periods, network issues, and service degradation gracefully.
 */

import { COMPUTE_CONFIG } from "@/config/verification";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface ComputeHealthStatus {
  state: CircuitState;
  failureCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  nextRetryTime?: number;
  maintenanceMode?: boolean;
}

class ComputeCircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private nextRetryTime?: number;
  private maintenanceMode = false;

  private readonly config = COMPUTE_CONFIG.circuitBreaker;

  /**
   * Get current circuit breaker status
   */
  getStatus(): ComputeHealthStatus {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextRetryTime: this.nextRetryTime,
      maintenanceMode: this.maintenanceMode,
    };
  }

  /**
   * Check if compute calls should be allowed
   */
  canAttemptCall(): boolean {
    if (this.maintenanceMode) {
      console.log("[Circuit Breaker] Compute is in maintenance mode");
      return false;
    }

    const now = Date.now();

    switch (this.state) {
      case "CLOSED":
        return true;

      case "OPEN":
        if (this.nextRetryTime && now >= this.nextRetryTime) {
          console.log("[Circuit Breaker] Transitioning to HALF_OPEN for retry");
          this.state = "HALF_OPEN";
          return true;
        }
        console.log("[Circuit Breaker] Circuit is OPEN, blocking call");
        return false;

      case "HALF_OPEN":
        console.log(
          "[Circuit Breaker] In HALF_OPEN state, allowing single test call"
        );
        return true;

      default:
        return false;
    }
  }

  /**
   * Record a successful compute call
   */
  recordSuccess(): void {
    console.log("[Circuit Breaker] Recording successful call");
    this.failureCount = 0;
    this.lastSuccessTime = Date.now();
    this.state = "CLOSED";
    this.nextRetryTime = undefined;
    this.maintenanceMode = false;
  }

  /**
   * Check if an error should be counted by the circuit breaker
   */
  private isBreakerCountable(error: any): boolean {
    const status = error?.httpStatus ?? error?.status;
    const code = error?.code;

    // Don't count user input errors (400s) as service failures
    if (status === 400 || code === "INVALID_INPUT") {
      return false;
    }

    return true;
  }

  /**
   * Record a failed compute call
   */
  recordFailure(error: Error): void {
    // Don't count user input errors
    if (!this.isBreakerCountable(error)) {
      console.log(
        "[Circuit Breaker] Ignoring user input error:",
        error.message
      );
      return;
    }
    console.log("[Circuit Breaker] Recording failed call:", error.message);
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // Check if error indicates maintenance mode
    const errorMessage = error.message.toLowerCase();
    if (
      errorMessage.includes("maintenance") ||
      errorMessage.includes("503") ||
      errorMessage.includes("service unavailable")
    ) {
      console.log("[Circuit Breaker] Detected maintenance mode");
      this.maintenanceMode = true;
      this.state = "OPEN";
      this.nextRetryTime = Date.now() + this.config.resetTimeout * 2; // Longer wait for maintenance
      return;
    }

    // Open circuit if failure threshold exceeded
    if (this.failureCount >= this.config.failureThreshold) {
      console.log(
        `[Circuit Breaker] Opening circuit after ${this.failureCount} failures`
      );
      this.state = "OPEN";
      this.nextRetryTime = Date.now() + this.config.resetTimeout;
    }
  }

  /**
   * Manually set maintenance mode (for external monitoring)
   */
  setMaintenanceMode(enabled: boolean): void {
    console.log(
      `[Circuit Breaker] ${enabled ? "Enabling" : "Disabling"} maintenance mode`
    );
    this.maintenanceMode = enabled;
    if (enabled) {
      this.state = "OPEN";
      this.nextRetryTime = Date.now() + this.config.resetTimeout;
    }
  }

  /**
   * Reset circuit breaker (for manual recovery)
   */
  reset(): void {
    console.log("[Circuit Breaker] Manually resetting circuit");
    this.state = "CLOSED";
    this.failureCount = 0;
    this.nextRetryTime = undefined;
    this.maintenanceMode = false;
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(): string {
    if (this.maintenanceMode) {
      return "0G Compute is currently under maintenance. Please try again later.";
    }

    switch (this.state) {
      case "CLOSED":
        return "Compute service is healthy and available.";

      case "OPEN":
        const retryIn = this.nextRetryTime
          ? Math.ceil((this.nextRetryTime - Date.now()) / 1000)
          : 0;
        return `Compute service is temporarily unavailable. Retry in ${retryIn}s.`;

      case "HALF_OPEN":
        return "Testing compute service availability...";

      default:
        return "Compute service status unknown.";
    }
  }

  /**
   * Get graceful degradation options
   */
  getGracefulOptions(): {
    fallbackAvailable: boolean;
    alternativeEndpoints: string[];
    offlineMode: boolean;
    retryEstimate: number;
  } {
    const now = Date.now();
    const retryEstimate = this.nextRetryTime
      ? Math.max(0, this.nextRetryTime - now)
      : 0;

    return {
      fallbackAvailable: false, // No fallback compute for now
      alternativeEndpoints: COMPUTE_CONFIG.endpoints.slice(1), // Other endpoints
      offlineMode: this.state === "OPEN" && retryEstimate > 5 * 60 * 1000, // If more than 5min wait
      retryEstimate,
    };
  }
}

// Global circuit breaker instance
export const computeCircuitBreaker = new ComputeCircuitBreaker();

/**
 * Enhanced compute call wrapper with circuit breaker
 */
export async function callComputeWithCircuitBreaker<T>(
  computeCall: () => Promise<T>,
  context: string = "compute"
): Promise<T> {
  if (!computeCircuitBreaker.canAttemptCall()) {
    const status = computeCircuitBreaker.getStatus();
    const message = computeCircuitBreaker.getStatusMessage();

    throw new Error(`${message} (Circuit: ${status.state})`);
  }

  try {
    console.log(`[Circuit Breaker] Attempting ${context} call`);
    const result = await computeCall();

    computeCircuitBreaker.recordSuccess();
    return result;
  } catch (error) {
    console.error(`[Circuit Breaker] ${context} call failed:`, error);

    if (error instanceof Error) {
      computeCircuitBreaker.recordFailure(error);
    }

    // Add circuit breaker context to error
    const status = computeCircuitBreaker.getStatus();
    const enhancedError = new Error(
      `${error instanceof Error ? error.message : String(error)} (Circuit: ${
        status.state
      }, Failures: ${status.failureCount})`
    );

    // Copy stack trace if available
    if (error instanceof Error && error.stack) {
      enhancedError.stack = error.stack;
    }

    throw enhancedError;
  }
}

export default computeCircuitBreaker;

/**
 * Standalone helper to check if an error should be counted by circuit breakers
 */
export function isBreakerCountable(err: any): boolean {
  const status = err?.httpStatus ?? err?.status;
  const code = err?.code;
  if (status === 400 || code === "INVALID_INPUT") return false; // user input
  return true;
}
