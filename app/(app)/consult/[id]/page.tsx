'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Globe, CreditCard, Video, MessageCircle, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDoctor() {
      try {
        const res = await apiFetch(`/doctors/${params.id}`);
        setDoctor(res.doctor);
      } catch (err) {
        console.error('Failed to load doctor', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDoctor();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center px-5 pt-20 text-center">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center px-5 pt-20 text-center">
        <p className="text-sm text-slate-500">Doctor not found.</p>
        <Link href="/consult" className="mt-3 text-sm font-medium text-bloom-600">
          Back to doctors
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div className="px-5 pt-5">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-bloom-card border border-bloom-100"
        >
          <ArrowLeft className="h-5 w-5 text-bloom-700" />
        </button>
      </div>

      {/* Doctor header */}
      <section className="px-5 pt-4">
        <div className="flex flex-col items-center rounded-3xl bg-white p-6 shadow-bloom-card border border-bloom-100/60">
          <div className="h-28 w-28 overflow-hidden rounded-3xl bg-bloom-100 ring-4 ring-bloom-50">
            {doctor.users?.avatar_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={doctor.users.avatar_url} alt={doctor.users.full_name} className="h-full w-full object-cover" />
            )}
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-800">{doctor.users?.full_name}</h1>
          <p className="mt-1 text-sm text-slate-500">{doctor.specialty}</p>
          <p className="mt-0.5 text-xs text-slate-400">{doctor.experience_years} years experience</p>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-amber-700">{Number(doctor.rating).toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-400">{doctor.review_count} reviews</span>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-5 pt-5">
        <h2 className="text-base font-semibold text-slate-800">About</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{doctor.about}</p>
      </section>

      {/* Consultation Details */}
      <section className="px-5 pt-5">
        <h2 className="text-base font-semibold text-slate-800">Consultation Details</h2>
        <div className="mt-3 space-y-3 rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60">
          <DetailRow icon={Globe} label="Languages" value={doctor.languages?.join(', ')} />
          <div className="h-px bg-bloom-50" />
          <DetailRow icon={CreditCard} label="Fee" value={`$${doctor.consultation_fee}`} />
          <div className="h-px bg-bloom-50" />
          <DetailRow icon={Video} label="Type" value={doctor.consultation_type} />
          {doctor.current_workplace && (
            <>
              <div className="h-px bg-bloom-50" />
              <DetailRow icon={Calendar} label="Current Workplace" value={doctor.current_workplace} />
            </>
          )}
          {doctor.previous_workplace && (
            <>
              <div className="h-px bg-bloom-50" />
              <DetailRow icon={Calendar} label="Previous Workplace" value={doctor.previous_workplace} />
            </>
          )}
        </div>
      </section>

      {/* Next available slot - skipping for now, needs booking flow logic which is the next step */}

      {/* Action buttons */}
      <section className="px-5 pt-6 pb-4">
        <button
          onClick={() => router.push(`/consult/${doctor.id}/book`)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-bloom-gradient text-base font-semibold text-white shadow-bloom-btn transition-all hover:brightness-105 active:scale-[0.98]"
        >
          <Video className="h-5 w-5" />
          Book Consultation
        </button>
        <Link
          href={`/chat/${doctor.id}`}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-bloom-200 bg-white text-sm font-semibold text-bloom-700 transition-all hover:bg-bloom-50 active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" />
          Chat with Doctor
        </Link>
      </section>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bloom-50">
        <Icon className="h-4.5 w-4.5 text-bloom-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 capitalize">{value}</p>
      </div>
    </div>
  );
}
