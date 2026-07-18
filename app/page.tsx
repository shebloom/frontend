'use client';

import { useRouter } from 'next/navigation';
import { AuthSidebar } from '@/components/shebloom';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-10">
      
      {/* Desktop Container (Locks aspect ratio of combined mockup on PC) */}
      <div className="w-full h-full max-w-[1240px] md:aspect-[1441/980] flex shadow-xl md:shadow-2xl rounded-[32px] md:rounded-[40px] overflow-hidden bg-white">
        
        {/* LEFT SIDE (Tall Brand Banner) */}
        <AuthSidebar className="w-[68.3%]" />

        {/* RIGHT SIDE (Mockup welcome screen exactly matching user shared design) */}
        <div className="w-full md:w-[31.7%] h-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] to-[#FCE7F3] flex flex-col justify-between pt-5 pb-6 px-7 md:py-8">
          
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
          <div className="w-full flex flex-col items-center text-center mt-0.5 md:mt-3 relative z-10">
            <span className="text-[11px] font-bold text-[#A855F7] uppercase tracking-[0.2em] mb-2">
              Welcome to
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo_no_tagline.png" 
              alt="SheBloom Logo" 
              className="w-48 h-auto object-contain" 
            />
            <p className="text-[12.5px] font-bold text-slate-600 mt-2 md:mt-3 max-w-[210px] leading-[1.35] font-sans">
              Your Journey to Better<br />Health Starts Here
            </p>
          </div>

          {/* Center Doctor Image (Framed directly on the soft pink background with NO circle behind her) */}
          <div className="flex-1 flex items-end justify-center w-full px-2 relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/dr_deepa_cutout.png" 
              alt="Dr. Deepa" 
              className="w-full max-w-[315px] md:max-w-[320px] h-auto object-contain scale-[1.18] md:scale-115 origin-bottom pb-1 relative"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/dr_deepa_avatar_pink.jpg";
                target.className = "w-44 h-44 rounded-full object-cover shadow-md mb-8 border-4 border-white z-10 relative";
              }}
            />
          </div>

          {/* Bottom Action Button Section & Footer */}
          <div className="w-full px-2 pb-1 pt-2 relative z-20">
            <button 
              onClick={() => router.push('/login')}
              className="w-full h-15 md:h-13 bg-[#5b21b6] text-white font-extrabold rounded-full text-[16px] md:text-[15px] shadow-[0_8px_20px_-6px_rgba(91,33,182,0.4)] flex items-center justify-center transition-all active:scale-[0.97]"
              aria-label="Start Your Wellness"
            >
              Start Your Wellness
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold tracking-wide mt-4.5 block">
              Secure. Private. For You.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
