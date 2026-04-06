/**
 * API Configuration
 * Centralized API base URL configuration using environment variables
 */

/**
 * Get the API base URL from environment variables
 * Falls back to http://localhost:8080 if not set
 */
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};

/**
 * Build a complete API URL by appending the endpoint to the base URL
 * @param endpoint - The API endpoint path (e.g., '/api/users' or 'api/users')
 * @returns Complete API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Export the base URL as a constant for convenience
export const API_BASE_URL = getApiBaseUrl();
