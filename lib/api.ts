import { supabase } from './supabase';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

let cachedToken: string | null = null;

export function setCachedToken(token: string | null) {
  cachedToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
}

/**
 * Base fetcher with zero-latency token attachment & automatic fallback.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token = cachedToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  if (!token && typeof window !== 'undefined') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
        setCachedToken(token);
      }
    } catch (e) {
      // Ignore session fetch error if unauthenticated
    }
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `API error: ${response.status}`);
  }

  return response.json();
}
