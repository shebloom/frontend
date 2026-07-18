'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  Edit2,
  Check,
  X,
  Camera,
  User,
  Mail,
  Weight,
  Ruler,
  Droplets,
  Phone,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Clock,
  FileCheck,
  UserX,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, user, signOut, refreshProfile } = useAuth();

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  
  const [doctorAbout, setDoctorAbout] = useState('');
  const [currentWorkplace, setCurrentWorkplace] = useState('');
  const [previousWorkplace, setPreviousWorkplace] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [degrees, setDegrees] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [hasDoctorProfile, setHasDoctorProfile] = useState(false);

  // File input ref for avatar
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consultation History
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Doctor Analytics State
  const [analyticsRange, setAnalyticsRange] = useState<'week' | '2 weeks' | 'month' | '4 months'>('month');
  const [analyticsData, setAnalyticsData] = useState<any>({
    total_completed_all_time: 0,
    total_completed_in_range: 0,
    unique_patients_in_range: 0,
    chart_data: []
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (profile?.role === 'doctor') {
      setLoadingAnalytics(true);
      apiFetch(`/doctor-portal/analytics?range=${encodeURIComponent(analyticsRange)}`)
        .then(res => {
          setAnalyticsData(res);
        })
        .catch(err => console.error("Error fetching analytics", err))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [profile, analyticsRange]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const endpoint = profile?.role === 'doctor' ? '/doctor-portal/appointments' : '/appointments';
        const res = await apiFetch(endpoint);
        setAppointments(res.appointments || []);
      } catch (err) {
        console.error('Failed to load appointments', err);
      } finally {
        setLoadingAppointments(false);
      }
    }
    if (profile) {
      loadHistory();
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone((profile as any).phone || '');
      setDob((profile as any).date_of_birth || '');
      setWeightKg(profile.weight_kg?.toString() || '');
      setHeightCm(profile.height_cm?.toString() || '');
      setBloodGroup(profile.blood_group || '');

      // If doctor, fetch doctor profile details
      if (profile.role === 'doctor') {
        apiFetch('/doctor-portal/profile').then(res => {
          if (res.doctor) {
            setHasDoctorProfile(true);
            setDoctorAbout(res.doctor.about || '');
            setCurrentWorkplace(res.doctor.current_workplace || '');
            setPreviousWorkplace(res.doctor.previous_workplace || '');
            setSpecialties(res.doctor.specialties || []);
            setDegrees(res.doctor.degrees || []);
            setUniversities(res.doctor.universities || []);
          }
        }).catch(err => console.error("Error fetching doctor profile", err));
      }
    }
  }, [profile]);

  const computedBmi =
    profile?.weight_kg && profile?.height_cm
      ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
      : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        full_name: fullName || null,
        phone: phone || null,
        date_of_birth: dob || null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        blood_group: bloodGroup || null,
      };
      
      if (avatarBase64) {
        payload.avatar_url = avatarBase64;
      }

      await apiFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      // If doctor, also save doctor details
      if (profile?.role === 'doctor' && hasDoctorProfile) {
        await apiFetch('/doctor-portal/profile', {
          method: 'PATCH',
          body: JSON.stringify({
            about: doctorAbout,
            current_workplace: currentWorkplace,
            previous_workplace: previousWorkplace,
            specialties,
            degrees,
            universities,
          }),
        });
      }

      await refreshProfile();
      setIsEditing(false);
      setSuccessMsg('Profile updated! ✓');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setSuccessMsg('');
      alert(`Failed to save profile: ${err?.message || 'Please try again.'}`); 
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete your account? This will delete all your data including health records, chat messages, and cycle logs. This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      await apiFetch('/auth/me', { method: 'DELETE' });
      await signOut();
      router.push('/');
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    }
  };

  const fallbackName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') : 'User');
  const rawName = profile?.full_name || fallbackName;
  const firstName = rawName.trim().split(/\s+/)[0];
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'User';
  const displayRole = profile?.role === 'doctor' ? 'Doctor' : profile?.role === 'admin' ? 'Admin' : 'Member';

  const initials = (profile?.full_name || fallbackName)
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-lavender-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4 shadow-sm border-b border-bloom-100">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-bloom-50">
          <ArrowLeft className="h-5 w-5 text-bloom-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-bloom-50"
          >
            <Edit2 className="h-5 w-5 text-bloom-700" />
          </button>
        ) : (
          <button
            onClick={() => { setIsEditing(false); }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50"
          >
            <X className="h-5 w-5 text-red-500" />
          </button>
        )}
      </header>

      <main className="mx-auto max-w-[414px] px-5 py-6 space-y-5">

        {/* Success Message */}
        {successMsg && (
          <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
            {successMsg}
          </div>
        )}

        {/* Avatar Card */}
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm border border-bloom-100">
          <div className="relative">
            <div className="h-24 w-24 rounded-full ring-4 ring-bloom-200 overflow-hidden bg-bloom-100 flex items-center justify-center">
              {avatarBase64 || profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarBase64 || profile?.avatar_url || undefined} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-bloom-600">{initials}</span>
              )}
            </div>
            {isEditing && (
              <>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-bloom-600 border-2 border-white flex items-center justify-center shadow-md active:scale-95 transition"
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </>
            )}
          </div>

          {isEditing ? (
            <div className="w-full">
              <label className="mb-1 block text-xs font-semibold text-slate-500">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-bloom-300"
              />
            </div>
          ) : (
            <>
              <p className="text-xl font-bold text-slate-800 capitalize">{displayName}</p>
              <p className="text-sm text-slate-400 capitalize">{displayRole}</p>
              {profile?.doctor_application_status === 'pending' && (
                <div className="mt-3 w-full flex items-center gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">Profile under verification</p>
                    {profile.rejection_count > 0 ? (
                      <p className="text-xs text-amber-600/80">Under verification. {3 - profile.rejection_count} attempts remaining.</p>
                    ) : (
                      <p className="text-xs text-amber-600/80">Under review by admin</p>
                    )}
                  </div>
                </div>
              )}
              {profile?.doctor_application_status === 'rejected' && (
                <div className="mt-3 w-full flex flex-col gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Application Rejected</p>
                      <p className="text-xs text-red-600/80">Verification failed</p>
                    </div>
                  </div>
                  {(profile?.rejection_count || 0) < 3 ? (
                    <div className="mt-2 flex items-center justify-between border-t border-red-200/50 pt-2">
                      <p className="text-[10px] text-red-600 font-medium">Attempts remaining: {3 - (profile.rejection_count || 0)}</p>
                      <Link href="/onboarding" className="text-xs font-semibold text-red-700 bg-red-100/50 px-3 py-1.5 rounded-full hover:bg-red-200 transition">
                        Re-apply Now
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-1 text-[10px] text-red-600 font-medium border-t border-red-200/50 pt-2">Maximum attempts reached. Please contact support.</p>
                  )}
                </div>
              )}
              {profile?.doctor_application_status === 'approved' && profile?.role === 'doctor' && (
                <div className="mt-3 w-full flex items-center gap-2.5 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <FileCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs font-semibold text-green-700">Verified Doctor ✓</p>
                </div>
              )}
              {profile?.doctor_application_status === 'rejected' && (
                <div className="mt-3 w-full flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-xs font-semibold text-red-700">Application was not approved. Please contact support for details.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-bloom-100 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact</p>

          <InfoRow icon={Mail} label="Email" value={user?.email || '--'} />

          {isEditing ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-bloom-300"
              />
            </div>
          ) : (
            <InfoRow icon={Phone} label="Phone" value={(profile as any)?.phone || 'Not set'} />
          )}

          {isEditing ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-bloom-300"
              />
            </div>
          ) : (
            <InfoRow
              icon={User}
              label="Date of Birth"
              value={(profile as any)?.date_of_birth
                ? new Date((profile as any).date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Not set'}
            />
          )}
        </div>

        {/* Health Metrics */}
        {profile?.role !== 'doctor' && (
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-bloom-100 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Metrics</p>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="60"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="165"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
                  >
                    <option value="">Select...</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={Weight} label="Weight" value={profile?.weight_kg ? `${profile.weight_kg} kg` : '--'} />
                <MetricCard icon={Ruler} label="Height" value={profile?.height_cm ? `${profile.height_cm} cm` : '--'} />
                <MetricCard icon={User} label="BMI" value={computedBmi || '--'} />
                <MetricCard icon={Droplets} label="Blood Group" value={profile?.blood_group || '--'} />
              </div>
            )}
          </div>
        )}

        {/* Doctor Analytics */}
        {profile?.role === 'doctor' && (
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-bloom-100 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation Analytics</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bloom-50 rounded-2xl p-4 border border-bloom-100">
                <p className="text-2xl font-black text-bloom-700">{analyticsData.total_completed_all_time}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Completed (All Time)</p>
              </div>
              <div className="bg-petal-50 rounded-2xl p-4 border border-petal-100">
                <p className="text-2xl font-black text-petal-700">{analyticsData.unique_patients_in_range}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Unique Patients (In Range)</p>
              </div>
            </div>

            {/* Range Selector */}
            <div className="flex bg-slate-100 rounded-xl p-1 justify-between">
              {(['week', '2 weeks', 'month', '4 months'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAnalyticsRange(r)}
                  className={cn(
                    "flex-1 text-[10px] font-bold py-1.5 rounded-lg capitalize transition",
                    analyticsRange === r
                      ? "bg-white text-bloom-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {r === 'week' ? '1 W' : r === '2 weeks' ? '2 W' : r === 'month' ? '1 M' : '4 M'}
                </button>
              ))}
            </div>

            {/* SVG Chart */}
            <div className="pt-2">
              {loadingAnalytics ? (
                <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-semibold">
                  Loading chart...
                </div>
              ) : analyticsData.chart_data?.length > 0 ? (
                <div>
                  {/* Legend */}
                  <div className="flex gap-4 justify-end text-[9px] font-bold mb-3">
                    <div className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-bloom-600"></span>
                      <span className="text-slate-500 text-[8px]">Consultations</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-petal-500"></span>
                      <span className="text-slate-500 text-[8px]">Patients</span>
                    </div>
                  </div>

                  {/* SVG container */}
                  <div className="relative w-full h-40 flex items-end justify-between border-b border-slate-200 pb-1 px-2">
                    {(() => {
                      const chartPoints = analyticsData.chart_data;
                      const maxVal = Math.max(...chartPoints.map((p: any) => Math.max(p.consultations, p.patients)), 1);
                      return chartPoints.map((p: any, idx: number) => {
                        const hCons = Math.max(4, (p.consultations / maxVal) * 110); // max height 110px
                        const hPts = Math.max(4, (p.patients / maxVal) * 110);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-0">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap shadow">
                              {p.label}: {p.consultations} appts, {p.patients} patients
                            </div>
                            
                            {/* Bar pair */}
                            <div className="flex items-end gap-0.5 justify-center w-full">
                              <div 
                                className="w-1.5 rounded-t-sm bg-bloom-600 group-hover:brightness-105 transition-all duration-300"
                                style={{ height: `${hCons}px` }}
                              />
                              <div 
                                className="w-1.5 rounded-t-sm bg-petal-500 group-hover:brightness-105 transition-all duration-300"
                                style={{ height: `${hPts}px` }}
                              />
                            </div>

                            {/* Label */}
                            <span className="text-[7px] text-slate-400 mt-1.5 truncate max-w-[28px] font-medium leading-none">
                              {p.label}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 font-medium">
                  No consultation data available.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doctor Details */}
        {profile?.role === 'doctor' && (
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-bloom-100 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Details</p>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">About You</label>
                  <textarea
                    value={doctorAbout}
                    onChange={(e) => setDoctorAbout(e.target.value)}
                    placeholder="Brief description of your expertise..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300 resize-none h-24"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Current Workplace</label>
                  <input
                    type="text"
                    value={currentWorkplace}
                    onChange={(e) => setCurrentWorkplace(e.target.value)}
                    placeholder="e.g. Apollo Hospitals"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Previous Workplace</label>
                  <input
                    type="text"
                    value={previousWorkplace}
                    onChange={(e) => setPreviousWorkplace(e.target.value)}
                    placeholder="e.g. Max Healthcare"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
                  />
                </div>

                {/* Tag Editors */}
                {/* Specialties */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Specialties</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {specialties.map(s => (
                      <span key={s} className="bg-bloom-100 text-bloom-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        {s} <button type="button" onClick={() => setSpecialties(prev => prev.filter(i => i !== s))}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !specialties.includes(val)) setSpecialties([...specialties, val]);
                        e.target.value = '';
                      }}
                    >
                      <option value="">+ Add Specialty...</option>
                      {['General Gynecology', 'Obstetrics', 'IVF & Fertility', 'Menopause Management', 'PCOS Specialist', 'Gynecologic Oncology'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or type custom..."
                      className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val && !specialties.includes(val)) setSpecialties([...specialties, val]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Degrees */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Degrees</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {degrees.map(d => (
                      <span key={d} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        {d} <button type="button" onClick={() => setDegrees(prev => prev.filter(i => i !== d))}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !degrees.includes(val)) setDegrees([...degrees, val]);
                        e.target.value = '';
                      }}
                    >
                      <option value="">+ Add Degree...</option>
                      {['MBBS', 'MD', 'MS', 'DNB', 'FRCOG'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or type custom..."
                      className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val && !degrees.includes(val)) setDegrees([...degrees, val]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Universities */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Universities</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {universities.map(u => (
                      <span key={u} className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        {u} <button type="button" onClick={() => setUniversities(prev => prev.filter(i => i !== u))}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !universities.includes(val)) setUniversities([...universities, val]);
                        e.target.value = '';
                      }}
                    >
                      <option value="">+ Add University...</option>
                      {['AIIMS', 'CMC Vellore', 'JIPMER', 'PGIMER', 'AFMC', 'MAMC'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or type custom..."
                      className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val && !universities.includes(val)) setUniversities([...universities, val]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                <InfoRow icon={FileCheck} label="About" value={doctorAbout || 'Please edit profile to add details'} />
                <InfoRow icon={Clock} label="Current Workplace" value={currentWorkplace || 'Not specified'} />
                <InfoRow icon={Clock} label="Previous Workplace" value={previousWorkplace || 'Not specified'} />
                
                {specialties.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-2"><Star className="h-4 w-4" /> Specialties</label>
                    <div className="flex flex-wrap gap-1.5">
                      {specialties.map(s => <span key={s} className="bg-bloom-100 text-bloom-700 px-2 py-0.5 rounded-md text-[10px] font-bold">{s}</span>)}
                    </div>
                  </div>
                )}
                {degrees.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-2"><FileCheck className="h-4 w-4" /> Degrees</label>
                    <div className="flex flex-wrap gap-1.5">
                      {degrees.map(d => <span key={d} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold">{d}</span>)}
                    </div>
                  </div>
                )}
                {universities.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-2"><Settings className="h-4 w-4" /> Universities</label>
                    <div className="flex flex-wrap gap-1.5">
                      {universities.map(u => <span key={u} className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-bold">{u}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Consultation History */}
        {!isEditing && (
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-bloom-100 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation History</p>
            
            {loadingAppointments ? (
              <p className="text-sm text-slate-400">Loading history...</p>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                You haven't had any consultations yet. 
                <br /><Link href="/consult" className="text-bloom-600 font-semibold mt-1 inline-block">Book one now</Link>
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map(appt => {
                  const isDoc = profile?.role === 'doctor';
                  const otherParty = isDoc ? appt.users : appt.doctors?.users;
                  const partyLabel = isDoc ? 'Patient' : 'Doctor';
                  return (
                    <div key={appt.id} className="flex gap-3 p-3 rounded-2xl border border-bloom-50 bg-slate-50">
                      <div className="h-12 w-12 rounded-xl bg-bloom-100 overflow-hidden shrink-0 border border-bloom-200 flex items-center justify-center">
                        {otherParty?.avatar_url ? (
                          <img 
                            src={otherParty.avatar_url} 
                            alt={partyLabel} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <span className="text-xl font-bold text-bloom-600">{otherParty?.full_name?.[0]?.toUpperCase() || partyLabel[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {otherParty?.full_name || partyLabel}
                        </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {appt.slot_time}
                      </p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] font-semibold uppercase bg-bloom-100 text-bloom-700 px-2 py-0.5 rounded-full">
                          {appt.consultation_type}
                        </span>
                        <span className={cn(
                          "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                          appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                          appt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        )}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-bloom-gradient text-base font-bold text-white shadow-bloom-btn disabled:opacity-70 active:scale-[0.98] transition-transform mt-6"
          >
            <Check className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        )}

        {/* Quick links */}
        <div className="rounded-3xl bg-white shadow-sm border border-bloom-100 overflow-hidden divide-y divide-bloom-50">
          <Link href="/profile/settings" className="flex items-center gap-3 px-5 py-4 hover:bg-bloom-50 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bloom-100">
              <Settings className="h-4 w-4 text-bloom-700" />
            </div>
            <span className="flex-1 text-sm font-semibold text-slate-700">Account Settings</span>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-3 px-5 py-4 hover:bg-bloom-50 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bloom-100">
                <ShieldCheck className="h-4 w-4 text-bloom-700" />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-700">Admin Panel</span>
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </Link>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>

        <button
          onClick={handleDeleteAccount}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-red-100 bg-white text-base font-bold text-red-500 hover:bg-red-50 transition-colors active:scale-[0.98]"
        >
          <UserX className="h-5 w-5" />
          Delete Account
        </button>
      </main>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bloom-50">
        <Icon className="h-4 w-4 text-bloom-600" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-bloom-50 p-3 border border-bloom-100">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white">
        <Icon className="h-4 w-4 text-bloom-600" />
      </div>
      <div>
        <p className="text-base font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
