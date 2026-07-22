'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Video,
  ListVideo,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function YogaCoursePlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const conditionId = params.id as string;

  const [condition, setCondition] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]+)\/videos\/|\d+\/|video\/)?(\d+)(?:[a-zA-Z0-9_\-]+)?/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
  };

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        const res = await apiFetch(`/wellness/conditions/${conditionId}`);
        if (res.condition) {
          setCondition(res.condition);
          const vList = res.condition.videos || [];
          setVideos(vList);
          if (vList.length > 0) {
            setActiveVideo(vList[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setLoading(false);
      }
    }
    if (conditionId) {
      loadCourse();
    }
  }, [conditionId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading course playlist...</p>
      </div>
    );
  }

  if (!condition) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto space-y-4">
        <p className="text-sm font-bold text-slate-600">Course category not found.</p>
        <button
          onClick={() => router.push('/wellness')}
          className="px-4 py-2 bg-[#5b21b6] text-white text-xs font-bold rounded-full"
        >
          Back to Yoga Library
        </button>
      </div>
    );
  }

  const doctorName = condition?.users?.full_name || 'Dr. Deepa Madhavan';

  return (
    <div className="pb-28 max-w-[720px] mx-auto px-4 pt-6 space-y-6">
      
      {/* Header Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/wellness')}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-extrabold text-[#9d174d] uppercase tracking-wider">
            Yoga Course Playlist
          </span>
          <h1 className="text-xl font-bold text-slate-800 font-playfair">{condition.title}</h1>
        </div>
      </div>

      {/* Main Video Player Container */}
      {activeVideo && (
        <div className="bg-black rounded-[32px] overflow-hidden shadow-xl border border-slate-800">
          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
            {getEmbedUrl(activeVideo.video_url) ? (
              <iframe
                src={getEmbedUrl(activeVideo.video_url)!}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
                title={activeVideo.title}
              />
            ) : (
              <video
                key={activeVideo.id || activeVideo.video_url}
                src={activeVideo.video_url}
                controls
                autoPlay={false}
                poster={activeVideo.thumbnail_url}
                className="w-full h-full object-contain"
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          <div className="p-5 bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-pink-400 uppercase tracking-widest bg-pink-950/80 px-2.5 py-1 rounded-full border border-pink-800/50">
                Now Playing • {activeVideo.duration}
              </span>
              <span className="text-xs text-slate-400 font-bold">Class {videos.indexOf(activeVideo) + 1} of {videos.length}</span>
            </div>

            <h2 className="text-base font-bold text-white font-playfair">{activeVideo.title}</h2>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">{activeVideo.description}</p>
          </div>
        </div>
      )}

      {/* Course Playlist List */}
      <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-[#5b21b6]" />
            <h3 className="font-bold text-slate-800 text-base font-playfair">Course Classes ({videos.length})</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">Self-Paced Progression</span>
        </div>

        <div className="space-y-3">
          {videos.map((item, index) => {
            const isActive = activeVideo?.id === item.id;
            return (
              <div
                key={item.id || index}
                onClick={() => setActiveVideo(item)}
                className={cn(
                  'p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                  isActive
                    ? 'bg-purple-50/80 border-[#5b21b6] shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                )}
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs',
                    isActive ? 'bg-[#5b21b6] text-white' : 'bg-white text-slate-600 border border-slate-200'
                  )}>
                    {isActive ? <Play className="w-4 h-4 fill-white" /> : index + 1}
                  </div>

                  <div>
                    <h4 className={cn(
                      'text-xs font-bold transition-colors',
                      isActive ? 'text-[#5b21b6]' : 'text-slate-800'
                    )}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    {item.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
