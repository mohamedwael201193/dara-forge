// =============================================================================
// API CLIENT TESTS
// =============================================================================
// Tests for type-safe API client with route validation

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiClient, type ApiClient } from "../client";

describe("API Client", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = createApiClient({
      baseUrl: "https://dara-api.onrender.com",
      retryConfig: {
        maxRetries: 1, // Reduce retries for faster tests
        baseDelay: 100,
      },
    });
  });

  describe("Type Safety", () => {
    it("should only accept valid route keys at compile time", async () => {
      // ✅ This compiles - valid route key
      const validCall = () => client.get("Health");

      // ❌ This should NOT compile - invalid route key
      // @ts-expect-error - Testing compile-time error
      const invalidCall = () => client.get("InvalidRoute");

      // ❌ This should NOT compile - raw path string
      // @ts-expect-error - Testing compile-time error
      const rawPathCall = () => client.get("/api/fake-endpoint");

      expect(validCall).toBeDefined();
      expect(invalidCall).toBeDefined(); // Only for test, would fail at compile
      expect(rawPathCall).toBeDefined(); // Only for test, would fail at compile
    });

    it("should infer correct response types", async () => {
      // Mock successful health response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          status: "healthy",
          timestamp: Date.now(),
        }),
      });

      const response = await client.get("Health");

      // TypeScript infers correct type
      expect(response.ok).toBe(true);
      // @ts-expect-error - Property doesn't exist on HealthResponse
      expect(response.nonExistentField).toBeUndefined();
    });
  });

  describe("Health Endpoint", () => {
    it("should successfully call health endpoint with mocked response", async () => {
      const mockResponse = {
        ok: true,
        status: "healthy",
        timestamp: Date.now(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await client.get("Health");

      expect(response.ok).toBe(true);
      expect(response.status).toBe("healthy");
      expect(response.timestamp).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/health"),
        expect.any(Object)
      );
    });

    it("should validate response schema", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }), // Valid minimal response
      });

      const response = await client.get("Health");
      expect(response.ok).toBe(true);
    });

    it("should throw on invalid response schema", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "structure" }), // Missing 'ok' field
      });

      await expect(client.get("Health")).rejects.toThrow();
    });
  });

  describe("Retry Logic", () => {
    it("should retry on 429 status", async () => {
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          return Promise.resolve({
            ok: false,
            status: 429,
            json: async () => ({ error: "Rate limited" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        });
      });

      const response = await client.get("Health");
      expect(attempts).toBe(2);
      expect(response.ok).toBe(true);
    });

    it("should retry on 503 status", async () => {
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          return Promise.resolve({
            ok: false,
            status: 503,
            json: async () => ({ error: "Service unavailable" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        });
      });

      const response = await client.get("Health");
      expect(attempts).toBe(2);
      expect(response.ok).toBe(true);
    });

    it("should not retry on 404 status", async () => {
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({ error: "Not found" }),
        });
      });

      // Should not throw, just return failed response
      const response = await client.get("Health", { skipValidation: true });
      expect(attempts).toBe(1); // No retries
    });

    it("should stop after max retries", async () => {
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: "Server error" }),
        });
      });

      await expect(
        client.get("Health", { skipValidation: true })
      ).resolves.toBeDefined();
      expect(attempts).toBe(2); // Initial + 1 retry (maxRetries: 1)
    });
  });

  describe("Request Methods", () => {
    it("should send GET requests", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await client.get("Health");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should send POST requests with body", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, answer: "test" }),
      });

      await client.post("ComputeRequest", { text: "test query" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ text: "test query" }),
        })
      );
    });

    it("should send PUT requests", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await client.put("PutStorage", { data: "test" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  describe("Query Parameters", () => {
    it("should append query parameters to URL", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await client.get("Health", {
        params: { test: "value", number: 123, bool: true },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("?test=value&number=123&bool=true"),
        expect.any(Object)
      );
    });
  });

  describe("Custom Headers", () => {
    it("should merge custom headers with defaults", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await client.get("Health", {
        headers: { Authorization: "Bearer token" },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          }),
        })
      );
    });
  });

  describe("Base URL Configuration", () => {
    it("should use custom base URL", async () => {
      const customClient = createApiClient({
        baseUrl: "https://custom-api.example.com",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await customClient.get("Health");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://custom-api.example.com/health",
        expect.any(Object)
      );
    });

    it("should use default base URL from env", () => {
      const defaultClient = createApiClient();
      // Should not throw
      expect(defaultClient).toBeDefined();
    });
  });

  describe("Compile-Time Route Validation", () => {
    it("should prevent using arbitrary endpoint strings", () => {
      // ✅ Only valid route keys compile
      const test4 = () => client.get("Health");
      const test5 = () => client.post("ComputeRequest", { text: "test" });

      expect(test4).toBeDefined();
      expect(test5).toBeDefined();

      // Note: Invalid route keys would fail at compile-time with TypeScript errors
      // Example compile errors:
      // client.get("NonExistentRoute") // TS Error: Argument of type '"NonExistentRoute"' is not assignable
      // client.get("/api/fake") // TS Error: Argument of type '"/api/fake"' is not assignable
    });
  });
});
