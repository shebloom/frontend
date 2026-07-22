'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { programs as fallbackPrograms } from '@/lib/data';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const filters = ['All', 'Fertility', 'PCOS', 'Pregnancy', 'Menopause'] as const;
type Filter = (typeof filters)[number];

export default function ProgramsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [dbPrograms, setDbPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/programs')
      .then(res => {
        setDbPrograms(res.programs || []);
      })
      .catch(err => {
        console.error('Failed to load programs, using fallbacks', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const displayPrograms = dbPrograms;
  const filtered = displayPrograms.filter(
    (p) => activeFilter === 'All' || p.category === activeFilter,
  );

  return (
    <div className="pb-24 max-w-[640px] mx-auto">
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800 font-playfair">Programs for Every Stage</h1>
        <p className="mt-0.5 text-sm text-slate-500 font-medium">
          Expert-led wellness programs created by your care team
        </p>

        {/* Filter tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                activeFilter === f
                  ? 'bg-bloom-gradient text-white shadow-bloom-btn'
                  : 'bg-white text-slate-500 border border-bloom-100 hover:bg-bloom-50',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Program list */}
      <section className="px-5 pt-5">
        {loading ? (
          <p className="text-xs text-slate-400 font-semibold">Loading wellness programs...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[32px] p-8 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5b21b6] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-playfair">No Admin Programs Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No programs are currently published under this category. Check back soon for new admin programs!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProgramCard({ program }: { program: any }) {
  const imageUrl = program.image_url || program.imageUrl;
  const isPopular = program.is_popular || program.popular;
  
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-bloom-card border border-bloom-100/60 transition-all active:scale-[0.98]">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={program.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bloom-900/30 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">{program.title}</h3>
          {isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-petal-100 text-petal-600 px-2 py-0.5 text-[9px] font-bold">
              <Sparkles className="h-2.5 w-2.5" />
              Popular
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500 font-semibold">{program.duration || `${program.duration_weeks} Weeks`}</p>
        <span className="mt-1.5 inline-block rounded-full bg-bloom-50 px-2.5 py-0.5 text-[9px] font-bold text-bloom-600">
          {program.category}
        </span>
      </div>

      {/* Arrow */}
      <Link
        href={`/programs/${program.id}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bloom-50 border border-bloom-100 transition hover:bg-bloom-100"
      >
        <ChevronRight className="h-4 w-4 text-bloom-700" />
      </Link>
    </div>
  );
}
