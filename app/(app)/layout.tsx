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
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-bloom-200/60 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative h-24 w-24 rounded-full bg-white shadow-bloom-card border border-bloom-100 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/logo_icon.png" 
                  alt="SheBloom Butterfly" 
                  className="w-16 h-16 object-contain" 
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
    <div className="fixed inset-0 bg-[#FBE0E7] md:bg-[#E5D5F0] overflow-hidden flex items-center justify-center">
      
      {/* Desktop Container */}
      <div className="w-full h-full max-w-[1400px] flex md:rounded-[40px] overflow-hidden relative">
        
        {/* Left side: desktop banner (Hidden on mobile) */}
        <AuthSidebar />

        {/* Right side: Mobile view & Desktop Phone mockup */}
        <div className="w-full md:w-[450px] h-full flex items-center justify-center bg-[#FBE0E7] md:px-8 z-30 ml-auto">
          <div className="relative w-full h-full md:max-w-[400px] md:h-[90%] md:my-auto md:shadow-2xl md:rounded-[40px] md:border-[6px] md:border-white/50 bg-white overflow-hidden flex flex-col">
            
            {/* Fake Phone Status Bar (Only on PC) */}
            <div className="hidden md:flex w-full h-10 justify-between items-center px-6 absolute top-0 left-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-800 tracking-tighter">9:41</span>
              <div className="flex items-center gap-1.5 text-slate-800">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21L15.6 16.2C14.6 15.45 13.35 15 12 15s-2.6.45-3.6 1.2L12 21z" opacity=".3"/><path d="M12 21L21 9C18.66 7.12 15.48 6 12 6 8.52 6 5.34 7.12 3 9l9 12z"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 22 1.33-21.4 1.33-20.67V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
              </div>
            </div>

            {/* Main scrollable app wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white pb-20 md:pt-10">
              <main className="flex-1 overflow-y-auto scrollbar-hide">
                {children}
              </main>
              <BottomNav className="absolute bottom-0 left-0 right-0 z-50" />
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
