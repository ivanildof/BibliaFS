import { Capacitor } from '@capacitor/core';
import { APP_URL } from './env-config';

function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export const isNative = isNativePlatform();

export function getApiUrl(path: string): string {
  if (isNative) {
    if (path.startsWith('/')) {
      return `${APP_URL}${path}`;
    }
    return `${APP_URL}/${path}`;
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
