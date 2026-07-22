import React from 'react';

export function AuthSidebar({ className = '' }: { className?: string }) {
  return (
    <div className={`hidden lg:flex relative bg-gradient-to-b from-[#D4C2F4] to-[#EFEBFA] p-12 flex-col justify-between overflow-hidden h-full border-r border-[#E9D5FF]/30 ${className}`}>
      
      {/* Full-bleed background illustration (Direct child of parent to span full width and height) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/images/sidebar_clean_bg.png" 
        alt="SheBloom Illustration" 
        className="absolute inset-0 h-full w-full object-cover object-left z-10 pointer-events-none select-none"
      />

      {/* Top Brand Header */}
      <div className="relative z-20 text-left mt-4 pl-2">
        <h1 className="text-[3.5rem] font-semibold text-[#4C1D95] tracking-tight font-playfair leading-tight">
          SheBloom
        </h1>
        <p className="text-[14.5px] font-medium text-slate-800 mt-2 tracking-wide font-sans pl-0.5">
          Every Woman. Every Stage. Every Day.
        </p>
      </div>

      {/* Main content body with right-aligned feature pills */}
      <div className="relative flex-1 w-full mt-4">
 
        {/* Right Side: Feature Pills List (Polished capsules with glassmorphism & soft shadows) */}
        <div className="absolute right-4 top-[50%] -translate-y-1/2 flex flex-col gap-4 z-20 max-w-[350px] w-[90%]">
          {[
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
                  <path d="M12 14v6" />
                  <path d="M9 17h6" />
                </svg>
              ), 
              bg: "bg-[#7C3AED]", 
              title: "Expert Gynec Care", 
              desc: "Consult with top gynecologists & IVF specialists" 
            },
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01M12 10h.01M16 10h.01" />
                </svg>
              ), 
              bg: "bg-[#EC4899]", 
              title: "Unlimited Support", 
              desc: "Chat anytime with our care team" 
            },
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 12c2.5-2.5 2.5-6.5 0-9-2.5 2.5-2.5 6.5 0 9Z" />
                  <path d="M12 12c-2.5-2.5-6.5-2.5-9 0 2.5 2.5 6.5 2.5 9 0Z" />
                  <path d="M12 12c-2.5 2.5-2.5 6.5 0 9 2.5-2.5 2.5-6.5 0-9Z" />
                  <path d="M12 12c2.5 2.5 6.5 2.5 9 0-2.5-2.5-6.5-2.5-9 0Z" />
                </svg>
              ), 
              bg: "bg-[#14B8A6]", 
              title: "Wellness & Yoga", 
              desc: "Self-paced sessions for your mind and body" 
            },
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="M12 14c1-1 2.5-1 3.5 0a2.5 2.5 0 0 1 0 3.5L12 21l-3.5-3.5a2.5 2.5 0 0 1 0-3.5c1-1 2.5-1 3.5 0Z" />
                </svg>
              ), 
              bg: "bg-[#4F46E5]", 
              title: "Track & Understand", 
              desc: "Track cycles, symptoms & more" 
            },
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="M12 8v4" />
                  <circle cx="12" cy="15.5" r="1.5" />
                </svg>
              ), 
              bg: "bg-[#F43F5E]", 
              title: "Privacy First", 
              desc: "Your data is safe, secure & confidential" 
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-white/60 shadow-[0_8px_30px_rgba(91,33,182,0.03)] flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 hover:shadow-[0_12px_40px_rgba(91,33,182,0.06)]"
            >
              <div className={`w-10 h-10 rounded-full ${feature.bg} flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-white`}>
                {feature.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-[13.5px] font-bold text-slate-800 tracking-tight leading-tight">
                  {feature.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5 whitespace-pre-line">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

