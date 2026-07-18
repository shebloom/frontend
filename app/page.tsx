'use client';

import { useRouter } from 'next/navigation';
import { AuthSidebar } from '@/components/shebloom';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-10">
      
      {/* Desktop Container (Locks aspect ratio of combined mockup on PC) */}
      <div className="w-full h-full max-w-[1240px] md:aspect-[1441/980] flex md:shadow-2xl md:rounded-[40px] overflow-hidden bg-white">
        
        {/* LEFT SIDE (Tall Brand Banner) */}
        <AuthSidebar className="w-[68.3%]" />

        {/* RIGHT SIDE (Mockup welcome screen exactly matching user shared design) */}
        <div className="w-full md:w-[31.7%] h-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] to-[#FCE7F3] flex flex-col justify-between py-8 px-7">
          
          {/* Subtle floating petals watermark in the background of the welcome screen */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none select-none">
            {/* We can use a clean background pattern or let the soft gradient handle it */}
          </div>

          {/* Top Logo and Header (Welcome to SheBloom) */}
          <div className="w-full flex flex-col items-center text-center mt-3 relative z-10">
            <span className="text-[11px] font-bold text-[#A855F7] uppercase tracking-[0.2em] mb-2">
              Welcome to
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo_no_tagline.png" 
              alt="SheBloom Logo" 
              className="w-48 h-auto object-contain" 
            />
            <p className="text-[12.5px] font-bold text-slate-600 mt-3 max-w-[210px] leading-[1.35] font-sans">
              Your Journey to Better<br />Health Starts Here
            </p>
          </div>

          {/* Center Doctor Image (Framed directly on the soft pink background with NO circle behind her) */}
          <div className="flex-1 flex items-end justify-center w-full px-2 relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/dr_deepa_cutout.png" 
              alt="Dr. Deepa" 
              className="w-full max-w-[290px] md:max-w-[320px] h-auto object-contain scale-115 origin-bottom pb-1 relative"
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
              className="w-full h-13 bg-[#5b21b6] text-white font-extrabold rounded-full text-[14px] md:text-[15px] shadow-[0_8px_20px_-6px_rgba(91,33,182,0.4)] flex items-center justify-center transition-all active:scale-[0.97]"
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
