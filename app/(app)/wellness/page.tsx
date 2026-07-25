'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Play, Clock, X, Search, Filter, Video } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const DEFAULT_FILTER_CATEGORIES = [
  'All',
  'PCOS',
  'General Wellness',
  'Fertility',
  'Menstrual Care',
  'Pregnancy',
  'Yoga & Mindfulness',
];

export default function WellnessCategoryHubPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]+)\/videos\/|\d+\/|video\/)?(\d+)(?:[a-zA-Z0-9_\-]+)?/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return null;
  };

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

  // Dynamic Categories list
  const dynamicCategories = Array.from(
    new Set(sessions.map((s) => s.category).filter(Boolean))
  );
  const allCategories = Array.from(
    new Set([...DEFAULT_FILTER_CATEGORIES, ...dynamicCategories])
  );

  // Filter sessions by selected category and search query
  const filteredSessions = sessions.filter((sess) => {
    const cat = sess.category || 'General Wellness';
    const matchesCat =
      selectedCategory === 'All' ||
      cat.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sess.title?.toLowerCase().includes(q) ||
      sess.subtitle?.toLowerCase().includes(q) ||
      sess.description?.toLowerCase().includes(q) ||
      cat.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  // Group by category when viewing all without search
  const displayedCategories = Array.from(
    new Set(filteredSessions.map((s) => s.category || 'General Wellness'))
  );

  return (
    <div className="pb-28 max-w-[640px] mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-5">
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

      {/* Search Input Bar */}
      <div className="mb-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos by title, topic, or category (e.g. PCOS, yoga)..."
            className="w-full h-11 pl-10 pr-9 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/20 focus:border-[#5b21b6] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 h-5 w-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {allCategories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all active:scale-95 cursor-pointer border ${
                isSelected
                  ? 'bg-[#5b21b6] text-white font-extrabold border-[#5b21b6] shadow-sm'
                  : 'bg-white text-slate-600 font-bold border-slate-200/80 hover:border-[#5b21b6] hover:text-[#5b21b6]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results Header / Active Filter Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-bold text-slate-500">
          Showing <span className="text-[#5b21b6] font-extrabold">{filteredSessions.length}</span> session{filteredSessions.length === 1 ? '' : 's'}
        </p>
        {(selectedCategory !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-9 h-9 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading Wellness Sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-[32px] p-8 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5b21b6] mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-playfair">No Videos Match Your Search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No sessions found matching "${searchQuery}" in category "${selectedCategory}".`
              : `No sessions found in category "${selectedCategory}".`}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 bg-[#5b21b6] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#4c1d95]"
          >
            View All Videos
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {displayedCategories.map((catName) => {
            const catSessions = filteredSessions.filter(
              (s) => (s.category || 'General Wellness') === catName
            );
            if (catSessions.length === 0) return null;

            return (
              <div key={catName} className="space-y-3">
                <h2 className="text-base font-extrabold text-slate-800 font-playfair border-b border-slate-100 pb-1.5 capitalize flex items-center justify-between">
                  <span>{catName}</span>
                  <span className="text-[11px] font-bold text-slate-400 font-sans">
                    {catSessions.length} video{catSessions.length === 1 ? '' : 's'}
                  </span>
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
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#5b21b6] flex items-center justify-center shrink-0 group-hover:bg-[#5b21b6] group-hover:text-white transition-colors">
                          <Play className="h-4.5 w-4.5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#5b21b6] transition-colors truncate">
                            {sess.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                            {sess.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
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
              {getEmbedUrl(activeVideoUrl) ? (
                <iframe
                  src={getEmbedUrl(activeVideoUrl)!}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                  title={activeVideoTitle}
                />
              ) : (
                <video
                  controls
                  autoPlay
                  src={activeVideoUrl}
                  className="w-full h-full object-contain"
                />
              )}
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
