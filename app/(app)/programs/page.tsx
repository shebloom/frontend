'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, Sparkles } from 'lucide-react';
import { programs, type Program } from '@/lib/data';
import { cn } from '@/lib/utils';

const filters = ['All', 'Fertility', 'PCOS', 'Pregnancy', 'Menopause'] as const;
type Filter = (typeof filters)[number];

export default function ProgramsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filtered = programs.filter(
    (p) => activeFilter === 'All' || p.category === activeFilter,
  );

  return (
    <div>
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800">Programs for Every Stage</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Expert-led programs tailored to your needs
        </p>

        {/* Filter tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
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
        <div className="flex flex-col gap-4">
          {filtered.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-bloom-card border border-bloom-100/60 transition-all active:scale-[0.98]">
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={program.imageUrl}
          alt={program.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bloom-900/40 to-transparent" />
        {program.popular && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-bloom-gradient px-2.5 py-1 text-xs font-semibold text-white shadow-bloom-btn">
            <Sparkles className="h-3 w-3" />
            Popular
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-slate-800">{program.title}</h3>
        <div className="mt-1 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">{program.duration}</span>
          <span className="mx-1 text-slate-300">·</span>
          <span className="rounded-full bg-bloom-50 px-2 py-0.5 text-xs font-medium text-bloom-600">
            {program.category}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{program.description}</p>

        <Link
          href="/programs"
          className="mt-3 flex items-center justify-between rounded-xl bg-bloom-soft px-4 py-2.5 transition hover:bg-bloom-100"
        >
          <span className="text-sm font-semibold text-bloom-700">Join Program</span>
          <ChevronRight className="h-4 w-4 text-bloom-600" />
        </Link>
      </div>
    </div>
  );
}
