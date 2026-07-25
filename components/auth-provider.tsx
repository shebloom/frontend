'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { apiFetch, setCachedToken } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'patient' | 'doctor' | 'admin';
  weight_kg: number | null;
  height_cm: number | null;
  blood_group: string | null;
  rejection_count: number;
  doctor_application_status: 'pending' | 'approved' | 'rejected' | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: (u?: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore cached profile from localStorage on client mount after hydration
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('shebloom_cached_profile');
      if (cached) {
        try {
          setProfile(JSON.parse(cached));
          setIsLoading(false);
        } catch (e) {}
      }
    }
  }, []);

  const saveProfileCache = (p: UserProfile | null) => {
    setProfile(p);
    if (typeof window !== 'undefined') {
      if (p) {
        localStorage.setItem('shebloom_cached_profile', JSON.stringify(p));
      } else {
        localStorage.removeItem('shebloom_cached_profile');
      }
    }
  };

  const refreshProfile = async (u?: User) => {
    const currentUser = u || user;
    if (!currentUser) return;
    try {
      const data = await apiFetch('/auth/me');
      saveProfileCache(data.user);
    } catch (err: any) {
      if (err.message === 'User not found' || err.status === 404 || String(err).includes('404')) {
        try {
          const syncData = await apiFetch('/auth/sync-profile', {
            method: 'POST',
            body: JSON.stringify({ 
              full_name: currentUser.user_metadata?.full_name || null 
            }),
          });
          saveProfileCache(syncData.user);
          
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.location.href = '/onboarding';
          }
        } catch (syncErr) {
          console.error('Failed to auto-sync profile', syncErr);
          try {
            await supabase.auth.signOut();
          } catch (signOutErr) {
            console.error('Sign out error:', signOutErr);
          }
          saveProfileCache(null);
          setUser(null);
          setSession(null);
          setCachedToken(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login?error=sync_failed';
          }
        }
      } else {
        console.error('Failed to fetch profile', err);
      }
    }
  };

  useEffect(() => {
    const syncToken = (s: Session | null) => {
      setCachedToken(s?.access_token || null);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      syncToken(session);
      if (session?.user) {
        refreshProfile(session.user).finally(() => setIsLoading(false));
      } else {
        saveProfileCache(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      syncToken(session);
      if (session?.user) {
        refreshProfile(session.user);
      } else {
        saveProfileCache(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    saveProfileCache(null);
    setCachedToken(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
