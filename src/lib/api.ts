// src/lib/api.ts - API helper for frontend
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://dara-api.onrender.com");

export function apiUrl(endpoint: string): string {
  // Remove ALL leading slashes and add single slash
  const path = endpoint.replace(/^\/+/, "");
  const base = API_BASE.replace(/\/+$/, ""); // Remove trailing slashes from base
  return `${base}/${path}`;
}

// Helper for fetch calls with proper error handling
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = apiUrl(endpoint);

  // Add default headers
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Merge headers
  const headers = { ...defaultHeaders, ...options.headers };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

// Convenience methods
export const api = {
  get: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data: any, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data: any, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};
