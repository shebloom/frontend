'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const filters = ['All', 'Gynecologist', 'IVF Specialist', 'Fertility Expert'] as const;
type Filter = (typeof filters)[number];

export default function ConsultPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const queryParams = new URLSearchParams();
        if (activeFilter !== 'All') queryParams.append('category', activeFilter);
        if (search) queryParams.append('search', search);

        const res = await apiFetch(`/doctors?${queryParams.toString()}`);
        setDoctors(res.doctors || []);
      } catch (err) {
        console.error('Failed to load doctors', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce the search
    const timer = setTimeout(() => {
      loadDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [activeFilter, search]);

  return (
    <div>
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800">Find Your Doctor</h1>
        <p className="mt-0.5 text-sm text-slate-500">Consult with expert gynecologists</p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialty"
            className="h-12 w-full rounded-xl border border-bloom-100 bg-white pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-bloom-300 focus:outline-none focus:ring-2 focus:ring-bloom-200"
          />
        </div>

        {/* Filter tabs */}
        <div className="mt-3 flex flex-wrap gap-2">
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

      {/* Doctor list */}
      <section className="px-5 pt-5">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading doctors...</p>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} available
            </p>

            <div className="mt-3 flex flex-col gap-3">
              {doctors.map((doc) => (
                <DoctorListCard key={doc.id} doctor={doc} />
              ))}
            </div>

            {doctors.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-400">No doctors found matching your search.</p>
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
    <div
      className="rounded-3xl bg-white p-4 shadow-bloom-card border border-bloom-100/60"
    >
      <div className="flex items-start gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-bloom-100">
          <img 
            src={doctor.users?.avatar_url || "/images/doctor_deepa.png"} 
            alt={doctor.users?.full_name || "Doctor"} 
            className="h-full w-full object-cover" 
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-800">{doctor.users?.full_name}</h3>
          <p className="truncate text-xs font-semibold text-bloom-600 mt-0.5">{doctor.specialty}</p>
          <p className="mt-0.5 text-xs text-slate-400 font-medium">{doctor.experience_years} Years Experience · {doctor.languages?.join(', ') || 'English'}</p>

          <div className="mt-1.5 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-700">{Number(doctor.rating || 4.9).toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-semibold">({doctor.review_count || 120})</span>
            <span className="ml-auto text-xs font-bold text-slate-700">${doctor.consultation_fee || 150} / hr</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-bloom-50">
        <Link
          href={`/consult/${doctor.id}`}
          className="flex h-9 items-center justify-center rounded-xl border border-bloom-200 bg-white text-xs font-bold text-bloom-700 transition hover:bg-bloom-50 active:scale-[0.98]"
        >
          View Profile
        </Link>
        <Link
          href={`/consult/${doctor.id}/book`}
          className="flex h-9 items-center justify-center rounded-xl bg-bloom-gradient text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
