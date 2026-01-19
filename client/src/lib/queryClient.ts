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

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // Try to get current session first
    let { data: { session } } = await supabase.auth.getSession();
    
    // If no session or token is close to expiry, try to refresh
    if (session?.expires_at) {
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      // If token expires in less than 5 minutes, refresh it
      if (expiresAt - now < fiveMinutes) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData?.session) {
          session = refreshData.session;
        }
      }
    }
    
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
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
