import { ApiCategory } from '@/types/api';

// This file should only be imported in client components
// It provides a wrapper around fetch that logs API calls to the developer console

interface ApiCallOptions {
  apiName: string;
  apiCategory: ApiCategory;
  body?: any;
  stripeEndpoint?: string; // Optional: Display actual Stripe API endpoint in console
}

type LogFunction = (log: {
  apiName: string;
  apiCategory: ApiCategory;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  endpoint: string;
  requestPayload?: any;
  responseData?: any;
  statusCode: number;
  duration: number;
  error?: string;
}) => void;

// We'll set this function from the component that has access to the logger
let globalLogFunction: LogFunction | null = null;

export function setApiLogFunction(logFn: LogFunction) {
  globalLogFunction = logFn;
}

async function makeApiCall(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  endpoint: string,
  options: ApiCallOptions
): Promise<any> {
  const startTime = performance.now();
  const { apiName, apiCategory, body, stripeEndpoint } = options;

  // Parse method and endpoint from stripeEndpoint if provided (e.g., "POST /v1/customers/:id")
  let displayMethod = method;
  let displayEndpoint = stripeEndpoint || endpoint;

  if (stripeEndpoint) {
    const parts = stripeEndpoint.split(' ');
    if (parts.length === 2 && ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(parts[0])) {
      displayMethod = parts[0] as 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
      displayEndpoint = parts[1];
    }
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, fetchOptions);
    const duration = Math.round(performance.now() - startTime);
    const data = await response.json();

    // Log the API call if logger is available
    if (globalLogFunction) {
      globalLogFunction({
        apiName,
        apiCategory,
        method: displayMethod,
        endpoint: displayEndpoint,
        requestPayload: body,
        responseData: data,
        statusCode: response.status,
        duration,
        error: !response.ok ? data.error || 'Request failed' : undefined,
      });
    }

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log error if logger is available
    if (globalLogFunction) {
      globalLogFunction({
        apiName,
        apiCategory,
        method: displayMethod,
        endpoint: displayEndpoint,
        requestPayload: body,
        statusCode: 500,
        duration,
        error: errorMessage,
      });
    }

    throw error;
  }
}

export const apiClient = {
  get: (endpoint: string, options: ApiCallOptions) =>
    makeApiCall('GET', endpoint, options),

  post: (endpoint: string, options: ApiCallOptions) =>
    makeApiCall('POST', endpoint, options),

  patch: (endpoint: string, options: ApiCallOptions) =>
    makeApiCall('PATCH', endpoint, options),

  put: (endpoint: string, options: ApiCallOptions) =>
    makeApiCall('PUT', endpoint, options),

  delete: (endpoint: string, options: ApiCallOptions) =>
    makeApiCall('DELETE', endpoint, options),
};
