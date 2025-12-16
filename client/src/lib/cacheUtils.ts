// Cache utility for static data with TTL
const CACHE_TTL = 1000 * 60 * 60; // 1 hour default

export function getCachedData<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;
    
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return data as T;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function clearCache(key: string): void {
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch {
    // ignore
  }
}
