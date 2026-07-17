'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#FBE0E7] md:bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-0 md:p-6 lg:p-10">
      
      {/* Desktop Container */}
      <div className="w-full h-full max-w-[1400px] flex md:rounded-[40px] overflow-hidden relative">
        
        {/* LEFT SIDE (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 relative bg-[#F7F4FB]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/left_banner_full.jpg" 
            alt="SheBloom Features" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE (Phone UI Mockup) */}
        <div className="w-full md:w-[450px] h-full flex items-center justify-center bg-[#FBE0E7] md:px-8 z-30">
          <div className="relative w-full max-w-[400px] aspect-[560/1024] md:shadow-2xl md:rounded-[40px] overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/dr_deepa_pink.png" 
              alt="Onboarding" 
              className="w-full h-full object-contain pointer-events-none select-none"
            />
            {/* Clickable zone for Create Account */}
            <button 
              onClick={() => router.push('/signup')}
              className="absolute top-[77.9%] left-[9.1%] w-[82.7%] h-[7.0%] rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-bloom-500/20 active:scale-[0.98] transition-transform"
              style={{ background: 'transparent' }}
              aria-label="Create Account"
            />
            {/* Clickable zone for Login */}
            <button 
              onClick={() => router.push('/login')}
              className="absolute top-[87.4%] left-[8.75%] w-[83.2%] h-[7.2%] rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-bloom-500/20 active:scale-[0.98] transition-transform"
              style={{ background: 'transparent' }}
              aria-label="Login"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
