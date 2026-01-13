import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const API_BASE_URL = isNative 
  ? (import.meta.env.VITE_APP_URL || 'https://bibliafs.com.br')
  : '';

export function getApiUrl(path: string): string {
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? getApiUrl(input) : input;
  return fetch(url, init);
}

export { isNative };
