import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { getApiUrl } from "./config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let errorMessage = `${res.status}: ${text}`;
    try {
      const json = JSON.parse(text);
      if (json.message) {
        errorMessage = json.message;
      }
    } catch (e) {
      // Not JSON, use raw text
    }
    throw new Error(errorMessage);
  }
}

// Token cache to prevent race conditions
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let refreshPromise: Promise<string | null> | null = null;

async function getValidToken(): Promise<string | null> {
  const now = Date.now();
  const bufferTime = 60 * 1000; // 1 minute buffer before expiry
  
  // If token is still valid, return cached version
  if (cachedToken && tokenExpiresAt > now + bufferTime) {
    return cachedToken;
  }
  
  // If already refreshing, wait for that promise
  if (refreshPromise) {
    return refreshPromise;
  }
  
  // Start a new refresh
  refreshPromise = (async () => {
    try {
      // First try to get existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token && session.expires_at) {
        const expiresAt = session.expires_at * 1000;
        
        // If session is valid and not near expiry, use it
        if (expiresAt > now + bufferTime) {
          cachedToken = session.access_token;
          tokenExpiresAt = expiresAt;
          return cachedToken;
        }
        
        // Otherwise, refresh the session
        const { data: refreshData, error } = await supabase.auth.refreshSession();
        if (refreshData?.session?.access_token && !error) {
          cachedToken = refreshData.session.access_token;
          tokenExpiresAt = (refreshData.session.expires_at || 0) * 1000;
          return cachedToken;
        }
      }
      
      // No valid session
      cachedToken = null;
      tokenExpiresAt = 0;
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}

// Listen to auth state changes to update cache
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    cachedToken = session.access_token;
    tokenExpiresAt = (session.expires_at || 0) * 1000;
  } else {
    cachedToken = null;
    tokenExpiresAt = 0;
  }
});

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await getValidToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (error) {
    console.warn("[Auth] Error getting auth headers:", error);
  }
  return {};
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const fullUrl = getApiUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...authHeaders,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = await getAuthHeaders();
    const url = queryKey.join("/") as string;
    const fullUrl = getApiUrl(url);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: authHeaders,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes for fresh data
      gcTime: 1000 * 60 * 30, // 30 minutes cache retention
      retry: 2, // Retry up to 2 times for transient failures
      retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 3000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
