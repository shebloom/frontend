'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Video,
  CheckCircle,
  Play,
  User,
  Users,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Volume2,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { programs as fallbackPrograms } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Simulated Session States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load program details
        const res = await apiFetch(`/programs/${params.id}`);
        setProgram(res.program);
      } catch (err) {
        console.error('Failed to load program from DB, trying fallback', err);
        const fallback = fallbackPrograms.find(p => p.id === params.id);
        if (fallback) {
          // Normalize structure
          setProgram({
            id: fallback.id,
            title: fallback.title,
            description: fallback.description,
            duration: fallback.duration,
            category: fallback.category,
            image_url: fallback.imageUrl,
            content: 'This specialized program is designed by clinical experts to help you balance your body, mind, and spirit. It features guided routines, tailored nutritional pathways, and mindfulness triggers to promote complete wellness.',
            benefits: 'Optimized metabolic health · Restored natural rhythms · Enhanced energy and focus · Sustainable lifestyle habits'
          });
        }
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      apiFetch('/programs/enrollments/mine')
        .then(res => {
          const list = res.enrollments || [];
          setIsEnrolled(list.some((e: any) => e.program_id === params.id));
        })
        .catch(console.error);
    }
  }, [params.id]);

  const handleJoinProgram = async () => {
    if (isEnrolled) {
      setShowSessionModal(true);
      return;
    }
    
    setIsEnrolling(true);
    try {
      await apiFetch(`/programs/${params.id}/enroll`, { method: 'POST' });
      setIsEnrolled(true);
      setShowSessionModal(true);
    } catch (err) {
      alert('Enrolling failed. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-lavender-50">
        <p className="text-sm font-bold text-slate-400 animate-pulse">Loading program details...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-lavender-50 text-center px-5">
        <p className="text-sm text-slate-500 font-bold">Program not found.</p>
        <button onClick={() => router.push('/programs')} className="mt-4 text-xs font-bold text-bloom-600">Back to programs</button>
      </div>
    );
  }

  const imageUrl = program.image_url || 'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=600';
  const benefitsList = program.benefits ? program.benefits.split('·').map((b: string) => b.trim()).filter(Boolean) : ['Hormonal balance', 'Stress relief', 'Guided exercises', 'Expert tips'];

  return (
    <div className="min-h-screen bg-lavender-50 flex flex-col justify-between">
      {/* Video Call Session Modal Overlay */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white animate-in fade-in duration-300">
          
          {/* Top Bar */}
          <header className="flex items-center justify-between px-5 py-4 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold truncate max-w-[200px]">{program.title}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Instructor Session</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wide">
              <Users className="h-3.5 w-3.5" /> 8 Active
            </div>
          </header>

          {/* Center Call Video Area */}
          <main className="flex-1 relative flex flex-col md:flex-row p-4 gap-3 bg-slate-900">
            {/* Instructor Main Screen */}
            <div className="flex-1 bg-slate-800 rounded-3xl overflow-hidden border border-white/5 relative flex items-center justify-center">
              <img 
                src="https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Trainer" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-bloom-400" />
                <span className="text-[10px] font-bold">Trainer Maya (Instructor)</span>
              </div>
            </div>

            {/* Participants Grid (Simulated layout) */}
            <div className="w-full md:w-44 flex md:flex-col gap-2.5 shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-hide">
              {/* Patient Self view */}
              <div className="w-28 md:w-full h-20 md:h-28 bg-slate-850 rounded-2xl border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center">
                {isVideoOn ? (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center relative">
                    <User className="h-7 w-7 text-slate-400" />
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[8px] font-semibold text-white/90">You</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-[9px] text-slate-500 font-bold">
                    <VideoOff className="h-5 w-5 text-slate-500" /> Camera Off
                  </div>
                )}
              </div>

              {/* Mock other members */}
              {['Sarah', 'Emily', 'Chloe'].map((name, i) => (
                <div key={name} className="w-28 md:w-full h-20 md:h-28 bg-slate-800 rounded-2xl border border-white/5 overflow-hidden relative shrink-0 flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                    {name[0]}
                  </div>
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[8px] font-semibold text-white/90">{name}</span>
                </div>
              ))}
            </div>
          </main>

          {/* Bottom Call Controls Bar */}
          <footer className="bg-slate-900/80 backdrop-blur-md px-5 py-4 border-t border-white/5 flex items-center justify-center gap-4 shrink-0">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "h-12 w-12 rounded-full border flex items-center justify-center transition active:scale-90",
                isMuted 
                  ? "bg-red-500 border-red-500 text-white" 
                  : "bg-white/10 border-white/10 text-white hover:bg-white/20"
              )}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={cn(
                "h-12 w-12 rounded-full border flex items-center justify-center transition active:scale-90",
                !isVideoOn 
                  ? "bg-red-500 border-red-500 text-white" 
                  : "bg-white/10 border-white/10 text-white hover:bg-white/20"
              )}
            >
              {isVideoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowSessionModal(false)}
              className="h-12 px-6 bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/20 active:scale-95 transition"
            >
              <PhoneOff className="h-4 w-4" /> Leave Class
            </button>
          </footer>

        </div>
      )}

      <div>
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4 border-b border-bloom-100 shadow-sm">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-bloom-50">
            <ArrowLeft className="h-5 w-5 text-bloom-700" />
          </button>
          <h1 className="text-sm font-black uppercase tracking-wider text-slate-800">Wellness Program</h1>
          <div className="w-9" /> {/* Spacer */}
        </header>

        {/* Hero Image */}
        <div className="relative h-56 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={program.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 flex gap-2">
            <span className="bg-bloom-600 text-white text-[9px] font-bold uppercase px-3 py-1 rounded-full shadow">
              {program.category}
            </span>
            <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[9px] font-bold px-3 py-1 rounded-full shadow">
              {program.duration || `${program.duration_weeks} Weeks`}
            </span>
          </div>
        </div>

        <main className="mx-auto max-w-[414px] px-5 py-6 space-y-6 pb-24">
          {/* Program Title & Short Desc */}
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{program.title}</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{program.description}</p>
          </div>

          {/* Benefits Section */}
          <div className="rounded-3xl bg-white border border-bloom-100/60 p-5 shadow-bloom-card space-y-3.5">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Program Benefits</h3>
            </div>
            <ul className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              {benefitsList.map((benefit: string, index: number) => (
                <li key={index} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Details & Long-form Content */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Long-Form Details & Guidance</h3>
            <div className="bg-white border border-bloom-100/40 rounded-3xl p-5 shadow-bloom-card text-xs text-slate-600 leading-relaxed font-medium space-y-3.5">
              {program.content ? (
                program.content.split('\n\n').map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <>
                  <p>Welcome to the {program.title}. This specialized guidelines module provides scientific research reviews, expert recommendations, and specific lifestyle practices designed for women's reproductive health and well-being.</p>
                  <p>Throughout the duration of this program, we recommend focusing on stress regulation, nutrient-dense anti-inflammatory meal plans, and daily mobility. Follow each weekly module step-by-step and join our live video sessions to stay connected with instructors and other participants.</p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Action Button - fixed at bottom */}
      <div className="sticky bottom-0 w-full bg-white px-5 py-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 border-t border-bloom-100/60">
        <div className="mx-auto max-w-[414px]">
          <button
            onClick={handleJoinProgram}
            disabled={isEnrolling}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bloom-gradient text-sm font-extrabold text-white shadow-bloom-btn transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
          >
            {isEnrolling ? (
              'Joining Program...'
            ) : isEnrolled ? (
              <>
                <Play className="h-4 w-4 fill-white" /> Launch Live Session
              </>
            ) : (
              'Join Program'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
