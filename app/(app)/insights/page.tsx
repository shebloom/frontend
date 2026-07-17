'use client';

import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { articles } from '@/lib/data';

export default function InsightsPage() {
  const [hero, ...rest] = articles;

  return (
    <div>
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800">Daily Insights</h1>
        <p className="mt-0.5 text-sm text-slate-500">Articles and tips for your well-being</p>
      </header>

      {/* Hero article */}
      {hero && (
        <section className="px-5 pt-5">
          <div className="relative h-52 overflow-hidden rounded-3xl shadow-bloom-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.imageUrl}
              alt={hero.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bloom-900/80 via-bloom-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="rounded-full bg-bloom-gradient px-2.5 py-1 text-xs font-semibold text-white">
                Featured
              </span>
              <h2 className="mt-2 text-xl font-bold leading-tight text-white">{hero.title}</h2>
              <p className="mt-1 text-sm text-white/80">{hero.excerpt}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {hero.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Today
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Articles for You */}
      <section className="px-5 pt-6">
        <h2 className="text-base font-semibold text-slate-800">Articles for You</h2>

        <div className="mt-3 flex flex-col gap-3">
          {rest.map((article) => (
            <article
              key={article.id}
              className="flex gap-3 rounded-2xl bg-white p-3 shadow-bloom-card border border-bloom-100/60 transition active:scale-[0.98]"
            >
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="rounded-full bg-bloom-50 px-2 py-0.5 text-[10px] font-medium text-bloom-600">
                  {article.category}
                </span>
                <h3 className="mt-1 text-sm font-semibold leading-tight text-slate-800">
                  {article.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{article.excerpt}</p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 self-center text-slate-300" />
            </article>
          ))}
        </div>
      </section>

      {/* Motivational card */}
      <section className="px-5 pt-6 pb-4">
        <div className="rounded-2xl bg-bloom-soft p-5 text-center border border-bloom-100">
          <p className="text-sm font-medium text-bloom-700">Take care of your body and mind</p>
          <p className="mt-1 text-xs text-slate-500">
            Small daily habits lead to lasting wellness.
          </p>
        </div>
      </section>
    </div>
  );
}
