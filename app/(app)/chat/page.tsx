'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ChevronRight } from 'lucide-react';
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
        const [docsRes, apptsRes, convosRes] = await Promise.all([
          apiFetch('/doctors'),
          apiFetch('/appointments'),
          apiFetch('/chat/conversations').catch(() => ({ conversations: [] })),
        ]);

        const doctorsList = docsRes.doctors || [];
        if (doctorsList.length > 0) {
          const doc = doctorsList[0];
          setDrDeepa(doc);

          const appts = apptsRes.appointments || [];
          const convos = convosRes.conversations || [];
          const hasAppt = appts.some((a: any) => a.doctor_id === doc.id || a.doctors?.id === doc.id);
          const hasConvo = convos.some((c: any) => c.doctor_id === doc.id || c.doctors?.user_id === doc.id || c.doctor_id === doc.user_id);

          setHasBooking(hasAppt || hasConvo || convos.length > 0);
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
          Connect directly with Dr. Deepa Madhavan for official medical care and consultations.
        </p>
      </div>

      <div className="space-y-4">
        {/* Direct Chat with Dr. Deepa Madhavan */}
        <div 
          onClick={async () => {
            try {
              const drRes = await apiFetch('/doctors');
              const doctor = drRes.doctors?.[0];
              if (doctor?.id) {
                const convoRes = await apiFetch('/chat/conversations', {
                  method: 'POST',
                  body: JSON.stringify({ doctor_id: doctor.id }),
                });
                if (convoRes.conversation?.id) {
                  router.push(`/chat/${convoRes.conversation.id}`);
                  return;
                }
              }
            } catch (err) {
              console.warn('Failed to resolve conversation:', err);
            }
            const targetId = drDeepa?.id || drDeepa?.user_id || '00000000-0000-0000-0000-0000000000d1';
            router.push(`/chat/${targetId}`);
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
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Direct Doctor Chat Thread
            </span>
            <span className="font-bold text-[#5b21b6]">Open Chat →</span>
          </div>
        </div>

      </div>

    </div>
  );
}
