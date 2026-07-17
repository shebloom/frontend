import { supabase } from './supabase';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

/**
 * Base fetcher that automatically attaches the Supabase JWT.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
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
