/**
 * Robust API client with retry logic, timeouts, and structured error handling
 * for external API calls (ABíbliaDigital, Stripe, etc.)
 */

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: string;
  fromCache?: boolean;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions & { timeoutMs: number }
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new ApiError(
        `Request timeout after ${options.timeoutMs}ms`,
        408,
        true
      );
    }
    throw error;
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Robust fetch with retry logic and exponential backoff
 */
export async function robustFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = 10000, // 10 seconds default
    retries = 3,
    retryDelay = 1000, // 1 second base delay
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetchWithTimeout(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body,
        timeoutMs: timeout,
      });

      // Handle HTTP errors
      if (!response.ok) {
        const isRetryable = response.status >= 500 || response.status === 429;
        const errorText = await response.text().catch(() => "Unknown error");
        
        throw new ApiError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          isRetryable
        );
      }

      // Parse JSON response
      const data = await response.json();
      
      // Check for API-specific error formats
      if (data.error || data.err) {
        throw new ApiError(
          data.error || data.err || "API returned error",
          response.status,
          false
        );
      }

      return { data, status: "success" };
    } catch (error: any) {
      lastError = error;
      attempt++;

      // Log attempt
      console.warn(
        `API request failed (attempt ${attempt}/${retries + 1}): ${url}`,
        error.message
      );

      // Determine if we should retry
      const shouldRetry =
        attempt <= retries &&
        (error instanceof ApiError ? error.retryable : true) &&
        error.name !== "AbortError"; // Don't retry timeouts

      if (!shouldRetry) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All retries exhausted
  const errorMessage =
    lastError instanceof ApiError
      ? lastError.message
      : `Failed to fetch from ${url}: ${lastError?.message || "Unknown error"}`;

  return {
    error: errorMessage,
    status: "failed",
  };
}

/**
 * Fetch with fallback - try primary source, then fallback
 */
export async function fetchWithFallback<T>(
  primaryUrl: string,
  fallbackFn: () => T | Promise<T>,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const result = await robustFetch<T>(primaryUrl, options);

  if (result.error) {
    console.warn(`Primary API failed, using fallback: ${result.error}`);
    try {
      const fallbackData = await Promise.resolve(fallbackFn());
      return {
        data: fallbackData,
        status: "success",
        fromCache: true,
      };
    } catch (fallbackError: any) {
      console.error("Fallback also failed:", fallbackError.message);
      return {
        error: "Both primary and fallback sources failed",
        status: "failed",
      };
    }
  }

  return result;
}
