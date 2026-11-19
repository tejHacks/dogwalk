/**
 * Tiny client for the Laravel API (Sanctum personal access tokens).
 * Set EXPO_PUBLIC_API_URL (e.g. https://api.dogwalk.ng/api) to switch the app
 * from demo mode to the real backend. Errors come back as AuthError so the
 * screens can show them next to the right field.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AuthError } from '@/data/types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
export const apiConfigured = API_URL.length > 0;

const TOKEN_KEY = 'dogwalk-token';
let token: string | null = null;

export async function setToken(t: string | null) {
  token = t;
  if (Platform.OS === 'web') return;
  if (t) await SecureStore.setItemAsync(TOKEN_KEY, t);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function loadToken() {
  if (Platform.OS !== 'web') token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token;
}

/** Laravel validation errors look like { message, errors: { field: [msg] } }. */
export async function api<T = unknown>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : null) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AuthError("Can't reach DogWalk. Check your internet connection and try again.");
  }
  const data = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
  if (!res.ok) {
    const [field, msgs] = Object.entries(data.errors ?? {})[0] ?? [];
    throw new AuthError(msgs?.[0] ?? data.message ?? 'Something went wrong. Please try again.', field as AuthError['field']);
  }
  return data as T;
}
