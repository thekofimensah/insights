import { APIError, NetworkError, RateLimitError } from './errors';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: (attempt: number) => number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 5; 

// Exponential backoff with jitter
const DEFAULT_RETRY_DELAY = (attempt: number) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 40000; // 40 seconds
  
  // Calculate exponential backoff: 1s, 2s, 4s, 8s, etc.
  const expDelay = baseDelay * Math.pow(2, attempt);
  
  // Add random jitter (±20% of delay)
  const jitter = expDelay * (0.8 + Math.random() * 0.4);
  
  // Cap at maxDelay
  return Math.min(jitter, maxDelay);
};

export async function fetcher<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...fetchOptions.headers,
          'Cache-Control': 'public, max-age=300', // 5 minutes cache
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError();
        }
        throw new APIError(
          `API request failed: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof RateLimitError || attempt === retries) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay(attempt)));
    }
  }

  if (lastError instanceof APIError) {
    throw lastError;
  }
  if (lastError instanceof Error) {
    if (lastError.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'TIMEOUT');
    }
    throw new NetworkError(lastError.message);
  }
  throw new APIError('Unknown error occurred');
}