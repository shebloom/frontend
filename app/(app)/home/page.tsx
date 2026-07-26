'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BloomLogo, SectionHeader } from '@/components/shebloom';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { openMedicalReport } from '@/lib/reports';
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
  Bot,
  X,
  Weight,
  Ruler,
  Droplets,
  FileText,
  ExternalLink,
  Apple,
  Edit3,
  Save,
} from 'lucide-react';
import { GradientButton } from '@/components/shebloom';
import { cn } from '@/lib/utils';
import { CONSULTATION_JOIN_WINDOW_MS, CONSULTATION_JOIN_WINDOW_MINUTES } from '@/lib/constants';

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

import { VideoRoomModal } from '@/components/shebloom/VideoRoomModal';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, user } = useAuth();
  // Track whether the auto-join from ?joinCall= has already been triggered
  const autoJoinFiredRef = useRef(false);
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');

  const [chatDoctorHref, setChatDoctorHref] = useState('/consult');
  const [navigatingChat, setNavigatingChat] = useState(false);

  const handleChatWithDoctorClick = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (navigatingChat) return;

    // If chatDoctorHref is already resolved to a /chat/... thread, navigate immediately
    if (chatDoctorHref && chatDoctorHref.startsWith('/chat/')) {
      router.push(chatDoctorHref);
      return;
    }

    setNavigatingChat(true);
    try {
      const allApptsRes = await apiFetch('/appointments');
      const allAppts = allApptsRes.appointments || [];

      if (allAppts.length > 0) {
        const drRes = await apiFetch('/doctors');
        const doctor = drRes.doctors?.[0];
        if (doctor?.id) {
          const convoRes = await apiFetch('/chat/conversations', {
            method: 'POST',
            body: JSON.stringify({ doctor_id: doctor.id }),
          });
          if (convoRes.conversation?.id) {
            const threadHref = `/chat/${convoRes.conversation.id}`;
            setChatDoctorHref(threadHref);
            router.push(threadHref);
            return;
          }
        }
      }
      setChatDoctorHref('/consult');
      router.push('/consult');
    } catch (err) {
      console.error('[chat-routing] Error handling chat click:', err);
      router.push('/consult');
    } finally {
      setNavigatingChat(false);
    }
  };

  // Video Room Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoRoom, setSelectedVideoRoom] = useState<any>(null);

  // Join Call in-progress + error state
  const [joiningCallId, setJoiningCallId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Doctor Dashboard additional state
  const [previousAppointments, setPreviousAppointments] = useState<any[]>([]);
  const [activeDocTab, setActiveDocTab] = useState<'upcoming' | 'previous' | 'patients' | 'availability'>('upcoming');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<any>(null);
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<any[]>([]);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [selectedPatientAppointment, setSelectedPatientAppointment] = useState<any>(null);

  // Doctor Diet Plan Editor State
  const [showDietEditor, setShowDietEditor] = useState(false);
  const [existingDietPlan, setExistingDietPlan] = useState<any>(null);
  const [dietPlanTitle, setDietPlanTitle] = useState('');
  const [dietPlanNotes, setDietPlanNotes] = useState('');
  const [dietPlanDetails, setDietPlanDetails] = useState('');
  
  // Meal Structure & Alternatives state
  const [dietBreakfast, setDietBreakfast] = useState('');
  const [dietBreakfastAlt, setDietBreakfastAlt] = useState('');
  const [dietLunch, setDietLunch] = useState('');
  const [dietLunchAlt, setDietLunchAlt] = useState('');
  const [dietSnack, setDietSnack] = useState('');
  const [dietSnackAlt, setDietSnackAlt] = useState('');
  const [dietDinner, setDietDinner] = useState('');
  const [dietDinnerAlt, setDietDinnerAlt] = useState('');

  const [savingDiet, setSavingDiet] = useState(false);
  const [dietSaveSuccess, setDietSaveSuccess] = useState('');

  // Doctor Video Call state
  const [showDoctorVideoModal, setShowDoctorVideoModal] = useState(false);
  const [doctorVideoRoom, setDoctorVideoRoom] = useState<any>(null);

  // Doctor Availability Editor State
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const getCallWindowState = (appointment: any) => {
    if (!appointment) return { isTooEarly: false, isJoinable: false, isPastGrace: false, status: '' };
    
    const [y, m, d] = (appointment.appointment_date || '').split('-').map(Number);
    const [h, min] = (appointment.slot_time || '').split(':').map(Number);
    const scheduledTime = new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, 0, 0);
    const graceEnd = new Date(scheduledTime.getTime() + CONSULTATION_JOIN_WINDOW_MS); // Configurable join window
    const now = new Date();

    const isTooEarly = now < scheduledTime;
    const isJoinable = now >= scheduledTime && now <= graceEnd && ['confirmed', 'pending', 'rescheduled', 'completed'].includes(appointment.status || appointment.display_status);
    const isPastGrace = now > graceEnd || appointment.status === 'missed' || appointment.display_status === 'missed';

    return {
      isTooEarly,
      isJoinable,
      isPastGrace,
      scheduledTime,
      graceEnd,
      status: appointment.display_status || appointment.status,
    };
  };

  const isCallActive = (appointmentDate: string, slotTime: string, appointment?: any) => {
    if (appointment) {
      return getCallWindowState(appointment).isJoinable;
    }
    const [y, m, d] = (appointmentDate || '').split('-').map(Number);
    const [h, min] = (slotTime || '').split(':').map(Number);
    const scheduledTime = new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, 0, 0);
    const graceEnd = new Date(scheduledTime.getTime() + CONSULTATION_JOIN_WINDOW_MS);
    const now = new Date();
    return now >= scheduledTime && now <= graceEnd;
  };

  const getCallButtonLabel = (appointmentDate: string, slotTime: string, appointment?: any) => {
    const state = getCallWindowState(appointment || { appointment_date: appointmentDate, slot_time: slotTime });
    if (state.isJoinable) {
      return 'Join Video Call';
    }
    if (state.isPastGrace) {
      return 'Call Expired';
    }
    const [hStr, mStr] = slotTime.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `Available from ${h}:${m} ${ampm}`;
  };

  const handleJoinCall = async (appointmentId: string, appointment: any) => {
    console.log('[handleJoinCall] ▶ called with appointmentId:', appointmentId);
    setJoiningCallId(appointmentId);
    setJoinError(null);
    try {
      const res = await apiFetch(`/appointments/${appointmentId}/join`);

      // ── LOG FULL RAW RESPONSE for debugging ──────────────────────────────
      console.log('[handleJoinCall] ✅ Raw /join response (full shape):', JSON.stringify(res, null, 2));
      console.log('[handleJoinCall] Key fields → joinable:', res.joinable, '| joinUrl:', res.joinUrl, '| reason:', res.reason, '| error:', res.error);

      if (res.joinable) {
        const apptId = res.appointmentId || appointmentId;
        const isDoctor = profile?.role === 'doctor';
        console.log('[handleJoinCall] ✅ joinable=true | isDoctor:', isDoctor, '| joinUrl:', res.joinUrl, '| patientName:', res.patientName, '| doctorName:', res.doctorName);

        if (!res.joinUrl) {
          const errMsg = 'Server returned joinable=true but joinUrl is missing. Check backend response.';
          console.error('[handleJoinCall] ❌', errMsg, res);
          setJoinError('Video room URL is missing. Please contact support.');
          return;
        }

        // ── OPEN THE MODAL FIRST ─────────────────────────────────────────────
        // Always open the local modal immediately after a successful /join.
        // The Supabase broadcast below is fire-and-forget — a slow or failed
        // channel subscription must NEVER block the modal from appearing.
        if (isDoctor) {
          console.log('[handleJoinCall] 🏥 Opening DOCTOR video modal...');
          setDoctorVideoRoom({
            url: res.joinUrl,
            patientName: res.patientName || 'Patient',
            patientId: res.patientId,
            appointmentId: apptId,
            date: appointment.appointment_date,
            slot: appointment.slot_time,
          });
          setShowDoctorVideoModal(true);
          console.log('[handleJoinCall] 🏥 Doctor modal state set: showDoctorVideoModal=true');
        } else {
          console.log('[handleJoinCall] 👤 Opening PATIENT video modal...');
          setSelectedVideoRoom({
            url: res.joinUrl,
            doctorName: res.doctorName || 'Dr. Deepa Madhavan',
            appointmentId: apptId,
            date: appointment.appointment_date,
            slot: appointment.slot_time,
          });
          setShowVideoModal(true);
          console.log('[handleJoinCall] 👤 Patient modal state set: showVideoModal=true, selectedVideoRoom.url:', res.joinUrl);
        }

        // ── NOTIFY THE OTHER PARTY (fire-and-forget) ─────────────────────────
        // Broadcast on the appointment-specific realtime channel so the other
        // party receives an "incoming call" / "patient waiting" banner.
        // This runs independently — any failure here does not affect the modal.
        const recipientUserId = isDoctor
          ? (res.patientId || appointment?.patient_id)
          : (res.doctorUserId || appointment?.doctor_id);

        void (async () => {
          try {
            const payload = isDoctor
              ? {
                  appointmentId: apptId,
                  callerId: profile?.id,
                  callerName: profile?.full_name || 'Dr. Deepa Madhavan',
                  callerAvatar: profile?.avatar_url,
                  recipientId: recipientUserId,
                  doctorId: profile?.id,
                  patientId: recipientUserId,
                  roomUrl: res.joinUrl,
                  date: appointment?.appointment_date,
                  slot: appointment?.slot_time,
                  expiresAt: Date.now() + 15 * 60 * 1000,
                }
              : {
                  appointmentId: apptId,
                  callerId: profile?.id,
                  callerName: profile?.full_name || 'Patient',
                  callerAvatar: profile?.avatar_url,
                  recipientId: recipientUserId,
                  doctorId: recipientUserId,
                  patientId: profile?.id,
                  roomUrl: res.joinUrl,
                  date: appointment?.appointment_date,
                  slot: appointment?.slot_time,
                  expiresAt: Date.now() + 15 * 60 * 1000,
                };

            const eventName = isDoctor ? 'incoming_call' : 'patient_is_waiting';

            // 1. Send via dedicated room channel (non-blocking)
            const roomChannel = supabase.channel(`appointment-room-${apptId}`, {
              config: { broadcast: { self: false } },
            });
            roomChannel.subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                roomChannel.send({ type: 'broadcast', event: eventName, payload }).catch(() => {});
              }
            });
            // Also attempt immediate send in case channel is already active
            roomChannel.send({ type: 'broadcast', event: eventName, payload }).catch(() => {});

            // 2. Dual broadcast via global notifications channel for instant delivery
            const notifChannel = supabase.channel('shebloom-notifications');
            notifChannel.send({ type: 'broadcast', event: eventName, payload }).catch(() => {});
          } catch (bcErr) {
            console.warn('[Call] Realtime call broadcast notice (non-blocking):', bcErr);
          }
        })();

      } else {
        // joinable is false — show a visible error message (never silent)
        const errMsg = res.error || (res.reason === 'too_early'
          ? `This consultation hasn't started yet. Please join at your scheduled time.`
          : res.reason === 'expired'
          ? `The join window for this consultation has expired. Please reschedule.`
          : res.reason === 'inactive'
          ? `This appointment is not active and cannot be joined.`
          : 'Unable to join call: the server reported this appointment is not joinable.');
        console.warn('[handleJoinCall] ⚠️ Not joinable | reason:', res.reason, '| error:', res.error, '| full response:', res);
        setJoinError(errMsg);
        // Auto-clear error after 8 seconds
        setTimeout(() => setJoinError(null), 8000);
      }
    } catch (err: any) {
      console.error('[handleJoinCall] ❌ Exception caught:', err);
      const msg = err.message || 'Unable to join the call at this time. Please try again.';
      setJoinError(msg);
      setTimeout(() => setJoinError(null), 8000);
    } finally {
      setJoiningCallId(null);
    }
  };

  const handleStartCall = async (appointmentId: string, appointment?: any) => {
    console.log('[handleStartCall] ▶ doctor initiating call for appointmentId:', appointmentId);
    setJoiningCallId(appointmentId);
    setJoinError(null);
    try {
      const res = await apiFetch(`/appointments/${appointmentId}/start-call`, {
        method: 'POST',
      });
      if (res.success) {
        setDoctorVideoRoom({
          url: res.joinUrl,
          patientName: appointment?.users?.full_name || 'Patient',
          patientId: appointment?.patient_id,
          appointmentId: appointmentId,
          date: appointment?.appointment_date,
          slot: appointment?.slot_time,
        });
        setShowDoctorVideoModal(true);
        setUpcomingAppointment((prev: any) => (prev ? { ...prev, call_started: true } : prev));
      } else {
        setJoinError(res.error || 'Failed to start consultation call');
      }
    } catch (err: any) {
      console.error('[handleStartCall] Exception:', err);
      setJoinError(err.message || 'Failed to start consultation call');
    } finally {
      setJoiningCallId(null);
    }
  };

  useEffect(() => {
    const joinCallId = searchParams.get('joinCall');
    if (joinCallId && !autoJoinFiredRef.current) {
      autoJoinFiredRef.current = true;
      console.log('[HomePage] Auto-joining call from URL query param:', joinCallId);
      if (profile?.role === 'doctor') {
        handleStartCall(joinCallId);
      } else {
        handleJoinCall(joinCallId, null);
      }
    }
  }, [searchParams, profile]);

  useEffect(() => {
    if (!upcomingAppointment?.id) return;
    const ch = supabase.channel(`appointment-room-${upcomingAppointment.id}`)
      .on('broadcast', { event: 'incoming_call' }, () => {
        console.log('[HomePage] Received incoming_call broadcast! Setting call_started=true');
        setUpcomingAppointment((prev: any) => (prev ? { ...prev, call_started: true } : prev));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [upcomingAppointment?.id]);

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

  const handleOpenPatientDrawer = async (patientId: string, appointment?: any) => {
    setSelectedPatientId(patientId);
    setSelectedPatientAppointment(appointment || null);
    setLoadingPatientData(true);
    setSelectedPatientProfile(null);
    setSelectedPatientRecords([]);
    setShowDietEditor(false);
    setDietPlanTitle('');
    setDietPlanNotes('');
    setDietPlanDetails('');
    setDietBreakfast('');
    setDietBreakfastAlt('');
    setDietLunch('');
    setDietLunchAlt('');
    setDietSnack('');
    setDietSnackAlt('');
    setDietDinner('');
    setDietDinnerAlt('');
    setExistingDietPlan(null);
    setDietSaveSuccess('');
    
    try {
      const [profileRes, recordsRes] = await Promise.all([
        apiFetch(`/doctor-portal/patients/${patientId}`),
        apiFetch(`/doctor-portal/patients/${patientId}/health-records`),
      ]);
      setSelectedPatientProfile(profileRes.patient);
      setSelectedPatientRecords(recordsRes.records || []);
      
      // Fetch existing diet plan (pre-filling existing doctor or AI plan)
      try {
        let dietRes = appointment?.id ? await apiFetch(`/diet/appointment/${appointment.id}`) : null;
        if (!dietRes?.diet_plan) {
          dietRes = await apiFetch(`/diet/patient/${patientId}`);
        }
        if (dietRes?.diet_plan) {
          const dp = dietRes.diet_plan;
          setExistingDietPlan(dp);
          setDietPlanTitle(dp.title || '');
          setDietPlanNotes(dp.notes || '');
          const details = dp.plan_details || {};
          const ms = details.meal_structure || {};
          setDietBreakfast(ms.breakfast || '');
          setDietBreakfastAlt(ms.breakfast_alternate || ms.breakfastAlternate || '');
          setDietLunch(ms.lunch || '');
          setDietLunchAlt(ms.lunch_alternate || ms.lunchAlternate || '');
          setDietSnack(ms.snack || '');
          setDietSnackAlt(ms.snack_alternate || ms.snackAlternate || '');
          setDietDinner(ms.dinner || '');
          setDietDinnerAlt(ms.dinner_alternate || ms.dinnerAlternate || '');

          const guidelinesArr = details.guidelines
            ? (Array.isArray(details.guidelines) ? details.guidelines.join('\n') : details.guidelines)
            : '';
          setDietPlanDetails(guidelinesArr);
        } else {
          setExistingDietPlan(null);
          setDietPlanTitle('');
          setDietPlanNotes('');
          setDietPlanDetails('');
        }
      } catch (e) {
        // no diet plan yet
      }
    } catch (err) {
      console.error('Failed to load patient records', err);
    } finally {
      setLoadingPatientData(false);
    }
  };

  const handleSaveDietPlan = async () => {
    if (!selectedPatientId || !dietPlanTitle.trim()) return;
    setSavingDiet(true);
    setDietSaveSuccess('');
    try {
      const guidelinesParsed = dietPlanDetails.split('\n').filter(line => line.trim());
      const parsedDetails: any = {
        summary: `Custom clinical diet plan assigned by Dr. Deepa Madhavan.`,
        guidelines: guidelinesParsed,
        meal_structure: {
          breakfast: dietBreakfast,
          breakfast_alternate: dietBreakfastAlt,
          lunch: dietLunch,
          lunch_alternate: dietLunchAlt,
          snack: dietSnack,
          snack_alternate: dietSnackAlt,
          dinner: dietDinner,
          dinner_alternate: dietDinnerAlt,
        },
      };
      
      if (existingDietPlan?.id && !existingDietPlan.id.startsWith('diet-')) {
        // Update existing plan
        await apiFetch(`/diet/${existingDietPlan.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: dietPlanTitle,
            notes: dietPlanNotes,
            plan_details: parsedDetails,
          }),
        });
      } else {
        // Create new plan
        const res = await apiFetch('/diet/attach', {
          method: 'POST',
          body: JSON.stringify({
            appointment_id: selectedPatientAppointment?.id || null,
            patient_id: selectedPatientId,
            title: dietPlanTitle,
            notes: dietPlanNotes,
            plan_details: parsedDetails,
          }),
        });
        if (res.diet_plan) setExistingDietPlan(res.diet_plan);
      }
      setDietSaveSuccess('Diet plan saved and patient notified!');
      setTimeout(() => setDietSaveSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save diet plan');
    } finally {
      setSavingDiet(false);
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

  const parseApptTime = (dateStr: string, slotTimeStr: string) => {
    const [y, m, d] = (dateStr || '').split('-').map(Number);
    const [h, min] = (slotTimeStr || '').split(':').map(Number);
    return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, 0, 0);
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
        const now = new Date();
        
        if (profile?.role === 'doctor') {
          const upcoming = list.filter((a: any) => {
            const scheduled = parseApptTime(a.appointment_date, a.slot_time);
            const graceEnd = new Date(scheduled.getTime() + CONSULTATION_JOIN_WINDOW_MS);
            // Include 'completed' so already-joined appointments stay visible for re-join during window
            return now <= graceEnd && ['confirmed', 'pending', 'rescheduled', 'completed'].includes(a.status || a.display_status);
          });
          upcoming.sort((a: any, b: any) => parseApptTime(a.appointment_date, a.slot_time).getTime() - parseApptTime(b.appointment_date, b.slot_time).getTime());
          setUpcomingAppointments(upcoming);
          
          const previous = list.map((a: any) => {
            const scheduled = parseApptTime(a.appointment_date, a.slot_time);
            const graceEnd = new Date(scheduled.getTime() + CONSULTATION_JOIN_WINDOW_MS);
            const isPast = now > graceEnd;
            let status = a.display_status || a.status;
            if (isPast && ['confirmed', 'pending', 'rescheduled'].includes(status)) {
              status = 'missed';
            }
            return { ...a, status };
          }).filter((a: any) => {
            const scheduled = parseApptTime(a.appointment_date, a.slot_time);
            const graceEnd = new Date(scheduled.getTime() + CONSULTATION_JOIN_WINDOW_MS);
            return now > graceEnd || ['completed', 'cancelled', 'missed'].includes(a.status);
          });
          previous.sort((a: any, b: any) => parseApptTime(b.appointment_date, b.slot_time).getTime() - parseApptTime(a.appointment_date, a.slot_time).getTime());
          setPreviousAppointments(previous);
        } else {
          const activeList = list.filter((a: any) => {
            const scheduled = parseApptTime(a.appointment_date, a.slot_time);
            const graceEnd = new Date(scheduled.getTime() + CONSULTATION_JOIN_WINDOW_MS);
            // Include 'completed' so already-joined appointments stay visible for re-join during window
            return now <= graceEnd && ['confirmed', 'pending', 'rescheduled', 'completed'].includes(a.status || a.display_status);
          });
          activeList.sort((a: any, b: any) => parseApptTime(a.appointment_date, a.slot_time).getTime() - parseApptTime(b.appointment_date, b.slot_time).getTime());

          setUpcomingAppointments(activeList);
          setUpcomingAppointment(activeList.length > 0 ? activeList[0] : null);

          // ── CHAT ROUTING CHECK ────────────────────────────────────────────────
          // Check if this patient has ANY appointment ever (regardless of status/date).
          // The correct condition: does at least one appointment record exist between
          // this patient_id and doctor_id, in ANY status?
          // We fetch all appointments (no upcoming=true, no status filter) to answer this.
          try {
            const allApptsRes = await apiFetch('/appointments');
            const allAppts = allApptsRes.appointments || [];

            if (allAppts.length > 0) {
              // At least one appointment exists — patient has a prior relationship.
              // Get or create the chat conversation thread with the doctor.
              try {
                const drRes = await apiFetch('/doctors');
                const doctor = drRes.doctors?.[0];
                if (doctor?.id) {
                  const convoRes = await apiFetch('/chat/conversations', {
                    method: 'POST',
                    body: JSON.stringify({ doctor_id: doctor.id }),
                  });
                  if (convoRes.conversation?.id) {
                    const threadHref = `/chat/${convoRes.conversation.id}`;
                    setChatDoctorHref(threadHref);
                  }
                }
              } catch (chatErr) {
                console.warn('[chat-routing] Could not resolve chat thread, defaulting to /consult:', chatErr);
              }
            } else {
              // Zero appointment records exist for this patient — send to booking page.
              setChatDoctorHref('/consult');
            }
          } catch (allApptsErr) {
            console.warn('[chat-routing] Could not fetch all appointments for chat routing check:', allApptsErr);
            // Leave chatDoctorHref as-is ('/consult') on error
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

  // ─── Auto-join when redirected from profile page with ?joinCall={id} ──────────
  useEffect(() => {
    const joinCallId = searchParams?.get('joinCall');
    if (!joinCallId || autoJoinFiredRef.current || isLoading) return;
    if (!profile || profile.role === 'admin') return;

    // Try to find the appointment in the loaded list for richer broadcast payload,
    // but don't block if it's not there — the backend /join API validates everything.
    const match = upcomingAppointments.find((a: any) => a.id === joinCallId) || null;

    autoJoinFiredRef.current = true;
    // Remove the query param from the URL without re-mounting the component
    window.history.replaceState(null, '', '/home');
    // Trigger the join call flow — works even if match is null
    handleJoinCall(joinCallId, match);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading, profile]);

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
    // isApproved: role==='doctor' means admin already approved (sets role in DB).
    // Also accept explicit 'approved' status as a fallback.
    const isApproved = profile.role === 'doctor' || profile.doctor_application_status === 'approved';

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
                {upcomingAppointments.map((appt) => {
                  const state = getCallWindowState(appt);
                  return (
                    <div key={appt.id} className="rounded-3xl bg-white border border-bloom-100/50 p-4 shadow-bloom-card flex flex-col gap-3">
                      <div className="flex items-start gap-4">
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
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleOpenPatientDrawer(appt.patient_id, appt)}
                            className="px-2.5 py-1.5 rounded-xl border border-bloom-100 text-bloom-600 font-bold text-[10px] hover:bg-bloom-50 bg-white"
                          >
                            Case File
                          </button>
                          <button
                            onClick={() => router.push(`/chat/${appt.patient_id}`)}
                            className="h-8 w-8 rounded-full border border-bloom-200 bg-white flex items-center justify-center text-bloom-600 hover:bg-bloom-50 shadow-sm"
                            title="Open Patient Chat"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 10-minute warning notice */}
                      {state.isJoinable && (
                        <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                          <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>⚠️ Please join within {CONSULTATION_JOIN_WINDOW_MINUTES} minutes or this consultation will need to be rescheduled.</span>
                        </div>
                      )}

                      {/* Join call error banner (doctor) */}
                      {joinError && joiningCallId === null && (
                        <div className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span>{joinError}</span>
                        </div>
                      )}

                      {/* Join Video Call Button */}
                      <button
                        onClick={() => handleJoinCall(appt.id, appt)}
                        disabled={joiningCallId === appt.id}
                        className={cn(
                          "w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed",
                          state.isJoinable
                            ? "bg-[#5b21b6] text-white hover:bg-[#4c1d95]"
                            : "bg-purple-100 text-[#5b21b6] hover:bg-purple-200"
                        )}
                      >
                        {joiningCallId === appt.id ? (
                          <>
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4" />
                            {getCallButtonLabel(appt.appointment_date, appt.slot_time, appt)}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
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
            <div className="bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl border border-bloom-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-bloom-50 bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Patient Case File</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Medical History, Vitals & Diet Plan</p>
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
                          {selectedPatientRecords.map((rec: any) => (
                            <div key={rec.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="h-4 w-4 text-bloom-600 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate">{rec.file_name || rec.record_type}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{new Date(rec.record_date).toLocaleDateString('en-GB')}</p>
                                </div>
                              </div>
                              {rec.file_url && (
                                <button
                                  type="button"
                                  onClick={() => openMedicalReport(rec.file_url, rec.file_name)}
                                  title="View Medical Report"
                                  className="h-8 w-8 rounded-xl hover:bg-bloom-100 flex items-center justify-center text-bloom-600 shrink-0 border border-bloom-50 bg-white cursor-pointer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl font-semibold">No medical records uploaded by this patient.</p>
                      )}
                    </div>

                    {/* ─── DIET PLAN EDITOR ─── */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Apple className="h-4 w-4 text-bloom-600" />
                          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                            {existingDietPlan ? 'Edit Diet Plan' : 'Assign Diet Plan'}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDietEditor(!showDietEditor)}
                          className="text-[10px] font-bold text-bloom-600 hover:text-bloom-700 flex items-center gap-1 bg-bloom-50 px-2.5 py-1 rounded-lg border border-bloom-100"
                        >
                          <Edit3 className="h-3 w-3" />
                          {showDietEditor ? 'Collapse' : (existingDietPlan ? 'Edit' : 'Create')}
                        </button>
                      </div>

                      {existingDietPlan && !showDietEditor && (
                        <div className="p-3 bg-green-50 border border-green-100 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-bold text-green-800">Diet Plan Assigned</span>
                          </div>
                          <p className="text-[11px] font-semibold text-green-700 truncate">{existingDietPlan.title}</p>
                          {existingDietPlan.notes && <p className="text-[10px] text-green-600 mt-1">{existingDietPlan.notes}</p>}
                        </div>
                      )}

                      {showDietEditor && (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Plan Title *</label>
                            <input
                              type="text"
                              value={dietPlanTitle}
                              onChange={e => setDietPlanTitle(e.target.value)}
                              placeholder="e.g. PCOS Anti-Inflammatory Protocol"
                              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-bloom-200 focus:border-bloom-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Plan Details / Guidelines</label>
                            <textarea
                              rows={4}
                              value={dietPlanDetails}
                              onChange={e => setDietPlanDetails(e.target.value)}
                              placeholder="Describe the diet guidelines, meals and schedule..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-bloom-200 focus:border-bloom-400 resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Doctor Notes (visible to patient)</label>
                            <textarea
                              rows={2}
                              value={dietPlanNotes}
                              onChange={e => setDietPlanNotes(e.target.value)}
                              placeholder="Additional notes for the patient..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-bloom-200 focus:border-bloom-400 resize-none"
                            />
                          </div>

                          {/* Meal Structure & Alternatives Section */}
                          <div className="pt-3 border-t border-slate-200 space-y-2">
                            <label className="text-[10px] font-extrabold text-[#5b21b6] uppercase tracking-wider block">
                              Meal Structure & Alternatives
                            </label>

                            {/* Breakfast */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Breakfast</span>
                              <input
                                type="text"
                                value={dietBreakfast}
                                onChange={e => setDietBreakfast(e.target.value)}
                                placeholder="Primary Breakfast Option..."
                                className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={dietBreakfastAlt}
                                onChange={e => setDietBreakfastAlt(e.target.value)}
                                placeholder="Alternative Breakfast Option..."
                                className="w-full h-8 rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 text-xs font-medium text-emerald-800"
                              />
                            </div>

                            {/* Lunch */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Lunch</span>
                              <input
                                type="text"
                                value={dietLunch}
                                onChange={e => setDietLunch(e.target.value)}
                                placeholder="Primary Lunch Option..."
                                className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={dietLunchAlt}
                                onChange={e => setDietLunchAlt(e.target.value)}
                                placeholder="Alternative Lunch Option..."
                                className="w-full h-8 rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 text-xs font-medium text-emerald-800"
                              />
                            </div>

                            {/* Snack */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Snack</span>
                              <input
                                type="text"
                                value={dietSnack}
                                onChange={e => setDietSnack(e.target.value)}
                                placeholder="Primary Snack Option..."
                                className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={dietSnackAlt}
                                onChange={e => setDietSnackAlt(e.target.value)}
                                placeholder="Alternative Snack Option..."
                                className="w-full h-8 rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 text-xs font-medium text-emerald-800"
                              />
                            </div>

                            {/* Dinner */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Dinner</span>
                              <input
                                type="text"
                                value={dietDinner}
                                onChange={e => setDietDinner(e.target.value)}
                                placeholder="Primary Dinner Option..."
                                className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={dietDinnerAlt}
                                onChange={e => setDietDinnerAlt(e.target.value)}
                                placeholder="Alternative Dinner Option..."
                                className="w-full h-8 rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 text-xs font-medium text-emerald-800"
                              />
                            </div>
                          </div>
                          {dietSaveSuccess && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-100">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {dietSaveSuccess}
                            </div>
                          )}
                          <button
                            onClick={handleSaveDietPlan}
                            disabled={savingDiet || !dietPlanTitle.trim()}
                            className="w-full h-10 bg-bloom-gradient text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-bloom-btn transition active:scale-95 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            {savingDiet ? 'Saving & Notifying Patient...' : existingDietPlan ? 'Update Diet Plan' : 'Assign Diet Plan to Patient'}
                          </button>
                        </div>
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

        {/* Doctor Video Room Modal */}
        {doctorVideoRoom && (
          <VideoRoomModal
            isOpen={showDoctorVideoModal}
            onClose={() => setShowDoctorVideoModal(false)}
            roomUrl={doctorVideoRoom.url}
            patientName={doctorVideoRoom.patientName}
            doctorName={profile?.full_name || 'Dr. Deepa Madhavan'}
            appointmentDate={doctorVideoRoom.date}
            slotTime={doctorVideoRoom.slot}
            patientId={doctorVideoRoom.patientId}
            appointmentId={doctorVideoRoom.appointmentId}
          />
        )}
      </div>
    );
  }

  // ─── PATIENT HOME VIEW ──────────────────────────────────────────────────────────
  const consultationsLeft = membership?.consultations_remaining ?? 12;
  const consultationsTotal = membership?.consultations_total ?? 12;
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

      {/* AI Health Assistant Hero Banner */}
      <section className="px-5 pt-4">
        <div
          onClick={() => router.push('/chat/ai')}
          className="bg-gradient-to-r from-[#5b21b6] via-[#6d28d9] to-[#7c3aed] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-all group border border-purple-400/30"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shrink-0">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-playfair">AI Health Assistant</h3>
                  <span className="text-[9px] font-black uppercase bg-pink-500 text-white px-2 py-0.5 rounded-full tracking-wider">
                    24/7 AI
                  </span>
                </div>
                <p className="text-xs text-purple-100 font-medium mt-0.5">
                  Instant answers for cycle, PCOS & menstrual health
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/25 flex items-center justify-center transition-colors shrink-0">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Upcoming Consultation Section */}
      <section className="px-5 pt-5 pb-2">
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
            {/* Show 10-minute warning note if call is active/joinable */}
            {getCallWindowState(upcomingAppointment).isJoinable && (
              <div className="mt-3 text-[11px] font-semibold text-amber-200 bg-amber-950/40 border border-amber-400/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                <Clock className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>Please join during your 30-minute consultation window.</span>
              </div>
            )}

            {/* Join call error banner */}
            {joinError && (
              <div className="mt-3 text-[11px] font-semibold text-red-200 bg-red-950/40 border border-red-400/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-red-300 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            <div className="mt-4 flex gap-2.5">
              {getCallWindowState(upcomingAppointment).isPastGrace ? (
                <button
                  onClick={() => router.push('/consult')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold py-2.5 text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  Reschedule Consultation
                </button>
              ) : (() => {
                const isDoc = (profile?.role as string) === 'doctor';
                const isWindowActive = getCallWindowState(upcomingAppointment).isJoinable;
                const callStarted = upcomingAppointment.call_started;
                const doctorName = upcomingAppointment?.doctors?.users?.full_name || 'Doctor';

                if (isDoc) {
                  return (
                    <button
                      onClick={() => handleStartCall(upcomingAppointment.id, upcomingAppointment)}
                      disabled={joiningCallId === upcomingAppointment.id || !isWindowActive}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-xl font-extrabold py-2.5 text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed",
                        isWindowActive ? "bg-white text-bloom-700 hover:bg-white/90" : "bg-purple-100 text-[#5b21b6]"
                      )}
                    >
                      {joiningCallId === upcomingAppointment.id ? (
                        <>
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Starting Call...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4" />
                          {isWindowActive ? (callStarted ? 'Re-Join Consultation' : 'Start Consultation') : getCallButtonLabel(upcomingAppointment.appointment_date, upcomingAppointment.slot_time, upcomingAppointment)}
                        </>
                      )}
                    </button>
                  );
                }

                // Patient View
                return (
                  <button
                    onClick={() => handleJoinCall(upcomingAppointment.id, upcomingAppointment)}
                    disabled={joiningCallId === upcomingAppointment.id || (isWindowActive && !callStarted)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl font-extrabold py-2.5 text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed",
                      isWindowActive && callStarted
                        ? "bg-white text-bloom-700 hover:bg-white/90"
                        : "bg-purple-100/90 text-[#5b21b6]"
                    )}
                  >
                    {joiningCallId === upcomingAppointment.id ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Connecting...
                      </>
                    ) : isWindowActive && !callStarted ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin text-[#5b21b6]" />
                        Waiting for {doctorName} to start...
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4" />
                        {getCallButtonLabel(upcomingAppointment.appointment_date, upcomingAppointment.slot_time, upcomingAppointment)}
                      </>
                    )}
                  </button>
                );
              })()}
              <button
                onClick={() => {
                  if (chatDoctorHref && chatDoctorHref.startsWith('/chat/')) {
                    router.push(chatDoctorHref);
                  } else {
                    router.push(`/chat/${upcomingAppointment.doctors?.users?.id || upcomingAppointment.doctor_id}`);
                  }
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                Open Chat
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
          {[
            { icon: MessageCircle, label: 'Chat with Doctor', href: chatDoctorHref, color: 'bg-bloom-100', onClick: handleChatWithDoctorClick },
            { icon: Calendar,      label: 'Cycle Tracker',    href: '/cycle',         color: 'bg-petal-100' },
            { icon: Activity,      label: 'Symptoms Check',   href: '/health',        color: 'bg-green-100' },
            { icon: BookOpen,      label: 'Wellness Library', href: '/wellness',      color: 'bg-amber-100' },
          ].map((link) => {
            const Icon = link.icon;
            if (link.onClick) {
              return (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  disabled={navigatingChat}
                  className="flex flex-col items-center gap-2 focus:outline-none disabled:opacity-75"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${link.color} transition-transform active:scale-95`}>
                    <Icon className="h-6 w-6 text-bloom-700" />
                  </div>
                  <span className="text-center text-[10px] font-medium leading-tight text-slate-600">
                    {navigatingChat ? 'Loading...' : link.label}
                  </span>
                </button>
              );
            }
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

      {/* Video Room Modal — always rendered when open, selectedVideoRoom used for URL/names */}
      <VideoRoomModal
        isOpen={showVideoModal}
        onClose={() => { setShowVideoModal(false); setSelectedVideoRoom(null); }}
        roomUrl={selectedVideoRoom?.url || ''}
        doctorName={selectedVideoRoom?.doctorName || 'Dr. Deepa Madhavan'}
        appointmentDate={selectedVideoRoom?.date}
        slotTime={selectedVideoRoom?.slot}
        appointmentId={selectedVideoRoom?.appointmentId}
      />
    </div>
  );
}
