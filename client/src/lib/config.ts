import { Capacitor } from '@capacitor/core';
import { APP_URL } from './env-config';

export const APP_VERSION = '1.0.6';
export const APP_NAME = 'BíbliaFS';

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
