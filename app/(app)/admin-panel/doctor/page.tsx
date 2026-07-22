'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  User,
  Save,
  ArrowLeft,
  X,
  Apple,
  Edit2
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DoctorManagementPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [about, setAbout] = useState('');

  // Slot Management State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('10:00');

  // Booked slot protection modal state
  const [bookedModalData, setBookedModalData] = useState<any>(null);
  const [cancellingAppt, setCancellingAppt] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Patient Diet Plan customization states
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [loadingDiets, setLoadingDiets] = useState(false);
  const [editingDietPlan, setEditingDietPlan] = useState<any>(null);

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editBreakfast, setEditBreakfast] = useState('');
  const [editBreakfastAlt, setEditBreakfastAlt] = useState('');
  const [editLunch, setEditLunch] = useState('');
  const [editLunchAlt, setEditLunchAlt] = useState('');
  const [editSnack, setEditSnack] = useState('');
  const [editSnackAlt, setEditSnackAlt] = useState('');
  const [editDinner, setEditDinner] = useState('');
  const [editDinnerAlt, setEditDinnerAlt] = useState('');
  const [editGuidelines, setEditGuidelines] = useState('');
  const [savingDiet, setSavingDiet] = useState(false);

  // Generate date options
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    if (!isLoading && profile?.role !== 'admin' && profile?.role !== 'doctor') {
      router.replace('/home');
    }
  }, [isLoading, profile, router]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/doctors');
      if (res.doctors && res.doctors.length > 0) {
        const d = res.doctors[0];
        setDoctor(d);
        setFullName(d.users?.full_name || 'Dr. Deepa Madhavan');
        setSpecialty(d.specialty || 'Obstetrics & Gynecology (OB/GYN)');
        setExperience(d.experience_years?.toString() || '15');
        setFee(d.consultation_fee?.toString() || '0');
        setAbout(d.about || '');
      }
    } catch (err) {
      console.error('Failed to load Dr. Deepa profile', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDietPlans = async () => {
    try {
      setLoadingDiets(true);
      const res = await apiFetch('/admin/diet-plans');
      setDietPlans(res.diet_plans || []);
    } catch (e) {
      console.error('Failed to fetch patient diet plans:', e);
    } finally {
      setLoadingDiets(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadDoctor();
      loadDietPlans();
    }
  }, [profile]);

  const loadSlots = async () => {
    if (!doctor?.id) return;
    try {
      setLoadingSlots(true);
      const offset = new Date().getTimezoneOffset() * -1;
      const res = await apiFetch(`/doctors/${doctor.id}/slots?date=${selectedDate}&offset=${offset}`);
      setSlots(res.slots || []);
    } catch (err) {
      console.error('Failed to load slots', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (doctor?.id) {
      loadSlots();
    }
  }, [doctor?.id, selectedDate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    try {
      await apiFetch('/doctor-portal/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          about,
          consultation_fee: parseFloat(fee) || 0,
        }),
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      loadDoctor();
    } catch (err) {
      alert('Failed to save profile updates');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSlot = async () => {
    if (!doctor?.id || !newSlotTime) return;
    try {
      const dayOfWeek = new Date(selectedDate).getDay();
      await apiFetch('/doctor-portal/availability', {
        method: 'PUT',
        body: JSON.stringify({
          slots: [
            ...slots.map(s => ({ day_of_week: dayOfWeek, start_time: s.time, end_time: '19:00' })),
            { day_of_week: dayOfWeek, start_time: newSlotTime, end_time: '19:00' }
          ]
        }),
      });
      loadSlots();
      setActionSuccess(`Added slot for ${newSlotTime}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert('Failed to add slot');
    }
  };

  const handleDeleteSlot = async (slotTime: string, isBooked: boolean, booking: any) => {
    if (isBooked && booking) {
      setBookedModalData({
        slotTime,
        booking,
        date: selectedDate,
      });
      return;
    }

    try {
      const dayOfWeek = new Date(selectedDate).getDay();
      await apiFetch('/doctor-portal/slots', {
        method: 'DELETE',
        body: JSON.stringify({
          date: selectedDate,
          slot_time: slotTime,
          day_of_week: dayOfWeek,
        }),
      });
      loadSlots();
      setActionSuccess(`Slot ${slotTime} removed`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      if (err.isBooked) {
        setBookedModalData(err.booking);
      } else {
        alert(err.message || 'Failed to remove slot');
      }
    }
  };

  const handleCancelBookedSlot = async (action: 'cancel' | 'reschedule') => {
    if (!bookedModalData?.booking?.id) return;
    setCancellingAppt(true);

    try {
      await apiFetch(`/doctor-portal/appointments/${bookedModalData.booking.id}/cancel-with-notification`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          reason: `Doctor availability updated for ${selectedDate}`,
        }),
      });
      setBookedModalData(null);
      loadSlots();
      setActionSuccess(`Appointment ${action === 'cancel' ? 'cancelled' : 'marked for reschedule'} and patient notified via chat.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert('Failed to process appointment cancellation');
    } finally {
      setCancellingAppt(false);
    }
  };

  const handleOpenDietEdit = (plan: any) => {
    setEditingDietPlan(plan);
    setEditTitle(plan.title || '');
    setEditNotes(plan.notes || '');
    setEditBreakfast(plan.plan_details?.meal_structure?.breakfast || '');
    setEditBreakfastAlt(plan.plan_details?.meal_structure?.breakfast_alternate || plan.plan_details?.meal_structure?.breakfastAlternate || '');
    setEditLunch(plan.plan_details?.meal_structure?.lunch || '');
    setEditLunchAlt(plan.plan_details?.meal_structure?.lunch_alternate || plan.plan_details?.meal_structure?.lunchAlternate || '');
    setEditSnack(plan.plan_details?.meal_structure?.snack || '');
    setEditSnackAlt(plan.plan_details?.meal_structure?.snack_alternate || plan.plan_details?.meal_structure?.snackAlternate || '');
    setEditDinner(plan.plan_details?.meal_structure?.dinner || '');
    setEditDinnerAlt(plan.plan_details?.meal_structure?.dinner_alternate || plan.plan_details?.meal_structure?.dinnerAlternate || '');
    setEditGuidelines((plan.plan_details?.guidelines || []).join('\n'));
  };

  const handleSaveDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDietPlan) return;
    try {
      setSavingDiet(true);
      const res = await apiFetch(`/admin/diet-plans/${editingDietPlan.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle.trim(),
          notes: editNotes.trim(),
          plan_details: {
            summary: editingDietPlan.plan_details?.summary || '',
            guidelines: editGuidelines.split('\n').map(g => g.trim()).filter(Boolean),
            meal_structure: {
              breakfast: editBreakfast.trim(),
              breakfast_alternate: editBreakfastAlt.trim(),
              lunch: editLunch.trim(),
              lunch_alternate: editLunchAlt.trim(),
              snack: editSnack.trim(),
              snack_alternate: editSnackAlt.trim(),
              dinner: editDinner.trim(),
              dinner_alternate: editDinnerAlt.trim(),
            }
          }
        })
      });

      if (res.diet_plan) {
        setDietPlans(prev => prev.map(p => p.id === editingDietPlan.id ? { ...p, ...res.diet_plan } : p));
        setEditingDietPlan(null);
        alert('Patient diet plan customized and updated successfully!');
      }
    } catch (e) {
      alert('Failed to update patient diet plan.');
    } finally {
      setSavingDiet(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={profile?.role === 'admin' ? '/admin-panel' : '/home'}
              className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 font-playfair">Dr. Deepa Madhavan Portal</h1>
              <p className="text-xs text-slate-500 font-medium">Availability slot control & clinical plan customization</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#5b21b6] bg-purple-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Dr. Deepa Madhavan Active
          </span>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-3.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* LEFT: Profile Editor */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-[#5b21b6]" />
              <h2 className="font-bold text-slate-800 text-sm">Doctor Profile Details</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={fullName}
                  className="w-full h-10 rounded-xl bg-slate-100 px-3 font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Specialty</label>
                <input
                  type="text"
                  disabled
                  value={specialty}
                  className="w-full h-10 rounded-xl bg-slate-100 px-3 font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Experience (Yrs)</label>
                  <input
                    type="text"
                    disabled
                    value={experience}
                    className="w-full h-10 rounded-xl bg-slate-100 px-3 font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Consultation Fee</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={e => setFee(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 font-semibold text-slate-800 focus:border-[#5b21b6] focus:outline-none"
                    placeholder="0 for Free Tier"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">About / Bio</label>
                <textarea
                  rows={4}
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#5b21b6] focus:outline-none"
                />
              </div>

              {profileSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg text-center">
                  Profile updated successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full h-10 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {savingProfile ? 'Saving...' : 'Save Profile Updates'}
              </button>
            </form>
          </div>

          {/* RIGHT: Slot Editor */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5b21b6]" />
                <h2 className="font-bold text-slate-800 text-sm">Consultation Slot Editor</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Add / Edit / Remove Slots</span>
            </div>

            {/* Date Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {dateOptions.map(item => (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-2xl border text-center shrink-0 min-w-16 transition-all',
                    selectedDate === item.dateStr
                      ? 'bg-purple-900 border-purple-950 text-white shadow-md'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">{item.dayName}</span>
                  <span className="text-sm font-black mt-1 leading-none">{item.dayNumber}</span>
                  <span className="text-[9px] font-bold mt-1 opacity-70">{item.monthName}</span>
                </button>
              ))}
            </div>

            {/* Slots List */}
            {loadingSlots ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading available slots...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {slots.map(s => (
                    <div
                      key={s.time}
                      className={cn(
                        'p-3.5 rounded-2xl border text-center relative group flex flex-col items-center justify-center gap-1.5 shadow-2xs',
                        s.is_booked
                          ? 'bg-purple-50/70 border-purple-200 text-purple-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-800'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#5b21b6]" />
                        <span className="text-xs font-black">{s.time}</span>
                      </div>
                      
                      {s.is_booked ? (
                        <span className="text-[9px] font-black uppercase text-[#9d174d] bg-pink-100 px-2 py-0.5 rounded-full">
                          Booked
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400">Available</span>
                      )}

                      <button
                        onClick={() => handleDeleteSlot(s.time, s.is_booked, s.booking)}
                        className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center hover:bg-red-200 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete slot"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {slots.length === 0 && (
                    <p className="col-span-3 text-center text-slate-400 text-xs py-6">No slots declared for this date.</p>
                  )}
                </div>

                {/* Add Slot Control */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Quick Add Slot:</span>
                    <input
                      type="time"
                      value={newSlotTime}
                      onChange={e => setNewSlotTime(e.target.value)}
                      className="h-9 px-3 border border-slate-200 rounded-xl text-xs outline-none bg-white font-bold"
                    />
                  </div>
                  <button
                    onClick={handleAddSlot}
                    className="h-9 px-4 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slot
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM: Patient Diet Plans Customizer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-800 text-base font-playfair">Patient Diet Plans Customizer</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Dr. Deepa Madhavan Override Control</span>
          </div>

          {loadingDiets ? (
            <div className="py-6 text-center text-slate-400 text-xs">Loading patient records...</div>
          ) : dietPlans.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-6">No generated patient diet plans found.</p>
          ) : (
            <div className="grid gap-3.5">
              {dietPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-800">{plan.title}</h4>
                    <p className="text-[10px] font-semibold text-slate-500">
                      Patient: {plan.users?.full_name || 'Patient'} ({plan.users?.email || 'Registered User'})
                    </p>
                    <p className="text-[10px] text-[#5b21b6] font-bold line-clamp-1 italic">
                      Notes: {plan.notes || 'No doctor customization applied yet'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenDietEdit(plan)}
                    className="py-1.5 px-3 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-extrabold rounded-xl flex items-center gap-1 shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Customize Plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Booked Slot Protection Modal */}
      {bookedModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-slate-800 text-base">Booked Slot Protection</h3>
              </div>
              <button onClick={() => setBookedModalData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
              <p className="font-bold text-sm text-amber-950">Silent Deletion Disabled</p>
              <p>
                The slot at <span className="font-bold">{bookedModalData.slotTime}</span> on <span className="font-bold">{bookedModalData.date}</span> is currently booked by patient <span className="font-bold">{bookedModalData.booking?.patient_name || 'Confirmed Patient'}</span>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={async () => {
                  if (!bookedModalData?.booking) return;
                  const templateId = prompt('Select Template ID:\n1. pcos-anti-inflammatory\n2. thyroid-metabolic-balance\n3. fertility-menstrual-wellness', 'pcos-anti-inflammatory');
                  if (!templateId) return;
                  const notes = prompt('Add optional notes from Dr. Deepa Madhavan:', 'Take warm water with lemon daily and follow seed cycling guidelines.');
                  try {
                    await apiFetch('/diet/attach', {
                      method: 'POST',
                      body: JSON.stringify({
                        appointment_id: bookedModalData.booking.id,
                        patient_id: bookedModalData.booking.patient_id || bookedModalData.booking.id,
                        template_id: templateId,
                        notes,
                      }),
                    });
                    alert('Diet plan attached successfully! Patient notified via chat.');
                    setBookedModalData(null);
                  } catch (e) {
                    alert('Failed to attach diet plan');
                  }
                }}
                className="w-full h-11 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold rounded-full text-xs shadow-sm flex items-center justify-center gap-2"
              >
                📋 Attach Diet Plan to Consultation
              </button>

              <button
                disabled={cancellingAppt}
                onClick={() => handleCancelBookedSlot('cancel')}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xs shadow-sm flex items-center justify-center gap-2"
              >
                Cancel Appointment & Notify Patient
              </button>
              
              <button
                disabled={cancellingAppt}
                onClick={() => handleCancelBookedSlot('reschedule')}
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full text-xs shadow-sm flex items-center justify-center gap-2"
              >
                Request Reschedule & Notify Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Diet Plan Overlay Modal */}
      {editingDietPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-6 max-w-lg w-full my-8 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditingDietPlan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Apple className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base font-playfair">Customize Diet Plan for Patient</h3>
            </div>

            <form onSubmit={handleSaveDietPlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none font-bold"
                />
              </div>

              {/* Breakfast options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#5b21b6] uppercase tracking-wider mb-1">Breakfast (Primary)</label>
                  <textarea
                    rows={2}
                    value={editBreakfast}
                    onChange={e => setEditBreakfast(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Breakfast (Alternative)</label>
                  <textarea
                    rows={2}
                    value={editBreakfastAlt}
                    onChange={e => setEditBreakfastAlt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              {/* Lunch options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#5b21b6] uppercase tracking-wider mb-1">Lunch (Primary)</label>
                  <textarea
                    rows={2}
                    value={editLunch}
                    onChange={e => setEditLunch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Lunch (Alternative)</label>
                  <textarea
                    rows={2}
                    value={editLunchAlt}
                    onChange={e => setEditLunchAlt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              {/* Snack options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#5b21b6] uppercase tracking-wider mb-1">Snack (Primary)</label>
                  <textarea
                    rows={2}
                    value={editSnack}
                    onChange={e => setEditSnack(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Snack (Alternative)</label>
                  <textarea
                    rows={2}
                    value={editSnackAlt}
                    onChange={e => setEditSnackAlt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              {/* Dinner options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#5b21b6] uppercase tracking-wider mb-1">Dinner (Primary)</label>
                  <textarea
                    rows={2}
                    value={editDinner}
                    onChange={e => setEditDinner(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Dinner (Alternative)</label>
                  <textarea
                    rows={2}
                    value={editDinnerAlt}
                    onChange={e => setEditDinnerAlt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinical Guidelines (one per line)</label>
                <textarea
                  rows={3}
                  value={editGuidelines}
                  onChange={e => setEditGuidelines(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dr. Deepa's Custom Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold text-purple-950"
                  placeholder="e.g. Please follow this modified seed cycling protocol starting from next cycle."
                />
              </div>

              <button
                type="submit"
                disabled={savingDiet}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {savingDiet ? 'Saving Customizations...' : 'Commit Customizations for Patient'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
