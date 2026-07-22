'use client';

import { useRouter } from 'next/navigation';
import { AuthSidebar } from '@/components/shebloom';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-0 sm:p-4 lg:p-10">
      
      {/* Container: Full screen on mobile/tablet, aspect ratio desktop mockup on lg+ */}
      <div className="w-full h-full max-w-[1240px] lg:aspect-[1441/980] flex shadow-xl lg:shadow-2xl sm:rounded-[32px] lg:rounded-[40px] overflow-hidden bg-white">
        
        {/* LEFT SIDE (Tall Brand Banner) - Shown only on desktop lg screens and above */}
        <AuthSidebar className="hidden lg:flex w-[68.3%]" />

        {/* RIGHT SIDE (Mobile & Tab main view / Desktop right screen) */}
        <div className="w-full lg:w-[31.7%] h-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] to-[#FCE7F3] flex flex-col justify-between pt-5 sm:pt-6 pb-6 px-6 sm:px-8 lg:py-8">
          
          {/* Subtle floating petals watermark in the background of the welcome screen */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
            {/* Petal 1 */}
            <svg viewBox="0 0 100 100" fill="#EC4899" className="absolute left-[8%] top-[12%] w-6 h-6 rotate-[15deg] opacity-[0.12]">
              <path d="M50,15 C65,35 80,45 80,65 C80,78 68,90 50,90 C32,90 20,78 20,65 C20,45 35,35 50,15 Z" />
            </svg>
            {/* Petal 2 */}
            <svg viewBox="0 0 100 100" fill="#EC4899" className="absolute right-[12%] top-[22%] w-8 h-8 rotate-[45deg] opacity-[0.1]">
              <path d="M50,15 C65,35 80,45 80,65 C80,78 68,90 50,90 C32,90 20,78 20,65 C20,45 35,35 50,15 Z" />
            </svg>
            {/* Petal 3 */}
            <svg viewBox="0 0 100 100" fill="#EC4899" className="absolute left-[18%] top-[42%] w-5 h-5 rotate-[-30deg] opacity-[0.08]">
              <path d="M50,15 C65,35 80,45 80,65 C80,78 68,90 50,90 C32,90 20,78 20,65 C20,45 35,35 50,15 Z" />
            </svg>
            {/* Petal 4 */}
            <svg viewBox="0 0 100 100" fill="#EC4899" className="absolute right-[22%] top-[58%] w-7 h-7 rotate-[110deg] opacity-[0.1]">
              <path d="M50,15 C65,35 80,45 80,65 C80,78 68,90 50,90 C32,90 20,78 20,65 C20,45 35,35 50,15 Z" />
            </svg>
            {/* Petal 5 */}
            <svg viewBox="0 0 100 100" fill="#EC4899" className="absolute left-[12%] bottom-[25%] w-6 h-6 rotate-[65deg] opacity-[0.12]">
              <path d="M50,15 C65,35 80,45 80,65 C80,78 68,90 50,90 C32,90 20,78 20,65 C20,45 35,35 50,15 Z" />
            </svg>
          </div>

          {/* Top Logo and Header (Welcome to SheBloom) */}
          <div className="w-full flex flex-col items-center text-center mt-1 sm:mt-2 lg:mt-3 relative z-10 shrink-0">
            <span className="text-[11px] sm:text-[12px] font-bold text-[#A855F7] uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
              Welcome to
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo_no_tagline.png" 
              alt="SheBloom Logo" 
              className="w-44 sm:w-52 lg:w-48 h-auto object-contain" 
            />
            <p className="text-[12.5px] sm:text-[14px] font-bold text-slate-600 mt-2 sm:mt-2.5 max-w-[240px] leading-[1.35] font-sans">
              Your Journey to Better<br />Health Starts Here
            </p>
          </div>

          {/* Center Doctor Image (Flush against the button with zero gap) */}
          <div className="flex-1 flex items-end justify-center w-full px-2 relative z-10 mt-2 mb-0 pb-0 min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/dr_deepa_cutout.png" 
              alt="Dr. Deepa" 
              className="h-full w-auto max-w-full max-h-[480px] sm:max-h-[600px] lg:max-h-[420px] object-contain object-bottom relative block pb-0 mb-0 transition-all duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/dr_deepa_avatar_pink.jpg";
              }}
            />
          </div>

          {/* Bottom Action Button Section & Footer (Directly attached to doctor image) */}
          <div className="w-full px-1 sm:px-2 pb-1 pt-0 mt-0 relative z-20 shrink-0">
            <button 
              onClick={() => router.push('/login')}
              className="w-full h-14 sm:h-16 lg:h-13 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-extrabold rounded-full text-[16px] sm:text-[17px] lg:text-[15px] shadow-[0_8px_20px_-6px_rgba(91,33,182,0.4)] flex items-center justify-center transition-all active:scale-[0.97]"
              aria-label="Start Your Wellness"
            >
              Start Your Wellness
            </button>
            <p className="text-center text-[10.5px] sm:text-[11px] text-slate-400 font-bold tracking-wide mt-3 sm:mt-4 block">
              Secure. Private. For You.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
