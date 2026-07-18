'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Globe, CreditCard, Video, MessageCircle, Calendar, Share2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBooking, setHasBooking] = useState(false);

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

    // Check if user has an active booking with this doctor
    apiFetch('/appointments')
      .then(res => {
        const doctorAppts = (res.appointments || []).filter(
          (a: any) => a.doctor_id === params.id && ['pending', 'confirmed', 'rescheduled'].includes(a.status)
        );
        setHasBooking(doctorAppts.length > 0);
      })
      .catch(console.error);
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
    <div className="pb-28">
      {/* Doctor hero image */}
      <div className="relative h-64 overflow-hidden">
        {doctor.users?.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={doctor.users.avatar_url}
            alt={doctor.users?.full_name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-bloom-300 via-bloom-200 to-lavender-200 flex items-center justify-center pb-12">
            <span className="text-5xl font-extrabold text-bloom-800 tracking-wider">
              {doctor.users?.full_name 
                ? doctor.users.full_name.replace(/^(Dr\.|Dr)\s+/i, '').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
                : 'DR'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back + Share buttons */}
        <div className="absolute top-5 left-0 right-0 flex items-center justify-between px-5">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
            <Share2 className="h-4 w-4 text-slate-700" />
          </button>
        </div>

        {/* Doctor info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-xl font-bold text-white">{doctor.users?.full_name}</h1>
          <p className="text-sm text-white/90 font-medium mt-0.5">{doctor.specialty}</p>
          <p className="text-xs text-white/70 mt-0.5">{doctor.experience_years}+ Years Experience</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-white">{Number(doctor.rating || 4.9).toFixed(1)}</span>
            </div>
            <span className="text-xs text-white/70">{doctor.review_count || 312} reviews</span>
          </div>
        </div>
      </div>

      {/* About Doctor */}
      <section className="px-5 pt-5">
        <h2 className="text-base font-bold text-slate-800">About Doctor</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {doctor.about || 'Experienced Gynecologist & IVF Specialist providing compassionate care for women at every stage of life.'}
        </p>
      </section>

      {/* Consultation Details */}
      <section className="px-5 pt-5">
        <h2 className="text-base font-bold text-slate-800">Consultation Details</h2>
        <div className="mt-3 rounded-3xl bg-white p-4 shadow-bloom-card border border-bloom-100/60 space-y-3">
          <DetailRow
            icon={Globe}
            label="Languages"
            value={doctor.languages?.join(', ') || 'English, Malayalam'}
          />
          <div className="h-px bg-bloom-50" />
          <DetailRow
            icon={CreditCard}
            label="Consultation Fee"
            value={doctor.consultation_fee || 'Included in Membership'}
          />
          <div className="h-px bg-bloom-50" />
          <DetailRow
            icon={Video}
            label="Consultation Type"
            value={doctor.consultation_type || 'Video Consultation'}
          />
          {doctor.current_workplace && (
            <>
              <div className="h-px bg-bloom-50" />
              <DetailRow icon={Calendar} label="Current Workplace" value={doctor.current_workplace} />
            </>
          )}
        </div>
      </section>

      {/* Action buttons - fixed at bottom */}
      <section className="px-5 pt-6 space-y-3">
        <button
          onClick={() => router.push(`/consult/${doctor.id}/book`)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-bloom-gradient text-base font-semibold text-white shadow-bloom-btn transition-all hover:brightness-105 active:scale-[0.98]"
        >
          Book Consultation
        </button>
        {hasBooking && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push(`/chat/${doctor.users?.id || doctor.user_id}?reschedule=true`)}
              className="flex h-12 items-center justify-center gap-1.5 rounded-full border-2 border-bloom-200 bg-white text-xs font-semibold text-bloom-700 transition hover:bg-bloom-50"
            >
              <Calendar className="h-4 w-4" /> Reschedule
            </button>
            <button
              onClick={() => router.push(`/chat/${doctor.users?.id || doctor.user_id}`)}
              className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-bloom-gradient text-xs font-semibold text-white shadow-sm hover:opacity-95"
            >
              <MessageCircle className="h-4 w-4" /> Chat Now
            </button>
          </div>
        )}
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
        <Icon className="h-4 w-4 text-bloom-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}
