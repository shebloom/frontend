'use client';

import { useRouter } from 'next/navigation';
import { BloomLogo, GradientButton } from '@/components/shebloom';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-0 md:p-6 lg:p-10">
      
      {/* Desktop Container */}
      <div className="w-full h-full max-w-[1400px] flex md:rounded-[40px] overflow-hidden relative">
        
        {/* LEFT SIDE (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 relative bg-[#EADCF6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/left_banner_full.jpg" 
            alt="SheBloom Features" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE (Phone UI) */}
        <div className="w-full md:w-[400px] bg-white h-full md:h-[90%] md:my-auto md:mr-8 md:rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col z-30 border-[6px] border-white/50 bg-clip-padding">
          
          {/* Fake Phone Status Bar */}
          <div className="w-full h-12 flex justify-between items-center px-6 absolute top-0 left-0 z-50">
            <span className="text-xs font-bold text-slate-800 tracking-tighter">9:41</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21L15.6 16.2C14.6 15.45 13.35 15 12 15s-2.6.45-3.6 1.2L12 21z" opacity=".3"/><path d="M12 21L21 9C18.66 7.12 15.48 6 12 6 8.52 6 5.34 7.12 3 9l9 12z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 22 1.33-21.4 1.33-20.67V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
            </div>
          </div>

          {/* Dr Deepa Image with gradient fade */}
          <div className="relative w-full flex-1 flex flex-col justify-end min-h-0 bg-[#f7dbe4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/dr_deepa_pink_cropped.png" 
              alt="Dr. Deepa" 
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/dr_deepa_pink.png";
              }}
            />
            {/* White gradient fade to blend image into buttons section */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fcf7f9] via-[#fcf7f9]/80 to-transparent" />
          </div>

          {/* Buttons Section */}
          <div className="w-full bg-[#fcf7f9] px-8 pb-12 pt-4 relative z-20 space-y-4">
            <button
              onClick={() => router.push('/signup')}
              className="w-full h-14 bg-[#5b21b6] text-white font-bold rounded-full text-base shadow-[0_8px_20px_-6px_rgba(91,33,182,0.5)] transition-transform active:scale-95"
            >
              Create Account
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full h-14 bg-white border-2 border-[#5b21b6] text-[#5b21b6] font-bold rounded-full text-base transition-transform active:scale-95"
            >
              Login
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
