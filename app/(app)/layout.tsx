'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BottomNav, BloomLogo } from '@/components/shebloom';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';

const loadingMessages = [
  'Blooming into your wellness journey…',
  'Nurturing your sacred feminine energy…',
  'Your health story is unfolding…',
  'Embracing every phase of you…',
  'Awakening your inner balance…',
  'Tending to your body with care…',
  'You are whole, worthy & radiant…',
  'Your wellness space is ready…',
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const isSignupFlow = 
        typeof window !== 'undefined' && 
        (window.location.pathname === '/onboarding' || window.location.pathname === '/signup');
        
      if (!profile && !isSignupFlow) {
        router.replace('/login');
      }
    }
  }, [isLoading, profile, router]);

  const isSignupFlow = 
    typeof window !== 'undefined' && 
    (window.location.pathname === '/onboarding' || window.location.pathname === '/signup');

  const [msgIdx, setMsgIdx] = useState(0);

  // Set random message index client-side only to avoid SSR hydration mismatch
  useEffect(() => {
    setMsgIdx(Math.floor(Math.random() * loadingMessages.length));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lavender-100 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6">
          {/* Pulsing logo */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-bloom-200/60 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative h-24 w-24 rounded-full bg-white shadow-bloom-card border border-bloom-100 flex items-center justify-center overflow-hidden">
              <div className="relative w-16 h-12 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/logo.png" 
                  alt="SheBloom Butterfly" 
                  className="w-24 max-w-none h-auto object-contain -translate-y-[10px]" 
                />
              </div>
            </div>
          </div>
          {/* Rotating spiritual message */}
          <p className="text-sm font-semibold text-bloom-600 text-center max-w-[220px] leading-relaxed italic">
            {loadingMessages[msgIdx]}
          </p>
          {/* Subtle progress dots */}
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-bloom-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile && !isSignupFlow) {
    return null;
  }

  return (
    <div className="fixed inset-0 md:grid md:grid-cols-12 bg-lavender-100 overflow-hidden">
      {/* Left side: desktop banner */}
      <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-[#FFF5F5] to-[#FFEAEA] p-8 flex-col justify-between relative overflow-hidden h-full border-r border-bloom-100/30">
        {/* Decorative petals / glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bloom-100/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-bloom-600 to-petal-600 bg-clip-text text-transparent tracking-tight">SheBloom</span>
            <span className="text-[10px] font-bold text-bloom-500 uppercase tracking-widest mt-0.5">Every Woman. Every Stage. Every Day.</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">Your Complete<br />Women's Health<br />Companion</h2>
          </div>

          {/* Bullet features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-bloom-100 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-bloom-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Expert Gynec Care</h4>
                <p className="text-xs text-slate-400">Consult with top gynecologists & IVF specialists</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-petal-100 flex items-center justify-center shrink-0">
                <Stethoscope className="h-5 w-5 text-petal-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Unlimited Support</h4>
                <p className="text-xs text-slate-400">Chat anytime with our dedicated care team</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-sm">🧘</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Wellness & Yoga</h4>
                <p className="text-xs text-slate-400">Self-paced sessions for your mind and body</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-sm">📅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Track & Understand</h4>
                <p className="text-xs text-slate-400">Track cycles, symptoms & more</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Privacy First</h4>
                <p className="text-xs text-slate-400">Your data is safe, secure & confidential</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom illustration */}
        <div className="relative mt-auto pt-6 z-10 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/woman_with_flowers.png" 
            alt="Illustration" 
            className="w-full max-w-[220px] object-contain drop-shadow-md"
          />
          <div className="text-center mt-3">
            <p className="text-[10px] font-bold text-bloom-600 uppercase tracking-wider">Trusted by Thousands of Women Across GCC</p>
            <div className="flex justify-center gap-0.5 mt-1 text-amber-400 text-sm">★★★★★ <span className="text-slate-500 font-bold text-[10px] ml-1">4.8</span></div>
          </div>
        </div>
      </div>

      {/* Right side: App contents */}
      <div className="col-span-12 md:col-span-7 flex flex-col h-full overflow-hidden relative bg-lavender-100 pb-20">
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
        <BottomNav className="absolute bottom-0 left-0 right-0 z-50" />
      </div>
    </div>
  );
}
