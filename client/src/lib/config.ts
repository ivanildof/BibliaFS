import { Capacitor } from '@capacitor/core';

function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export const isNative = isNativePlatform();

const PRODUCTION_URL = 'https://bibliafs.com.br';

export function getApiUrl(path: string): string {
  if (isNative) {
    const base = import.meta.env.VITE_APP_URL || PRODUCTION_URL;
    if (path.startsWith('/')) {
      return `${base}${path}`;
    }
    return `${base}/${path}`;
  }
  return path;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? getApiUrl(input) : input;
  return fetch(url, init);
}
