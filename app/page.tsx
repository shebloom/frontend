'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-10">
      
      {/* Desktop Container (Locks aspect ratio of combined mockup) */}
      <div className="h-full max-h-[850px] aspect-[1441/1024] flex md:shadow-2xl md:rounded-[40px] overflow-hidden bg-white">
        
        {/* LEFT SIDE (Hidden on mobile) */}
        <div className="hidden md:block h-full aspect-[984/1024] relative bg-[#F7F4FB] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/left_banner_full.jpg" 
            alt="SheBloom Features" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* RIGHT SIDE (Phone UI Mockup) */}
        <div className="w-full md:h-full md:aspect-[457/1024] relative overflow-hidden bg-[#FBE0E7] flex-1 md:flex-none">
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/right_banner_complete.png" 
              alt="Onboarding" 
              className="w-full h-full object-contain pointer-events-none select-none"
            />
            {/* Clickable zone for Create Account */}
            <button 
              onClick={() => router.push('/signup')}
              className="absolute top-[74.8%] left-[5.7%] w-[87.7%] h-[7.9%] rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-bloom-500/20 active:scale-[0.98] transition-transform"
              style={{ background: 'transparent' }}
              aria-label="Create Account"
            />
            {/* Clickable zone for Login */}
            <button 
              onClick={() => router.push('/login')}
              className="absolute top-[85.0%] left-[6.1%] w-[87.1%] h-[6.2%] rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-bloom-500/20 active:scale-[0.98] transition-transform"
              style={{ background: 'transparent' }}
              aria-label="Login"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
