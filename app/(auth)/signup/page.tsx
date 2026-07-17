'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BloomLogo, GradientButton } from '@/components/shebloom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

export default function SignupPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Friendly Client-Side Validations
    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      setError("Please write your full name (first and last name) so our community and care team know how to address you!");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("This doesn't look like a valid email address. Double-check for typos like missing '@' or wrong ending!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Your password is a bit too short! It needs to be at least 6 characters long to keep your wellness dashboard safe.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) throw signUpError;

      // If Supabase returned a valid session (email confirmation disabled), sync profile
      if (data.session) {
        await apiFetch('/auth/sync-profile', {
          method: 'POST',
          body: JSON.stringify({ full_name: fullName }),
        });
        await refreshProfile();
        router.push('/onboarding');
      } else {
        // Email confirmation is required — show a message
        setShowConfirmation(true);
      }
    } catch (err: any) {
      let friendlyError = 'Oops, something went wrong on our end. Please try again in a moment.';
      const msg = err.message || '';
      
      if (msg.includes('already registered') || msg.includes('already exists')) {
        friendlyError = 'An account with this email already exists. Try logging in instead!';
      } else if (msg.includes('Password should be at least')) {
        friendlyError = 'Your password is a bit too short. It needs to be at least 6 characters long.';
      } else if (msg.includes('rate limit')) {
        friendlyError = 'Whoops! You\'re moving too fast. Please wait a minute before trying again.';
      } else if (msg) {
        friendlyError = msg;
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-lavender-100">
      <div className="mx-auto flex w-full max-w-[414px] flex-col bg-lavender-100 px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="mb-10 text-center flex flex-col items-center">
          <BloomLogo size="lg" layout="vertical" className="mb-2" />
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500">Join SheBloom to start your wellness journey</p>
        </div>

        {showConfirmation ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Check your email!</h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-[300px]">
              We've sent a confirmation link to <strong className="text-slate-700">{email}</strong>. Please click the link to verify your account, then come back and log in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-bloom-gradient px-8 text-base font-semibold text-white shadow-bloom-btn transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Go to Login
            </Link>
          </div>
        ) : (
        <>
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm leading-relaxed text-red-600 border border-red-100 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 w-full rounded-2xl border-0 bg-white px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-bloom-300"
              placeholder="Sara Ahmed"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border-0 bg-white px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-bloom-300"
              placeholder="sara@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-2xl border-0 bg-white pl-4 pr-12 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-bloom-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <GradientButton type="submit" size="lg" fullWidth className="mt-4" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </GradientButton>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-bloom-100 lg:w-1/4"></span>
          <span className="text-xs text-center text-slate-500 uppercase">Or continue with</span>
          <span className="w-1/5 border-b border-bloom-100 lg:w-1/4"></span>
        </div>

        <button
          type="button"
          onClick={async () => {
            setError(null);
            try {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/onboarding`,
                },
              });
              if (error) throw error;
            } catch (err: any) {
              setError(err.message || 'Google authentication failed');
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border-2 border-bloom-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-bloom-50 active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-bloom-600 hover:text-bloom-700">
            Login
          </Link>
        </p>
        </>
        )}
      </div>
    </div>
  );
}
