'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-10">
      
      {/* Desktop Container (Locks aspect ratio of combined mockup) */}
      <div className="w-full max-w-[1200px] aspect-[1441/1024] flex md:shadow-2xl md:rounded-[40px] overflow-hidden bg-white">
        
        {/* LEFT SIDE (Hidden on mobile) */}
        <div className="hidden md:block w-[68.3%] h-full relative bg-[#F7F4FB] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/left_banner_full.jpg" 
            alt="SheBloom Features" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* RIGHT SIDE (Phone UI Mockup) */}
        <div className="w-full md:w-[31.7%] h-full relative overflow-hidden bg-[#FBE0E7]">
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/right_banner_complete.png" 
              alt="Onboarding" 
              className="w-full h-full object-contain pointer-events-none select-none"
            />
            {/* Cover block to hide baked buttons and show a single action button */}
            <div className="absolute top-[74.0%] bottom-0 left-0 right-0 bg-[#fefefe] z-20 flex flex-col items-center justify-center px-8 pb-4">
              <button 
                onClick={() => router.push('/signup')}
                className="w-[87.7%] h-14 bg-[#5b21b6] text-white font-extrabold rounded-full text-[14px] md:text-[15px] shadow-[0_8px_20px_-6px_rgba(91,33,182,0.5)] flex items-center justify-center transition-all active:scale-[0.97]"
                aria-label="Start Your Healing"
              >
                Start Your Healing
              </button>
              <p className="text-center text-[10px] text-slate-400 font-medium tracking-wide mt-3">
                Secure. Private. For You.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
