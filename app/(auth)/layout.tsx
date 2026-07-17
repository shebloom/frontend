'use client';

import { User, Stethoscope, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 md:grid md:grid-cols-12 bg-lavender-100 overflow-hidden">
      {/* Left side: desktop banner */}
      <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-[#FFF5F5] to-[#FFEAEA] p-8 flex-col justify-between relative overflow-hidden h-full border-r border-bloom-100/30">
        {/* Decorative petals / glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bloom-100/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-bloom-600 to-petal-600 bg-clip-text text-transparent tracking-tight">SheBloom</span>
            <span className="text-[10px] font-bold text-bloom-500 uppercase tracking-widest mt-0.5">Every Woman. Every Stage. Every Day.</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">Your Complete<br />Women's Health<br />Companion</h2>
          </div>

          {/* Bullet features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-bloom-100 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-bloom-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Expert Gynec Care</h4>
                <p className="text-xs text-slate-400">Consult with top gynecologists & IVF specialists</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-petal-100 flex items-center justify-center shrink-0">
                <Stethoscope className="h-5 w-5 text-petal-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Unlimited Support</h4>
                <p className="text-xs text-slate-400">Chat anytime with our dedicated care team</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-sm">🧘</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Wellness & Yoga</h4>
                <p className="text-xs text-slate-400">Self-paced sessions for your mind and body</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-sm">📅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Track & Understand</h4>
                <p className="text-xs text-slate-400">Track cycles, symptoms & more</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Privacy First</h4>
                <p className="text-xs text-slate-400">Your data is safe, secure & confidential</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom illustration */}
        <div className="relative mt-auto pt-6 z-10 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/woman_with_flowers.png" 
            alt="Illustration" 
            className="w-full max-w-[280px] h-auto object-contain mix-blend-multiply opacity-90 drop-shadow-md"
          />
        </div>
      </div>

      {/* Right side: auth area */}
      <div className="col-span-12 md:col-span-7 h-full flex flex-col relative overflow-hidden bg-lavender-100 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
        {/* Main Content Area - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto w-full mx-auto relative custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
