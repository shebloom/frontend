'use client';

import { Calendar, Clock, ChevronRight, Heart } from 'lucide-react';
import { articles } from '@/lib/data';
import Link from 'next/link';

export default function InsightsPage() {
  const [hero, ...rest] = articles;

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800">Daily Insights</h1>
        <p className="mt-0.5 text-sm text-slate-500">Articles and tips for your well-being</p>
      </header>

      {/* Motivational Card */}
      <section className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-3xl bg-bloom-gradient p-5 shadow-bloom-card">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-1">
              <p className="text-base font-bold text-white leading-snug">
                Take care of your body and mind.
              </p>
              <p className="text-sm font-semibold text-white/80 mt-1">
                You're doing great! 🌸
              </p>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                Small daily habits lead to lasting wellness. Keep going!
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=200"
              alt="Wellness"
              className="h-20 w-20 rounded-2xl object-cover border-2 border-white/20 shrink-0"
            />
          </div>
        </div>
      </section>

      {/* Articles for You */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Articles for You</h2>
          <Link href="/insights" className="text-sm font-medium text-bloom-600">View All</Link>
        </div>

        <div className="flex flex-col gap-3">
          {[hero, ...rest].filter(Boolean).map((article) => (
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

      {/* Pregnancy Symptoms */}
      <section className="px-5 pt-6 pb-8">
        <div className="rounded-2xl bg-bloom-soft p-4 border border-bloom-100">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-bloom-600" />
            <h3 className="text-sm font-semibold text-bloom-700">Pregnancy Symptoms Week by Week</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A week-by-week guide to what your body experiences during the first trimester and how to cope with early pregnancy changes.
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">8 min read</span>
          </div>
        </div>
      </section>
    </div>
  );
}
