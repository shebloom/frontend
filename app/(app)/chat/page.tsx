'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ShieldCheck, ChevronRight, Info, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ChatHubPage() {
  const router = useRouter();
  const [drDeepa, setDrDeepa] = useState<any>(null);
  const [hasBooking, setHasBooking] = useState(false);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [docsRes, apptsRes] = await Promise.all([
          apiFetch('/doctors'),
          apiFetch('/appointments'),
        ]);

        const doctorsList = docsRes.doctors || [];
        if (doctorsList.length > 0) {
          const doc = doctorsList[0];
          setDrDeepa(doc);

          const appts = apptsRes.appointments || [];
          const confirmed = appts.some((a: any) => a.doctor_id === doc.id && ['confirmed', 'pending'].includes(a.status));
          setHasBooking(confirmed);
        }
      } catch (err) {
        console.error('Chat hub load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="pb-28 max-w-[640px] mx-auto px-4 pt-6">
      
      {/* Header */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold text-[#9d174d] uppercase tracking-widest bg-pink-100/70 px-3 py-1 rounded-full">
          Messaging Center
        </span>
        <h1 className="text-2xl font-black text-slate-800 font-playfair tracking-tight mt-2">
          Health Support & Chat
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Choose an AI assistant for quick general questions, or chat directly with Dr. Deepa Madhavan.
        </p>
      </div>

      <div className="space-y-4">
        
        {/* THREAD 1: AI Health Assistant */}
        <div 
          onClick={() => router.push('/chat/00000000-0000-0000-0000-0000000000a1')}
          className="bg-gradient-to-br from-purple-900 via-[#5b21b6] to-[#4c1d95] text-white rounded-[32px] p-6 shadow-[0_12px_30px_rgba(91,33,182,0.25)] relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-all group border border-purple-500/30"
        >
          <Sparkles className="absolute -right-3 -bottom-3 w-32 h-32 text-white/5 pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-playfair">AI Health Assistant</h3>
                  <span className="text-[9px] font-black uppercase bg-pink-500 text-white px-2 py-0.5 rounded-full tracking-wider">
                    24/7 AI
                  </span>
                </div>
                <p className="text-xs text-purple-200 font-medium mt-0.5">
                  General Education • Menstrual & Gynecological Support
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* THREAD 2: Chat with Dr. Deepa Madhavan */}
        <div 
          onClick={() => {
            if (drDeepa?.id) {
              router.push(`/chat/${drDeepa.id}`);
            } else {
              router.push('/consult');
            }
          }}
          className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm relative overflow-hidden cursor-pointer hover:border-[#5b21b6] transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20" style={{ background: 'aliceblue' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={drDeepa?.users?.avatar_url || '/images/dr_deepa_cutout.png'} 
                  alt="Dr. Deepa Madhavan" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800 font-playfair">Chat with Dr. Deepa Madhavan</h3>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Chief Specialist
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  1-on-1 Consultation Thread • Official Medical Care
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#5b21b6]" />
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
            {hasBooking ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Active Consultation Thread Unlocked
              </span>
            ) : (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Requires confirmed appointment with Dr. Deepa Madhavan
              </span>
            )}
            <span className="font-bold text-[#5b21b6]">Open Thread →</span>
          </div>
        </div>

      </div>

    </div>
  );
}
