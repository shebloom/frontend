'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const filters = [
  'All', 
  'Gynecologist', 
  'IVF Specialist', 
  'Fertility Expert',
];

export default function ConsultPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const queryParams = new URLSearchParams();
        if (activeFilter !== 'All') {
          queryParams.append('search', activeFilter);
        } else if (search) {
          queryParams.append('search', search);
        }

        const res = await apiFetch(`/doctors?${queryParams.toString()}`);
        setDoctors(res.doctors || []);
      } catch (err) {
        console.error('Failed to load doctors', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [activeFilter, search]);

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800">Find Your Doctor</h1>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveFilter('All'); }}
            placeholder="Search doctor, speciality or concern"
            className="h-12 w-full rounded-2xl border border-bloom-100 bg-white pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-bloom-300 focus:outline-none focus:ring-2 focus:ring-bloom-200"
          />
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-5 px-5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setSearch(''); }}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold transition-all',
                activeFilter === f
                  ? 'bg-bloom-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-bloom-50',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Doctor list */}
      <section className="px-5 pt-5">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p className="text-sm font-bold text-slate-400 animate-pulse">Loading specialists...</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {doctors.length} {doctors.length === 1 ? 'Specialist' : 'Specialists'} available
            </p>

            <div className="flex flex-col gap-4">
              {doctors.map((doc) => (
                <DoctorListCard key={doc.id} doctor={doc} />
              ))}
            </div>

            {doctors.length === 0 && (
              <div className="mt-10 text-center bg-white p-6 rounded-3xl border border-slate-100">
                <p className="text-sm font-bold text-slate-600 mb-1">No matches found</p>
                <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function DoctorListCard({ doctor }: { doctor: any }) {
  return (
    <div className="rounded-3xl bg-white shadow-bloom-card border border-bloom-100/50 overflow-hidden hover:border-bloom-200 transition-colors">
      {/* Doctor image area - full width */}
      <div className="relative h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={doctor.users?.avatar_url || "/images/dr_deepa_avatar.jpg"} 
          alt={doctor.users?.full_name || "Doctor"} 
          className="h-full w-full object-cover object-top" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-base font-bold text-white">{doctor.users?.full_name}</h3>
          <p className="text-[11px] font-semibold text-white/80 mt-0.5">{doctor.specialty || 'General Practitioner'}</p>
          <p className="text-[10px] text-white/70 mt-0.5">{doctor.experience_years}+ Years Experience · {doctor.languages?.join(', ') || 'English, Malayalam'}</p>
        </div>
      </div>

      {/* Info area */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-700">{Number(doctor.rating || 4.9).toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 font-semibold">({doctor.review_count || 120} reviews)</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href={`/consult/${doctor.id}`}
            className="flex h-10 items-center justify-center rounded-xl border border-bloom-200 bg-white text-xs font-bold text-bloom-700 transition hover:bg-bloom-50 active:scale-[0.98]"
          >
            View Profile
          </Link>
          <Link
            href={`/consult/${doctor.id}/book`}
            className="flex h-10 items-center justify-center rounded-xl bg-bloom-gradient text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
