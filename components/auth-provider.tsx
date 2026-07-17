'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';

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
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (u?: User) => {
    const currentUser = u || user;
    if (!currentUser) return;
    try {
      const data = await apiFetch('/auth/me');
      setProfile(data.user);
    } catch (err: any) {
      // If profile doesn't exist in our DB yet
      if (err.message === 'User not found' || err.status === 404 || String(err).includes('404')) {
        const isSignupFlow = 
          typeof window !== 'undefined' && 
          (window.location.pathname === '/onboarding' || window.location.pathname === '/signup');

        if (isSignupFlow) {
          try {
            const syncData = await apiFetch('/auth/sync-profile', {
              method: 'POST',
              body: JSON.stringify({ 
                full_name: currentUser.user_metadata?.full_name || null 
              }),
            });
            setProfile(syncData.user);
          } catch (syncErr) {
            console.error('Failed to sync new profile', syncErr);
          }
        } else {
          console.warn('User authenticated but profile not found in database. Signing out.');
          try {
            await supabase.auth.signOut();
          } catch (signOutErr) {
            console.error('Sign out error:', signOutErr);
          }
          setProfile(null);
          setUser(null);
          setSession(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login?error=no_user';
          }
        }
      } else {
        console.error('Failed to fetch profile', err);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile(session.user);
      else setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile(session.user).finally(() => setIsLoading(false));
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
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
