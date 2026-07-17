'use client';

import { useRouter } from 'next/navigation';
import { BloomLogo, GradientButton, AuthSidebar } from '@/components/shebloom';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 md:grid md:grid-cols-12 bg-lavender-100 overflow-hidden">
      
      {/* Left side: desktop banner */}
      <AuthSidebar />

      {/* Right side: Mobile view & Desktop Right column */}
      <div className="col-span-12 md:col-span-7 h-full flex flex-col relative overflow-hidden bg-lavender-100 md:shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex-1 overflow-y-auto w-full mx-auto relative custom-scrollbar flex flex-col px-6 py-10 md:p-12 md:justify-center">
          
          {/* Brand Header - Logo Only */}
          <div className="text-center flex flex-col items-center mt-2 md:mt-0">
            <BloomLogo size="xl" layout="vertical" showText={false} />
          </div>

          {/* Doctor Image Panel */}
          <div className="mt-8 mb-8 md:mb-10 flex justify-center w-full px-4">
            <div className="relative w-full max-w-[280px] h-[320px] md:h-[360px] flex items-end justify-center">
              {/* Abstract curved background behind doctor */}
              <div className="absolute bottom-0 w-full h-[220px] md:h-[260px] bg-indigo-50 rounded-t-[140px] rounded-b-3xl -z-10 shadow-sm" />
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dr_deepa_cutout.png"
                alt="Dr. Deepa Madhavan"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/dr_deepa_avatar.jpg";
                  target.className = "w-48 h-48 rounded-full object-cover shadow-lg mb-8 border-4 border-white";
                }}
                className="w-full h-auto object-contain z-10 scale-110 origin-bottom pb-4"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="w-full max-w-sm mx-auto space-y-3 mt-auto md:mt-0">
            <GradientButton
              size="lg"
              fullWidth
              onClick={() => router.push('/signup')}
            >
              Create Account
            </GradientButton>
            <button
              onClick={() => router.push('/login')}
              className="h-12 w-full rounded-full border-2 border-bloom-200 bg-white text-base font-bold text-bloom-700 transition-all hover:bg-bloom-50 active:scale-[0.98] shadow-sm"
            >
              Login
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium tracking-wide mt-2">
              Secure. Private. For You.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
