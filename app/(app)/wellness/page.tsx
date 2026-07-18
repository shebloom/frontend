'use client';

import Link from 'next/link';
import { Play, Clock, Calendar, Flame, Flower2, Wind, Dumbbell, ChevronRight, Video } from 'lucide-react';
import { wellnessSessions as fallbackSessions, type WellnessSession } from '@/lib/data';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';

const categories = [
  { icon: Flower2,  label: 'Yoga',       color: 'bg-bloom-100' },
  { icon: Wind,     label: 'Meditation', color: 'bg-blue-100' },
  { icon: Flame,    label: 'Breathing',  color: 'bg-orange-100' },
  { icon: Dumbbell, label: 'Fitness',    color: 'bg-green-100' },
];

export default function WellnessPage() {
  const [activeSession, setActiveSession] = useState<WellnessSession | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await apiFetch('/wellness/sessions');
        if (data.sessions && data.sessions.length > 0) {
          const mapped = data.sessions.map((s: any) => ({
            ...s,
            thumbnailUrl: s.thumbnailUrl || s.thumbnail_url,
            scheduledAt: s.scheduledAt || (s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null),
          }));
          setSessions(mapped);
        } else {
          setSessions(fallbackSessions);
        }
      } catch (err) {
        console.error('Failed to load DB sessions, using fallbacks:', err);
        setSessions(fallbackSessions);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const liveSessions = sessions.filter((s) => s.type === 'live');
  const selfPaced = sessions.filter((s) => s.type === 'self-paced');

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800">Wellness &amp; Yoga</h1>
        <p className="mt-0.5 text-sm text-slate-500">Live classes and self-paced sessions</p>
      </header>

      {/* Live Classes */}
      <section className="px-5 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Live Classes</h2>
          <Link href="/wellness" className="text-sm font-medium text-bloom-600">View All</Link>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <p className="text-xs text-slate-400 font-medium">Loading classes...</p>
          ) : liveSessions.map((session) => (
            <LiveClassRow key={session.id} session={session} onJoin={() => setActiveSession(session)} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 pt-6">
        <h2 className="text-base font-semibold text-slate-800">Categories</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href="/wellness"
                className="flex flex-col items-center gap-2"
              >
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl transition active:scale-95', cat.color)}>
                  <Icon className="h-6 w-6 text-bloom-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Self-Paced Sessions */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Self-Paced Sessions</h2>
          <Link href="/insights" className="text-sm font-medium text-bloom-600">See all</Link>
        </div>

        <div className="flex flex-col gap-3">
          {selfPaced.map((session) => (
            <SelfPacedCard key={session.id} session={session} onPlay={() => setActiveSession(session)} />
          ))}
        </div>
      </section>

      {/* Video modal */}
      {activeSession && (
        <VideoModal session={activeSession} onClose={() => setActiveSession(null)} />
      )}
    </div>
  );
}

function LiveClassRow({
  session,
  onJoin,
}: {
  session: WellnessSession;
  onJoin: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60">
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={session.thumbnailUrl} alt={session.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-800 leading-tight">{session.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{session.scheduledAt}</p>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] text-slate-400">{session.duration}</span>
        </div>
      </div>
      <button
        onClick={onJoin}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-bloom-gradient px-4 text-xs font-semibold text-white shadow-bloom-btn transition hover:brightness-105 active:scale-95"
      >
        Join
      </button>
    </div>
  );
}

function SelfPacedCard({
  session,
  onPlay,
}: {
  session: WellnessSession;
  onPlay: () => void;
}) {
  return (
    <button
      onClick={onPlay}
      className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-bloom-card border border-bloom-100/60 text-left transition active:scale-[0.98]"
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={session.thumbnailUrl} alt={session.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90">
            <Play className="h-3.5 w-3.5 fill-bloom-600 text-bloom-600" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-800">{session.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {session.duration}
          </span>
          <span className="rounded-full bg-bloom-50 px-2 py-0.5 text-[10px] font-medium text-bloom-600">
            {session.category}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
    </button>
  );
}

function VideoModal({
  session,
  onClose,
}: {
  session: WellnessSession;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[414px] rounded-t-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

        <div className="relative mb-4 h-48 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={session.thumbnailUrl} alt={session.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90">
              <Play className="h-6 w-6 fill-bloom-600 text-bloom-600" />
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800">{session.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{session.subtitle}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {session.duration}
          </span>
          {session.scheduledAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {session.scheduledAt}
            </span>
          )}
        </div>

        <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bloom-gradient font-semibold text-white shadow-bloom-btn transition hover:brightness-105 active:scale-[0.98]">
          <Play className="h-5 w-5 fill-white" />
          {session.type === 'live' ? 'Join Live Class' : 'Start Session'}
        </button>
        <button
          onClick={onClose}
          className="mt-2 h-11 w-full rounded-full text-sm font-medium text-slate-500 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
