import { BloomLogo } from './logo';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export function AuthSidebar() {
  return (
    <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-[#FFF5F5] to-[#FCE7F3] p-8 pb-0 pr-0 flex-col relative overflow-hidden h-full border-r border-bloom-100/30">
      
      <div className="relative z-10 flex flex-col items-center mt-4">
        <BloomLogo size="lg" layout="vertical" />
        <span className="text-[11px] font-medium text-slate-800 mt-2">
          Every Woman. Every Stage. Every Day.
        </span>
      </div>

      <div className="relative z-10 mt-10 pr-8">
        <h2 className="text-[17px] font-medium text-slate-700 leading-tight">
          Your Complete
        </h2>
        <h1 className="text-[28px] font-bold text-bloom-800 leading-[1.1] mt-1">
          Women's Health<br />Companion
        </h1>
      </div>

      {/* Feature Pills */}
      <div className="relative z-10 mt-8 space-y-3 pr-8 w-[95%]">
        
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-[24px] p-2.5 pr-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/40">
          <div className="h-12 w-12 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0 shadow-inner">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-800">Expert Gynec Care</h4>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">Consult with top gynecologists<br/>& IVF specialists</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-[24px] p-2.5 pr-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/40">
          <div className="h-12 w-12 rounded-full bg-[#ec4899] flex items-center justify-center shrink-0 shadow-inner">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-800">Unlimited Support</h4>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">Chat anytime with our care team</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-[24px] p-2.5 pr-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/40">
          <div className="h-12 w-12 rounded-full bg-[#5eead4] flex items-center justify-center shrink-0 shadow-inner text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-800">Wellness & Yoga</h4>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">Self-paced sessions for<br/>your mind and body</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-[24px] p-2.5 pr-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/40">
          <div className="h-12 w-12 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0 shadow-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-800">Track & Understand</h4>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">Track cycles, symptoms<br/>& more</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-[24px] p-2.5 pr-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/40">
          <div className="h-12 w-12 rounded-full bg-[#f472b6] flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-800">Privacy First</h4>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">Your data is safe, secure<br/>& confidential</p>
          </div>
        </div>
      </div>

      {/* Bottom illustration */}
      <div className="relative mt-auto pt-6 z-0 flex flex-col items-center w-full min-h-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/images/woman_with_flowers.png" 
          alt="Illustration" 
          className="absolute bottom-0 left-0 right-0 w-full object-cover mix-blend-multiply opacity-95"
          style={{ objectPosition: 'bottom center', height: '120%' }}
        />
        
        {/* Trusted Badge floating at bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-white/50 flex items-center justify-between z-20">
          <div>
            <p className="text-[11px] font-medium text-slate-700">Trusted by Thousands<br/>of Women Across GCC</p>
            <div className="flex items-center gap-1 mt-1 text-[#f472b6]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="text-[13px] font-bold text-bloom-700 ml-1">4.8</span>
            </div>
          </div>
          
          {/* Avatar bubbles */}
          <div className="flex -space-x-3">
            <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden z-30 shadow-md">
              <img src="/images/dr_deepa_avatar.jpg" alt="User" className="h-full w-full object-cover" />
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden z-20 shadow-md">
              <img src="/images/dr_deepa_avatar.jpg" alt="User" className="h-full w-full object-cover grayscale opacity-90" />
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden z-10 shadow-md bg-bloom-100 flex items-center justify-center">
              <img src="/images/dr_deepa_avatar.jpg" alt="User" className="h-full w-full object-cover sepia opacity-80" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
