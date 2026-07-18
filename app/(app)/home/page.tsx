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
  Clock,
  Plus,
  Trash2,
  CalendarDays,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Weight,
  Ruler,
  Droplets,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { GradientButton } from '@/components/shebloom';
import { cn } from '@/lib/utils';

const quickLinks = [
  { icon: MessageCircle, label: 'Chat with Doctor', href: '/consult', color: 'bg-bloom-100' },
  { icon: Calendar,      label: 'Cycle Tracker',     href: '/cycle',    color: 'bg-petal-100' },
  { icon: Activity,      label: 'Symptoms Check',    href: '/health',   color: 'bg-green-100' },
  { icon: BookOpen,      label: 'Wellness Library',  href: '/wellness', color: 'bg-amber-100' },
];

const daysOfWeekList = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const timesList = Array.from({ length: 25 }).map((_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? '00' : '30';
  const hStr = h.toString().padStart(2, '0');
  return `${hStr}:${m}`;
});

export default function HomePage() {
  const router = useRouter();
  const { profile, user } = useAuth();
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');

  // Doctor Dashboard additional state
  const [previousAppointments, setPreviousAppointments] = useState<any[]>([]);
  const [activeDocTab, setActiveDocTab] = useState<'upcoming' | 'previous' | 'patients' | 'availability'>('upcoming');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<any>(null);
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<any[]>([]);
  const [loadingPatientData, setLoadingPatientData] = useState(false);

  // Doctor Availability Editor State
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');

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

  const handleOpenPatientDrawer = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setLoadingPatientData(true);
    setSelectedPatientProfile(null);
    setSelectedPatientRecords([]);
    
    try {
      const [profileRes, recordsRes] = await Promise.all([
        apiFetch(`/doctor-portal/patients/${patientId}`),
        apiFetch(`/doctor-portal/patients/${patientId}/health-records`),
      ]);
      setSelectedPatientProfile(profileRes.patient);
      setSelectedPatientRecords(recordsRes.records || []);
    } catch (err) {
      console.error('Failed to load patient records', err);
    } finally {
      setLoadingPatientData(false);
    }
  };

  const getUniquePatients = () => {
    const patientsMap: Record<string, any> = {};
    upcomingAppointments.concat(previousAppointments).forEach((appt: any) => {
      if (appt.patient_id && appt.users) {
        patientsMap[appt.patient_id] = {
          id: appt.patient_id,
          full_name: appt.users.full_name,
          avatar_url: appt.users.avatar_url,
          last_appointment_date: appt.appointment_date,
        };
      }
    });
    return Object.values(patientsMap);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const endpoint = profile?.role === 'doctor' ? '/doctor-portal/appointments' : '/appointments?upcoming=true';
        const [apptsRes, memRes] = await Promise.all([
          apiFetch(endpoint),
          apiFetch('/membership')
        ]);
        const list = apptsRes.appointments || [];
        
        if (profile?.role === 'doctor') {
          const todayStr = new Date().toISOString().split('T')[0];
          
          const upcoming = list.filter((a: any) => 
            (a.status === 'confirmed' || a.status === 'pending' || a.status === 'rescheduled') && 
            a.appointment_date >= todayStr
          );
          upcoming.sort((a: any, b: any) => a.appointment_date.localeCompare(b.appointment_date));
          setUpcomingAppointments(upcoming);
          
          const previous = list.filter((a: any) => 
            a.status === 'completed' || a.status === 'cancelled' || 
            ((a.status === 'confirmed' || a.status === 'pending' || a.status === 'rescheduled') && a.appointment_date < todayStr)
          );
          setPreviousAppointments(previous);
        } else {
          setUpcomingAppointments(list);
          if (list.length > 0) {
            setUpcomingAppointment(list[0]);
          } else {
            setUpcomingAppointment(null);
          }
        }
        
        setMembership(memRes.membership);
 
        // Load doctor availability if logged in as doctor
        if (profile?.role === 'doctor') {
          const availRes = await apiFetch('/doctor-portal/availability');
          setAvailabilitySlots(availRes.slots || []);
        }
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

  const handleAddSlot = () => {
    // Check if slot already exists
    const duplicate = availabilitySlots.find(
      s => s.day_of_week === newDay && s.start_time === newStart + ':00'
    );
    if (duplicate) {
      alert('This slot start time already exists.');
      return;
    }

    // Check if end time is after start time
    if (newStart >= newEnd) {
      alert('End time must be after start time.');
      return;
    }

    const formattedSlot = {
      day_of_week: newDay,
      start_time: newStart + ':00',
      end_time: newEnd + ':00',
    };

    setAvailabilitySlots([...availabilitySlots, formattedSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const handleSaveAvailability = async () => {
    setIsSavingAvailability(true);
    setAvailabilitySuccess('');
    try {
      await apiFetch('/doctor-portal/availability', {
        method: 'PUT',
        body: JSON.stringify({
          slots: availabilitySlots.map(s => ({
            day_of_week: s.day_of_week,
            start_time: s.start_time.substring(0, 5),
            end_time: s.end_time.substring(0, 5)
          }))
        })
      });
      setAvailabilitySuccess('Availability saved successfully!');
      setTimeout(() => setAvailabilitySuccess(''), 3000);
    } catch (err) {
      alert('Failed to save availability schedule.');
    } finally {
      setIsSavingAvailability(false);
    }
  };

  // Don't render patient home for admins (redirect is pending) or when profile not yet loaded
  if (!profile || profile.role === 'admin') return null;

  // ─── DOCTOR HOME VIEW ──────────────────────────────────────────────────────────
  if (profile.role === 'doctor') {
    const isApproved = profile.doctor_application_status === 'approved';

    return (
      <div className="pb-24">
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
          <div className="h-10 w-10 overflow-hidden rounded-full border border-bloom-100 bg-white shadow-sm flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-bloom-600" />
            )}
          </div>
        </header>

        {/* Verification Status Alert */}
        {!isApproved && (
          <section className="px-5 pt-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800">Verification Pending</h4>
                <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                  Your professional documents are currently being verified by our administrators. You will be prompted to set your consultation hours once approved.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Tabs switcher */}
        {isApproved && (
          <div className="px-5 pt-4">
            <div className="flex bg-white rounded-2xl p-1 shadow-bloom-card border border-bloom-100/50 justify-between">
              {(['upcoming', 'previous', 'patients', 'availability'] as const).map((tab) => {
                let badgeCount = 0;
                if (tab === 'upcoming') badgeCount = upcomingAppointments.length;
                else if (tab === 'previous') badgeCount = previousAppointments.length;
                else if (tab === 'patients') badgeCount = getUniquePatients().length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveDocTab(tab)}
                    className={cn(
                      "flex-1 text-[10px] font-bold py-2.5 rounded-xl capitalize transition-all flex items-center justify-center gap-1",
                      activeDocTab === tab
                        ? "bg-bloom-gradient text-white shadow-bloom-btn"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <span>{tab === 'availability' ? 'Hours' : tab}</span>
                    {badgeCount > 0 && (
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none scale-90",
                        activeDocTab === tab ? "bg-white text-bloom-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 1. UPCOMING TAB */}
        {isApproved && activeDocTab === 'upcoming' && (
          <section className="px-5 pt-6">
            {upcomingAppointments.length > 0 && <SectionHeader title="Upcoming Consultations" />}
            
            {isLoading ? (
              <p className="text-xs text-slate-400 font-medium py-4">Loading your schedule...</p>
            ) : upcomingAppointments.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 border border-slate-100 text-center shadow-bloom-card">
                <p className="text-sm font-semibold text-slate-500">You don't have any upcoming consultations.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="rounded-3xl bg-white border border-bloom-100/50 p-4 shadow-bloom-card flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bloom-100/40 border border-bloom-100 flex items-center justify-center">
                      {appt.users?.avatar_url ? (
                        <img src={appt.users.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-bloom-600">{appt.users?.full_name?.[0] || 'P'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{appt.users?.full_name || 'Patient'}</h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {new Date(appt.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} – {appt.slot_time}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] font-bold uppercase bg-bloom-100 text-bloom-700 px-2.5 py-0.5 rounded-full">
                          {appt.consultation_type}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full",
                          appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 self-center">
                      <button
                        onClick={() => handleOpenPatientDrawer(appt.patient_id)}
                        className="px-2.5 py-1.5 rounded-xl border border-bloom-100 text-bloom-600 font-bold text-[9px] hover:bg-bloom-50 bg-white"
                      >
                        Reports
                      </button>
                      <button
                        onClick={() => router.push(`/chat/${appt.patient_id}`)}
                        className="h-9 w-9 rounded-full border border-bloom-200 bg-white flex items-center justify-center text-bloom-600 hover:bg-bloom-50 shadow-sm mx-auto"
                      >
                        <MessageCircle className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. PREVIOUS TAB */}
        {isApproved && activeDocTab === 'previous' && (
          <section className="px-5 pt-6 space-y-3.5">
            {previousAppointments.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 border border-slate-100 text-center shadow-bloom-card">
                <p className="text-sm font-semibold text-slate-500">No previous consultations recorded.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {previousAppointments.map((appt) => (
                  <div key={appt.id} className="rounded-3xl bg-white border border-bloom-100/50 p-4 shadow-bloom-card flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bloom-100/40 border border-bloom-100 flex items-center justify-center">
                      {appt.users?.avatar_url ? (
                        <img src={appt.users.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-bloom-600">{appt.users?.full_name?.[0] || 'P'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{appt.users?.full_name || 'Patient'}</h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {new Date(appt.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} – {appt.slot_time}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] font-bold uppercase bg-bloom-100 text-bloom-700 px-2.5 py-0.5 rounded-full">
                          {appt.consultation_type}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full",
                          appt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenPatientDrawer(appt.patient_id)}
                      className="px-3 py-1.5 rounded-xl border border-bloom-200 bg-white text-bloom-600 font-extrabold text-[10px] hover:bg-bloom-50 shrink-0 self-center shadow-sm"
                    >
                      View Reports
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. PATIENTS TAB */}
        {isApproved && activeDocTab === 'patients' && (
          <section className="px-5 pt-6">
            {getUniquePatients().length === 0 ? (
              <div className="rounded-3xl bg-white p-6 border border-slate-100 text-center shadow-bloom-card">
                <p className="text-sm font-semibold text-slate-500">No patient records found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {getUniquePatients().map((patient: any) => (
                  <div key={patient.id} className="rounded-3xl bg-white border border-bloom-100/50 p-4 shadow-bloom-card flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bloom-100/40 border border-bloom-100 flex items-center justify-center font-bold text-bloom-600">
                        {patient.avatar_url ? (
                          <img src={patient.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{patient.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{patient.full_name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last booking: {new Date(patient.last_appointment_date).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenPatientDrawer(patient.id)}
                        className="px-3 py-1.5 rounded-xl border border-bloom-200 bg-white text-bloom-600 font-bold text-[10px] hover:bg-bloom-50 shadow-sm"
                      >
                        Case File
                      </button>
                      <button
                        onClick={() => router.push(`/chat/${patient.id}`)}
                        className="h-8 w-8 rounded-xl border border-bloom-100 bg-bloom-50 flex items-center justify-center text-bloom-700 hover:bg-bloom-100 shadow-sm"
                      >
                        <MessageCircle className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. AVAILABILITY TAB */}
        {isApproved && activeDocTab === 'availability' && (
          <section className="px-5 pt-6 animate-in fade-in duration-200">
            <div className="rounded-3xl bg-white p-5 border border-bloom-100/70 shadow-bloom-card">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-5 w-5 text-bloom-600" />
                <h3 className="text-sm font-bold text-slate-800">Set Consultation Hours</h3>
              </div>
              
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-semibold">
                Add recurring weekly availability windows. Patients will book slots within these times.
              </p>

              {/* Form elements */}
              <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Day</label>
                    <select
                      value={newDay}
                      onChange={e => setNewDay(parseInt(e.target.value))}
                      className="h-10 w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-bloom-300 font-bold"
                    >
                      {daysOfWeekList.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Start Time</label>
                    <select
                      value={newStart}
                      onChange={e => setNewStart(e.target.value)}
                      className="h-10 w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-bloom-300 font-bold"
                    >
                      {timesList.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">End Time</label>
                    <select
                      value={newEnd}
                      onChange={e => setNewEnd(e.target.value)}
                      className="h-10 w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-bloom-300 font-bold"
                    >
                      {timesList.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full h-10 bg-bloom-600 hover:bg-bloom-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Add Slot
                </button>
              </div>

              {/* Added slots list */}
              {availabilitySlots.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availabilitySlots.map((s, idx) => {
                    const dayLabel = daysOfWeekList.find(d => d.value === s.day_of_week)?.label || 'Day';
                    const displayStart = s.start_time.substring(0, 5);
                    const displayEnd = s.end_time.substring(0, 5);
                    return (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-bloom-50">
                        <span className="text-xs font-semibold text-slate-700">
                          {dayLabel}: {displayStart} – {displayEnd}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(idx)}
                          className="h-7 w-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 font-medium">No hours configured. Please add slot times above.</p>
              )}

              {availabilitySuccess && (
                <div className="mt-3 text-[11px] font-semibold text-green-600 bg-green-50 p-2.5 rounded-xl border border-green-100 flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {availabilitySuccess}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAvailability}
                disabled={isSavingAvailability}
                className="w-full h-11 bg-bloom-gradient text-white text-xs font-bold rounded-xl mt-4 shadow-bloom-btn transition active:scale-95 flex items-center justify-center"
              >
                {isSavingAvailability ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </section>
        )}

        {/* Patient Profile Drawer Modal */}
        {selectedPatientId && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[420px] rounded-[32px] shadow-2xl border border-bloom-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-bloom-50 bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Patient Case File</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Medical History & Vitals</p>
                </div>
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {loadingPatientData ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <div className="h-8 w-8 rounded-full border-4 border-bloom-200 border-t-bloom-600 animate-spin" />
                    <p className="text-xs font-semibold text-slate-400">Loading patient records...</p>
                  </div>
                ) : selectedPatientProfile ? (
                  <>
                    {/* Basic Profile */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="h-16 w-16 rounded-2xl bg-bloom-100 flex items-center justify-center font-bold text-bloom-600 text-xl border border-bloom-200 shrink-0 overflow-hidden">
                        {selectedPatientProfile.avatar_url ? (
                          <img src={selectedPatientProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{selectedPatientProfile.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-800 truncate">{selectedPatientProfile.full_name}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{selectedPatientProfile.email}</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{selectedPatientProfile.phone || 'No phone verified'}</p>
                      </div>
                    </div>

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-bloom-50/50 rounded-2xl p-3.5 border border-bloom-100 flex flex-col items-center">
                        <Weight className="h-5 w-5 text-bloom-600" />
                        <span className="text-sm font-black text-slate-800 mt-1">{selectedPatientProfile.weight_kg ? `${selectedPatientProfile.weight_kg} kg` : '--'}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Weight</span>
                      </div>
                      <div className="bg-bloom-50/50 rounded-2xl p-3.5 border border-bloom-100 flex flex-col items-center">
                        <Ruler className="h-5 w-5 text-bloom-600" />
                        <span className="text-sm font-black text-slate-800 mt-1">{selectedPatientProfile.height_cm ? `${selectedPatientProfile.height_cm} cm` : '--'}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Height</span>
                      </div>
                      <div className="bg-bloom-50/50 rounded-2xl p-3.5 border border-bloom-100 flex flex-col items-center">
                        <User className="h-5 w-5 text-bloom-600" />
                        <span className="text-sm font-black text-slate-800 mt-1">
                          {selectedPatientProfile.weight_kg && selectedPatientProfile.height_cm
                            ? (selectedPatientProfile.weight_kg / Math.pow(selectedPatientProfile.height_cm / 100, 2)).toFixed(1)
                            : '--'}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">BMI</span>
                      </div>
                      <div className="bg-bloom-50/50 rounded-2xl p-3.5 border border-bloom-100 flex flex-col items-center">
                        <Droplets className="h-5 w-5 text-bloom-600" />
                        <span className="text-sm font-black text-slate-800 mt-1">{selectedPatientProfile.blood_group || '--'}</span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Blood Group</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 font-semibold space-y-2 pt-2 border-t border-slate-100">
                      <p>Date of Birth: <span className="text-slate-800 font-bold">{selectedPatientProfile.date_of_birth ? new Date(selectedPatientProfile.date_of_birth).toLocaleDateString('en-GB') : 'Not set'}</span></p>
                    </div>

                    {/* Medical Reports */}
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uploaded Reports & Documents</p>
                      {selectedPatientRecords.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPatientRecords.map((rec: any) => {
                            const filename = rec.file_url?.split('/').pop() || 'report.pdf';
                            const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/doctor-portal/patients/${selectedPatientId}/documents/${filename}`;
                            return (
                              <div key={rec.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                                <FileText className="h-5 w-5 text-bloom-600 shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-bold text-slate-700 truncate">{rec.file_name || rec.record_type}</p>
                                  <p className="text-[9px] text-slate-400 font-semibold">{new Date(rec.record_date).toLocaleDateString('en-GB')}</p>
                                </div>
                                {rec.file_url && (
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={filename}
                                    className="h-8 w-8 rounded-xl hover:bg-bloom-100 flex items-center justify-center text-bloom-600 shrink-0 border border-bloom-50 bg-white"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl font-semibold">No medical records uploaded by this patient.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Patient details could not be loaded.</p>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 shrink-0">
                <GradientButton onClick={() => setSelectedPatientId(null)} fullWidth>Close Case File</GradientButton>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── PATIENT HOME VIEW ──────────────────────────────────────────────────────────
  const consultationsLeft = membership?.consultations_remaining ?? 3;
  const consultationsTotal = membership?.consultations_total ?? 3;
  const consultationsUsed = Math.max(0, consultationsTotal - consultationsLeft);
  const progressPct = Math.min(100, (consultationsUsed / consultationsTotal) * 100);

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

      {/* Dedicated Upcoming Consultation Section */}
      <section className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">Upcoming Consultation</h2>
          {upcomingAppointment && (
            <Link href="/consult" className="text-xs font-bold text-bloom-600 hover:text-bloom-700">See All</Link>
          )}
        </div>
        
        {upcomingAppointment ? (
          <div className="rounded-3xl bg-bloom-gradient p-5 shadow-bloom-card text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-bloom-100/20">
                {upcomingAppointment?.doctors?.users?.avatar_url ? (
                  <img
                    src={upcomingAppointment.doctors.users.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-bloom-300 to-lavender-200 flex items-center justify-center text-bloom-900 font-extrabold text-sm tracking-wider">
                    {upcomingAppointment?.doctors?.users?.full_name 
                      ? upcomingAppointment.doctors.users.full_name.replace(/^(Dr\.|Dr)\s+/i, '').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
                      : 'DR'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Upcoming Consultation</p>
                <h3 className="truncate text-base font-bold mt-0.5">
                  {upcomingAppointment?.doctors?.users?.full_name || "Dr. Deepa Madhavan"}
                </h3>
                <p className="truncate text-xs text-white/80 font-medium">
                  {upcomingAppointment?.doctors?.specialty || "Gynecologist & IVF Specialist"}
                </p>
                <p className="text-[11px] text-white/75 mt-1 font-semibold">
                  {upcomingAppointment?.appointment_date 
                    ? `${new Date(upcomingAppointment.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} - ${upcomingAppointment.slot_time}`
                    : ""}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2.5">
              <button
                onClick={() => router.push(`/chat/${upcomingAppointment.doctors?.users?.id || upcomingAppointment.doctor_id}`)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2.5 text-xs font-bold backdrop-blur-sm transition hover:bg-white/25"
              >
                <Video className="h-4 w-4" />
                Join Call
              </button>
              <button
                onClick={() => router.push(`/consult/${upcomingAppointment.doctor_id}`)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-bloom-700 transition hover:bg-white/90"
              >
                View Details
              </button>
            </div>
          </div>
        ) : (
          /* Wellness Program Promo / CTA Card in same section if no booking exists */
          <Link href="/wellness" className="block">
            <div className="relative h-44 overflow-hidden rounded-3xl shadow-bloom-card border border-bloom-100">
              <img
                src="https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="PCOS Care Program"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bloom-950/80 via-bloom-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Wellness Promotion</span>
                </div>
                <h3 className="mt-1 text-base font-extrabold text-white">Join Our PCOS Care Program</h3>
                <p className="text-xs text-white/80 leading-normal mt-0.5 max-w-[280px]">Balance hormones, control symptoms, and thrive with expert nutrition guidance.</p>
                <span className="mt-3 inline-flex h-8 items-center rounded-full bg-bloom-gradient px-4 text-[10px] font-bold text-white shadow-bloom-btn">
                  Explore Programs
                </span>
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* Membership Card with Dynamic Expiry and Free Consultations */}
      <section className="px-5 pt-5">
        <div className="rounded-3xl bg-white p-5 shadow-bloom-card border border-bloom-100/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {membership?.plan === 'free_tier' ? 'Free Trial Membership' : 'Your Membership'}
                </h4>
                <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                  Active until {membership?.current_period_end 
                    ? new Date(membership.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Loading...'}
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
                <span className="text-bloom-700 font-bold">{consultationsLeft}/{consultationsTotal}</span> Free Consultations Left
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
