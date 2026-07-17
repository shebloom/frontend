'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: any) => any;
        };
      };
    };
  }
}

import { API_URL } from '@/lib/api';

/**
 * Pure Google OAuth hook.
 *
 * Flow:
 *  1. Loads Google Identity Services script
 *  2. `signIn()` opens a Google consent popup
 *  3. Google returns an authorization code
 *  4. Code is sent to our backend (`POST /api/auth/google`)
 *  5. Backend exchanges code → ID token, finds/creates user, returns a magic-link hash
 *  6. Frontend calls `supabase.auth.verifyOtp()` with the hash → full session created
 */
export function useGoogleAuth() {
  const scriptLoadedRef = useRef(false);

  // Load the Google Identity Services script once
  useEffect(() => {
    if (scriptLoadedRef.current || typeof window === 'undefined') return;

    // Check if already loaded
    if (window.google?.accounts?.oauth2) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
    };
    document.head.appendChild(script);
  }, []);

  /**
   * Opens the Google sign-in popup and returns once the session is created.
   * Throws on error.
   */
  const signIn = useCallback(async (isLogin: boolean = false): Promise<void> => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Google Client ID is not configured');
    }

    // Wait for script to load (with timeout)
    let attempts = 0;
    while (!window.google?.accounts?.oauth2 && attempts < 50) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }

    if (!window.google?.accounts?.oauth2) {
      throw new Error('Failed to load Google sign-in. Please refresh and try again.');
    }

    // Step 1: Get authorization code via popup
    const code = await new Promise<string>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else if (response.code) {
            resolve(response.code);
          } else {
            reject(new Error('No authorization code received'));
          }
        },
        error_callback: (error: any) => {
          if (error.type === 'popup_closed') {
            reject(new Error('popup_closed_by_user'));
          } else {
            reject(new Error('Google sign-in popup error'));
          }
        },
      });

      client.requestCode();
    });

    // Step 2: Send code to our backend
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, isLogin }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Google authentication failed');
    }

    // Step 3: Use the magic-link token to create a Supabase session
    const { error: otpError } = await supabase.auth.verifyOtp({
      type: 'magiclink',
      token_hash: data.token_hash,
    });

    if (otpError) {
      throw new Error(otpError.message || 'Failed to create session');
    }

    // Session is now active — AuthProvider's onAuthStateChange will fire automatically
  }, []);

  return { signIn };
}
