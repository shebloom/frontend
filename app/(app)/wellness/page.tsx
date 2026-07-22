'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Play, Clock, ChevronRight, Video, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function WellnessCategoryHubPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const res = await apiFetch('/wellness/sessions');
        setSessions(res.sessions || []);
      } catch (err) {
        console.error('Failed to load wellness sessions', err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  // Group sessions by category
  const categories = Array.from(new Set(sessions.map(s => s.category || 'General Wellness')));

  return (
    <div className="pb-28 max-w-[640px] mx-auto px-4 pt-6">
      
      {/* Header */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold text-[#9d174d] uppercase tracking-widest bg-pink-100/70 px-3 py-1 rounded-full">
          Wellness Video Library
        </span>
        <h1 className="text-2xl font-black text-slate-800 font-playfair tracking-tight mt-2">
          Wellness & Yoga Sessions
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Access high-quality prerecorded classes and guides created by our specialists.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-9 h-9 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading Wellness Sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-[32px] p-8 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5b21b6] mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-playfair">No Video Sessions Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please ask the administrator to create a wellness session and upload class videos from the Admin Panel.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((catName) => {
            const catSessions = sessions.filter(s => (s.category || 'General Wellness') === catName);
            return (
              <div key={catName} className="space-y-3">
                <h2 className="text-base font-extrabold text-slate-800 font-playfair border-b border-slate-100 pb-1.5 capitalize">
                  {catName}
                </h2>
                <div className="grid gap-3.5">
                  {catSessions.map((sess, idx) => (
                    <div
                      key={sess.id}
                      onClick={() => {
                        if (sess.video_url) {
                          setActiveVideoUrl(sess.video_url);
                          setActiveVideoTitle(sess.title);
                        } else {
                          alert('This session does not have a video uploaded.');
                        }
                      }}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-[#5b21b6] transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#5b21b6] flex items-center justify-center shrink-0 group-hover:bg-[#5b21b6] group-hover:text-white transition-colors">
                          <Play className="h-4.5 w-4.5 fill-current" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#5b21b6] transition-colors">
                            Class {idx + 1}: {sess.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">{sess.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                          {sess.duration || '20 Min'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal overlay */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-700 w-full max-w-lg relative">
            <button
              onClick={() => {
                setActiveVideoUrl(null);
                setActiveVideoTitle('');
              }}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative aspect-video w-full bg-black">
              <video
                controls
                autoPlay
                src={activeVideoUrl}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-5 text-white">
              <h3 className="font-bold font-playfair text-base">{activeVideoTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">Clinical Wellness Guidance Video</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
