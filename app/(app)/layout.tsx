'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BottomNav, BloomLogo, AuthSidebar } from '@/components/shebloom';

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
          <div className="relative h-20 w-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-bloom-200/60 animate-ping" style={{ animationDuration: '2s' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo_icon.png" 
              alt="SheBloom Butterfly" 
              className="relative w-20 h-20 object-contain z-10" 
            />
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
    <div className="fixed inset-0 bg-white overflow-hidden flex items-center justify-center">
      
      {/* Desktop Container (Split 50/50 on PC) */}
      <div className="w-full h-full flex flex-col md:flex-row relative">
        
        {/* Left side: desktop banner (Hidden on mobile) */}
        <AuthSidebar className="md:w-1/2" />

        {/* Right side: Mobile view & Desktop split (50%) app view */}
        <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden relative bg-white pb-20">
          <main className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </main>
          <BottomNav className="absolute bottom-0 left-0 right-0 z-50" />
        </div>

      </div>
    </div>
  );
}
