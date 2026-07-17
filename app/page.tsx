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
        <div className="hidden md:flex flex-1 relative flex-col pl-12 pt-12 pb-0">
          {/* Logo & Tagline */}
          <div className="relative z-20">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo_icon.png" alt="Logo" className="w-14 h-14 object-contain" />
              <h1 className="text-5xl font-extrabold text-[#6b21a8] tracking-tight font-serif">SheBloom</h1>
            </div>
            <p className="text-[13px] font-bold text-slate-700 mt-2 ml-1">
              Every Woman. Every Stage. Every Day.
            </p>
          </div>

          {/* Features Stack */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20 space-y-3 w-[260px] lg:w-[300px]">
            {[
              { icon: <User className="w-5 h-5 text-white" />, bg: "bg-[#8b5cf6]", title: "Expert Gynec Care", desc: "Consult with top gynecologists\n& IVF specialists" },
              { icon: <Stethoscope className="w-5 h-5 text-white" />, bg: "bg-[#ec4899]", title: "Unlimited Support", desc: "Chat anytime with our care\nteam" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>, bg: "bg-[#5eead4]", title: "Wellness & Yoga", desc: "Self-paced sessions for\nyour mind and body" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>, bg: "bg-[#8b5cf6]", title: "Track & Understand", desc: "Track cycles, symptoms\n& more" },
              { icon: <ShieldCheck className="w-5 h-5 text-white" />, bg: "bg-[#f472b6]", title: "Privacy First", desc: "Your data is safe, secure\n& confidential" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-3 pr-4 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-white/50">
                <div className={`w-10 h-10 rounded-full ${feature.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800">{feature.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight whitespace-pre-line mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Woman Illustration */}
          <div className="absolute bottom-0 left-0 w-[110%] h-[85%] z-10 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/woman_with_flowers.png" 
              alt="Illustration" 
              className="w-full h-full object-cover object-left-bottom mix-blend-multiply opacity-90 scale-105 origin-bottom-left"
            />
          </div>
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
          <div className="relative w-full flex-1 flex flex-col justify-end min-h-0 bg-[#fdfafb]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/dr_deepa_cutout.png" 
              alt="Dr. Deepa" 
              className="w-full h-full object-cover object-top scale-105 origin-top"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/dr_deepa_avatar.jpg";
              }}
            />
            {/* White gradient fade to blend image into buttons section */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>

          {/* Buttons Section */}
          <div className="w-full bg-white px-8 pb-12 pt-4 relative z-20 space-y-4">
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
