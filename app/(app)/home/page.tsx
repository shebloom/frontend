'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BloomLogo, SectionHeader } from '@/components/shebloom';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';
import {
  Bell,
  MessageCircle,
  Calendar,
  Activity,
  BookOpen,
  Star,
  ChevronRight,
  Video,
  Sparkles,
} from 'lucide-react';

const quickLinks = [
  { icon: MessageCircle, label: 'Chat with Doctor', href: '/consult', color: 'bg-bloom-100' },
  { icon: Calendar,      label: 'Cycle Tracker',     href: '/cycle',    color: 'bg-petal-100' },
  { icon: Activity,      label: 'Symptoms Check',    href: '/health',   color: 'bg-green-100' },
  { icon: BookOpen,      label: 'Wellness Library',  href: '/wellness', color: 'bg-amber-100' },
];

export default function HomePage() {
  const router = useRouter();
  const { profile, user } = useAuth();
  
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const h = new Date().getHours();
    const base = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const fallbackName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') : '');
    const rawName = profile?.full_name || fallbackName;
    const parts = rawName ? rawName.trim().split(/\s+/) : [];
    let name = parts.length > 0 ? parts[0] : '';
    
    if ((name.toLowerCase() === 'dr.' || name.toLowerCase() === 'dr') && parts.length > 1) {
      name = name + ' ' + parts[1];
    }

    const capitalizedName = name ? name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
    setGreeting(capitalizedName ? `${base}, ${capitalizedName} 👋` : base);
  }, [profile, user]);

  useEffect(() => {
    async function loadData() {
      try {
        const endpoint = profile?.role === 'doctor' ? '/doctor-portal/appointments?upcoming=true' : '/appointments?upcoming=true';
        const [apptsRes, memRes] = await Promise.all([
          apiFetch(endpoint),
          apiFetch('/membership')
        ]);
        if (apptsRes.appointments?.length > 0) {
          setUpcomingAppointment(apptsRes.appointments[0]);
        }
        setMembership(memRes.membership);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (profile) {
      if (profile.role === 'admin') {
        router.replace('/admin-panel');
        return;
      }
      loadData();
    }
  }, [profile, router]);

  const consultationsUsed = membership?.consultations_used ?? 0;
  const consultationsTotal = membership?.consultations_total ?? 4;
  const consultationsLeft = Math.max(0, consultationsTotal - consultationsUsed);
  const progressPct = Math.min(100, (consultationsUsed / consultationsTotal) * 100);

  // Don't render patient home for admins (redirect is pending) or when profile not yet loaded
  if (!profile || profile.role === 'admin') return null;

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between bg-bloom-header px-5 pb-4 pt-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
            {greeting}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5 tracking-wide">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => router.push('/community')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-bloom-100 bg-white shadow-sm"
        >
          <Bell className="h-5 w-5 text-bloom-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-petal-500 ring-2 ring-white" />
        </button>
      </header>

      {/* Upcoming Appointment */}
      <section className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">Upcoming Consultation</h2>
          <Link href="/consult" className="text-xs font-bold text-bloom-600 hover:text-bloom-700">See All</Link>
        </div>
        
        <div className="rounded-3xl bg-bloom-gradient p-5 shadow-bloom-card text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-bloom-100/20">
              <img
                src={
                  profile?.role === 'doctor' 
                    ? upcomingAppointment?.users?.avatar_url 
                    : upcomingAppointment?.doctors?.users?.avatar_url || "/images/dr_deepa_avatar_pink.jpg"
                }
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Upcoming Consultation</p>
              <h3 className="truncate text-base font-bold mt-0.5">
                {profile?.role === 'doctor'
                  ? upcomingAppointment?.users?.full_name || "Patient"
                  : upcomingAppointment?.doctors?.users?.full_name || "Dr. Deepa Madhavan"}
              </h3>
              <p className="truncate text-xs text-white/80 font-medium">
                {profile?.role === 'doctor'
                  ? upcomingAppointment?.consultation_type || "Video Consultation"
                  : "Gynecologist & IVF Specialist"}
              </p>
              <p className="text-[11px] text-white/75 mt-1 font-semibold">
                {upcomingAppointment?.appointment_date 
                  ? `${new Date(upcomingAppointment.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} - ${upcomingAppointment.slot_time}`
                  : "20 May 2025 – 10:30 AM"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2.5">
            <button
              onClick={() => router.push(upcomingAppointment ? `/chat/${profile?.role === 'doctor' ? upcomingAppointment.patient_id : upcomingAppointment.doctor_id}` : '/chat')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2.5 text-xs font-bold backdrop-blur-sm transition hover:bg-white/25"
            >
              <Video className="h-4 w-4" />
              Join Call
            </button>
            <button
              onClick={() => router.push(upcomingAppointment ? `/consult/${upcomingAppointment.doctor_id}` : '/consult')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-bloom-700 transition hover:bg-white/90"
            >
              View Details
            </button>
          </div>
        </div>
      </section>

      {/* Membership Card */}
      <section className="px-5 pt-5">
        <div className="rounded-3xl bg-white p-5 shadow-bloom-card border border-bloom-100/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Your Membership</h4>
                <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                  Active until 30 May 2025
                </p>
              </div>
            </div>
            <Link href="/profile" className="text-xs font-bold text-bloom-600 hover:text-bloom-700">
              View Details
            </Link>
          </div>

          {/* Consultations progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-700">
                <span className="text-bloom-700 font-bold">{consultationsLeft}/{consultationsTotal}</span> Consultations Left
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Book anytime</span>
            </div>
            <div className="h-2 rounded-full bg-bloom-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-bloom-gradient transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-5 pt-6">
        <SectionHeader title="Quick Access" />
        <div className="mt-3 grid grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex flex-col items-center gap-2"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${link.color} transition-transform active:scale-95`}>
                  <Icon className="h-6 w-6 text-bloom-700" />
                </div>
                <span className="text-center text-[10px] font-medium leading-tight text-slate-600">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recommended for You */}
      <section className="px-5 pt-6">
        <SectionHeader
          title="Recommended for You"
          action={<Link href="/wellness" className="text-sm font-medium text-bloom-600">See all</Link>}
        />
        <Link href="/wellness" className="mt-3 block">
          <div className="relative h-40 overflow-hidden rounded-3xl shadow-bloom-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Prenatal Yoga"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bloom-900/70 via-bloom-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-xs font-medium text-white/90">Wellness Program</span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-white">Prenatal Yoga</h3>
              <p className="text-xs text-white/80">For a healthy pregnancy</p>
              <span className="mt-2 inline-flex h-8 items-center rounded-full bg-bloom-gradient px-4 text-xs font-semibold text-white shadow-bloom-btn">
                Start Now
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Daily Tip */}
      <section className="px-5 pt-6 pb-8">
        <div className="rounded-2xl bg-bloom-soft p-4 border border-bloom-100">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <Star className="h-5 w-5 text-bloom-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Daily Health Tip</h4>
              <p className="mt-1 text-xs text-slate-600">
                Staying hydrated can help reduce bloating during your cycle. Aim for 2L of water daily.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
