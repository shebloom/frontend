'use client';

import { Stethoscope, HeartHandshake, Sparkles, Activity, ShieldCheck, Star } from 'lucide-react';
import { BloomLogo } from './logo';

const features = [
  { 
    icon: Stethoscope, 
    title: 'Expert Gynec Care', 
    desc: 'Consult with top gynecologists & IVF specialists',
    color: 'bg-bloom-100 text-bloom-700'
  },
  { 
    icon: HeartHandshake, 
    title: 'Unlimited Support', 
    desc: 'Chat anytime with our care team',
    color: 'bg-petal-100 text-petal-700'
  },
  { 
    icon: Sparkles, 
    title: 'Wellness & Yoga', 
    desc: 'Self-paced sessions for your mind and body',
    color: 'bg-green-100 text-green-700'
  },
  { 
    icon: Activity, 
    title: 'Track & Understand', 
    desc: 'Track cycles, symptoms & more',
    color: 'bg-blue-100 text-blue-700'
  },
  { 
    icon: ShieldCheck, 
    title: 'Privacy First', 
    desc: 'Your data is safe, secure & confidential',
    color: 'bg-rose-100 text-rose-700'
  },
];

export function DesktopLeftBanner() {
  return (
    <div className="relative hidden lg:flex lg:w-[48%] xl:w-[42%] flex-col bg-[#fff5f8] px-12 py-10 overflow-hidden justify-between border-r border-bloom-100">
      {/* Brand Header */}
      <div className="relative z-10">
        <BloomLogo size="lg" />
        <p className="mt-2 text-xs font-semibold text-slate-400 tracking-wider uppercase">Every Woman. Every Stage. Every Day.</p>
        
        <h1 className="mt-8 text-4xl font-extrabold text-slate-800 leading-tight">
          Your Complete <br />
          <span className="text-bloom-600">Women's Health</span> <br />
          Companion
        </h1>
      </div>

      {/* Feature List */}
      <div className="relative z-10 mt-8 space-y-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex gap-4 items-start bg-white/55 p-3 rounded-2xl border border-bloom-100/50 hover:bg-white transition-all shadow-sm">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.color} shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{f.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Illustration Image (Background style, no borders) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none opacity-40 mix-blend-multiply">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/woman_with_flowers.png"
          alt="SheBloom Illustration"
          className="h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff5f8] via-transparent to-[#fff5f8]" />
      </div>

      {/* Rating Footer */}
      <div className="relative z-10 mt-8 pt-6 border-t border-bloom-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-600 leading-tight">Trusted by Thousands</p>
          <p className="text-[10px] text-slate-400">of Women Across GCC</p>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-bloom-100/50">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-petal-500 text-petal-500" />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700">4.8</span>
        </div>
      </div>
    </div>
  );
}
