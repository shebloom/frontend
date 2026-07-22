'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  Paperclip,
  X,
  PhoneOff,
  User as UserIcon,
  Calendar,
  FileText,
  Weight,
  Ruler,
  Droplets,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Stethoscope,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  created_at: string;
}

const timesList = Array.from({ length: 25 }).map((_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? '00' : '30';
  const hStr = h.toString().padStart(2, '0');
  return `${hStr}:${m}`;
});

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  
  const otherUserId = params.id as string;
  const [realConversationId, setRealConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openDataURL = (dataUrl: string, fileName: string = 'attachment') => {
    try {
      const parts = dataUrl.split(';base64,');
      if (parts.length !== 2) {
        window.open(dataUrl, '_blank');
        return;
      }
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const url = URL.createObjectURL(blob);
      
      const w = window.open(url, '_blank');
      if (!w) {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
      }
    } catch (e) {
      console.error('Failed to open data URL:', e);
      window.open(dataUrl, '_blank');
    }
  };
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Booking Checks
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [isConfirmedBooking, setIsConfirmedBooking] = useState(false);
  const [hasRescheduledAutoSent, setHasRescheduledAutoSent] = useState(false);

  // Doctor side Patient Drawer
  const [showPatientDrawer, setShowPatientDrawer] = useState(false);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  
  // Reschedule Form inside Drawer
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('09:00');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  // Reschedule Modal State (Patient & Doctor Chat)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [modalRescheduleDate, setModalRescheduleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [modalRescheduleSlots, setModalRescheduleSlots] = useState<{ time: string; isBooked: boolean }[]>([]);
  const [loadingModalSlots, setLoadingModalSlots] = useState(false);
  const [modalSelectedSlot, setModalSelectedSlot] = useState<string | null>(null);
  const [sendingRescheduleReq, setSendingRescheduleReq] = useState(false);
  const [acceptingRescheduleId, setAcceptingRescheduleId] = useState<string | null>(null);

  // Call state
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const isAiMode = otherUserId === 'ai' || otherUserId === '00000000-0000-0000-0000-0000000000a1';

  // Resolve conversation
  useEffect(() => {
    async function resolveConvo() {
      try {
        if (isAiMode) {
          setOtherUser({
            id: 'ai',
            full_name: 'AI Health Assistant',
            avatar_url: '/images/logo_icon.png',
            specialty: 'Educational AI Guide'
          });
          const res = await apiFetch('/chat/conversations', {
            method: 'POST',
            body: JSON.stringify({ recipientId: 'ai' })
          });
          const convo = res.conversation;
          setRealConversationId(convo.id);
          loadMessages(convo.id);
          return;
        }

        const res = await apiFetch('/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ recipientId: otherUserId })
        });
        const convo = res.conversation;
        setRealConversationId(convo.id);
        
        // Resolve other user name and details
        const other = profile?.role === 'doctor' ? convo.patients : convo.doctors?.users;
        setOtherUser(other);
        
        loadMessages(convo.id);
      } catch (err: any) {
        console.error('Failed to resolve conversation:', err);
      } finally {
        setLoading(false);
      }
    }

    if (profile && otherUserId) {
      resolveConvo();
    }
  }, [otherUserId, profile, isAiMode]);

  // Load patient details if current user is doctor
  useEffect(() => {
    if (profile?.role === 'doctor' && otherUserId) {
      // 1. Vitals/Profile
      apiFetch(`/doctor-portal/patients/${otherUserId}`)
        .then(res => setPatientProfile(res.patient))
        .catch(console.error);

      // 2. Health Documents
      apiFetch(`/doctor-portal/patients/${otherUserId}/health-records`)
        .then(res => setPatientRecords(res.records || []))
        .catch(console.error);

      // 3. Appointments
      apiFetch('/doctor-portal/appointments')
        .then(res => {
          const list = (res.appointments || []).filter(
            (a: any) => a.patient_id === otherUserId && ['pending', 'confirmed', 'rescheduled'].includes(a.status)
          );
          setPatientAppointments(list);
          if (list.length > 0) {
            setRescheduleDate(list[0].appointment_date);
            setRescheduleTime(list[0].slot_time.substring(0, 5));
          }
        })
        .catch(console.error);
    }
  }, [profile, otherUserId]);

  // Query appointments to find the confirmed booking status
  useEffect(() => {
    if (profile && otherUserId) {
      if (profile.role === 'patient') {
        apiFetch('/appointments')
          .then(res => {
            const list = res.appointments || [];
            const booking = list.find(
              (a: any) => (a.doctors?.users?.id === otherUserId || a.doctor_id === otherUserId) && ['pending', 'confirmed', 'rescheduled', 'reschedule_requested'].includes(a.status)
            );
            setActiveBooking(booking);
            setIsConfirmedBooking(['confirmed', 'rescheduled', 'reschedule_requested'].includes(booking?.status));
          })
          .catch(console.error);
      } else if (profile.role === 'doctor') {
        apiFetch('/doctor-portal/appointments')
          .then(res => {
            const list = res.appointments || [];
            const booking = list.find(
              (a: any) => a.patient_id === otherUserId && ['pending', 'confirmed', 'rescheduled', 'reschedule_requested'].includes(a.status)
            );
            setActiveBooking(booking);
            setIsConfirmedBooking(['confirmed', 'rescheduled', 'reschedule_requested'].includes(booking?.status));
          })
          .catch(console.error);
      }
    }
  }, [profile, otherUserId]);

  // Fetch slots for reschedule modal
  useEffect(() => {
    if (!showRescheduleModal) return;
    const docId = activeBooking?.doctor_id || 'deepa-doc-id';
    async function fetchModalSlots() {
      try {
        setLoadingModalSlots(true);
        const offset = new Date().getTimezoneOffset() * -1;
        const res = await apiFetch(`/doctors/${docId}/slots?date=${modalRescheduleDate}&offset=${offset}`);
        setModalRescheduleSlots(res.slots || []);
      } catch (err) {
        console.error('Failed to load slots for reschedule modal:', err);
      } finally {
        setLoadingModalSlots(false);
      }
    }
    fetchModalSlots();
  }, [showRescheduleModal, modalRescheduleDate, activeBooking]);

  const handleSendRescheduleProposal = async () => {
    if (!activeBooking?.id || !modalRescheduleDate || !modalSelectedSlot) return;
    setSendingRescheduleReq(true);
    try {
      const res = await apiFetch(`/appointments/${activeBooking.id}/reschedule-request`, {
        method: 'POST',
        body: JSON.stringify({
          new_date: modalRescheduleDate,
          new_slot_time: modalSelectedSlot,
        }),
      });

      if (res.success) {
        setShowRescheduleModal(false);
        setModalSelectedSlot(null);
        if (realConversationId) await loadMessages(realConversationId);
      } else {
        alert(res.error || 'Failed to send reschedule request');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to request reschedule');
    } finally {
      setSendingRescheduleReq(false);
    }
  };

  const handleAcceptReschedule = async (apptId: string, newDate: string, newTime: string) => {
    setAcceptingRescheduleId(apptId);
    try {
      const res = await apiFetch(`/appointments/${apptId}/reschedule-accept`, {
        method: 'POST',
        body: JSON.stringify({
          new_date: newDate,
          new_slot_time: newTime,
        }),
      });

      if (res.success) {
        if (realConversationId) await loadMessages(realConversationId);
        setIsConfirmedBooking(true);
        if (res.appointment) setActiveBooking(res.appointment);
      } else {
        alert(res.error || 'Failed to accept reschedule');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept reschedule');
    } finally {
      setAcceptingRescheduleId(null);
    }
  };

  // Load messages
  const loadMessages = async (convoId: string) => {
    if (!convoId) return;
    try {
      const data = await apiFetch(`/chat/messages/${convoId}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  // Poll for messages
  useEffect(() => {
    if (!realConversationId) return;
    pollRef.current = setInterval(() => loadMessages(realConversationId), 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [realConversationId]);

  // Auto-send reschedule message if parameter exists
  useEffect(() => {
    if (realConversationId && searchParams.get('reschedule') === 'true' && !hasRescheduledAutoSent && profile?.role === 'patient') {
      setHasRescheduledAutoSent(true);
      apiFetch('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: realConversationId,
          content: 'I would love to reschedule my consultation.',
        }),
      }).then(() => {
        loadMessages(realConversationId);
        // Clear url parameters
        const urlWithoutParams = window.location.pathname;
        window.history.replaceState({}, '', urlWithoutParams);
      }).catch(console.error);
    }
  }, [realConversationId, searchParams, hasRescheduledAutoSent, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Clean up call on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    const textToSend = input.trim();
    setInput('');

    try {
      if (isAiMode) {
        // AI Health Assistant Endpoint
        const res = await apiFetch('/chat/ai/message', {
          method: 'POST',
          body: JSON.stringify({ content: textToSend }),
        });
        if (res.conversationId) {
          setRealConversationId(res.conversationId);
          await loadMessages(res.conversationId);
        }
      } else {
        if (!realConversationId) return;
        await apiFetch('/chat/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversation_id: realConversationId,
            content: textToSend,
          }),
        });
        await loadMessages(realConversationId);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !realConversationId) return;
    setSending(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await apiFetch('/chat/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversation_id: realConversationId,
            content: `📎 ${file.name}`,
            attachment_url: base64,
          }),
        });
        await loadMessages(realConversationId);
        setSending(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to send attachment', err);
      setSending(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Doctor Reschedule Appointment
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientAppointments.length === 0) return;
    const activeAppt = patientAppointments[0];

    try {
      const res = await apiFetch(`/doctor-portal/appointments/${activeAppt.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          appointment_date: rescheduleDate,
          slot_time: rescheduleTime,
          status: 'rescheduled'
        })
      });

      // Update local state
      setPatientAppointments([res.appointment]);
      setRescheduleSuccess('Rescheduled successfully!');
      
      // Auto post to chat
      await apiFetch('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: realConversationId,
          content: `📅 Consultation rescheduled to ${new Date(rescheduleDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at ${rescheduleTime}.`
        })
      });
      await loadMessages(realConversationId);

      setTimeout(() => setRescheduleSuccess(''), 3000);
    } catch (err) {
      alert('Failed to reschedule appointment.');
    }
  };

  // ─── WebRTC Calling ──────────────────────────────────────────────────────
  const startCall = async (type: 'voice' | 'video') => {
    setCallType(type);
    setCallActive(true);
    setCallDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('Could not access your camera/microphone. Please check permissions.');
      setCallActive(false);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallActive(false);
    setCallDuration(0);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const computedBmi = patientProfile?.weight_kg && patientProfile?.height_cm
    ? (patientProfile.weight_kg / Math.pow(patientProfile.height_cm / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="absolute inset-x-0 top-0 bottom-[80px] flex flex-col bg-lavender-100 overflow-hidden">
      {/* Call Overlay */}
      {callActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-bloom-900">
          {callType === 'video' ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-24 right-4 h-36 w-28 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
              />
            </>
          ) : (
            <>
              <div className="h-24 w-24 rounded-full bg-bloom-200 flex items-center justify-center mb-6">
                <Phone className="h-10 w-10 text-bloom-700" />
              </div>
              <h3 className="text-xl font-bold text-white">Voice Call</h3>
              <p className="text-sm text-white/60 mt-1">Connected</p>
            </>
          )}

          <p className="mt-4 text-2xl font-mono text-white/80 tracking-widest">
            {formatDuration(callDuration)}
          </p>

          <button
            onClick={endCall}
            className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition active:scale-90"
          >
            <PhoneOff className="h-7 w-7" />
          </button>
        </div>
      )}

      {/* Chat header */}
      <header className="flex items-center gap-3 border-b border-bloom-100 bg-white px-4 py-3 shadow-bloom-card z-10">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bloom-50"
        >
          <ArrowLeft className="h-5 w-5 text-bloom-700" />
        </button>

        <div className="h-10 w-10 overflow-hidden rounded-full bg-bloom-100 shrink-0 flex items-center justify-center">
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-bold text-bloom-600 text-sm">
              {profile?.role === 'doctor' ? 'P' : 'Dr'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-800">
            {otherUser?.full_name || (profile?.role === 'doctor' ? 'Patient' : 'Doctor')}
          </h2>
          <p className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </p>
        </div>

        {/* Action Buttons: Voice, Video calls, Reschedule, Patient Info Panel */}
        <div className="flex items-center gap-1">
          {activeBooking && !isAiMode && (
            <button
              onClick={() => setShowRescheduleModal(true)}
              title="Reschedule Consultation"
              className="flex h-9 px-2.5 items-center gap-1 rounded-full text-[#5b21b6] hover:bg-pink-50 text-xs font-bold border border-pink-200 shadow-2xs"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Reschedule</span>
            </button>
          )}

          {isConfirmedBooking && (
            <>
              <button
                onClick={() => startCall('voice')}
                title="Voice Call"
                className="flex h-9 w-9 items-center justify-center rounded-full text-bloom-600 hover:bg-bloom-50"
              >
                <Phone className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => startCall('video')}
                title="Video Call"
                className="flex h-9 w-9 items-center justify-center rounded-full text-bloom-600 hover:bg-bloom-50"
              >
                <Video className="h-4.5 w-4.5" />
              </button>
            </>
          )}

          {profile?.role === 'doctor' && (
            <button
              onClick={() => setShowPatientDrawer(!showPatientDrawer)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-bloom-600 transition",
                showPatientDrawer ? "bg-bloom-50" : "hover:bg-bloom-50"
              )}
            >
              <UserIcon className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main chat body with slide-out drawer on right */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-lavender-100 px-4 py-4 scrollbar-hide">
          <div className="flex justify-center">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-400 shadow-sm">
              Today
            </span>
          </div>

          {loading ? (
            <p className="text-center text-xs text-slate-400 py-8">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No messages yet. Say hello! 👋</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                      isMe
                        ? 'bg-bloom-gradient text-white rounded-tr-md shadow-bloom-btn'
                        : 'bg-white text-slate-700 rounded-tl-md border border-bloom-100/30',
                    )}
                  >
                    {/* Attachment preview */}
                    {msg.attachment_url && (
                      <div className="mb-2">
                        {msg.attachment_url.startsWith('data:image') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={msg.attachment_url}
                            alt="attachment"
                            className="rounded-xl max-h-48 object-cover cursor-pointer hover:opacity-95 transition"
                            onClick={() => {
                              const w = window.open();
                              if (w) w.document.write('<img src="' + msg.attachment_url + '" style="max-width:100%"/>');
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => openDataURL(msg.attachment_url!, msg.content || 'attachment')}
                            className={cn(
                              'flex items-center gap-1.5 text-xs font-semibold underline bg-transparent border-0 cursor-pointer p-0 align-baseline',
                              isMe ? 'text-white/90 hover:text-white' : 'text-bloom-600 hover:text-[#5b21b6]'
                            )}
                          >
                            <Paperclip className="h-3.5 w-3.5" /> View Attachment
                          </button>
                        )}
                      </div>
                    )}
                    {msg.content && msg.content.includes('[RESCHEDULE_PROPOSAL]') ? (
                      (() => {
                        const matchDate = msg.content.match(/Date:\s*([^(]+)\(([^)]+)\)/);
                        const matchTime = msg.content.match(/Time:\s*([^\s|]+)/);
                        const matchAppt = msg.content.match(/ApptID:\s*([^\s|]+)/);

                        const formattedDateStr = matchDate ? matchDate[1].trim() : 'New Date';
                        const rawDateStr = matchDate ? matchDate[2].trim() : '';
                        const slotTimeStr = matchTime ? matchTime[1].trim() : '';
                        const apptIdStr = matchAppt ? matchAppt[1].trim() : '';

                        return (
                          <div className="bg-amber-50/95 border border-amber-200 rounded-xl p-3 my-1 text-slate-800 shadow-xs">
                            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>Consultation Reschedule Proposal</span>
                            </div>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">
                              Proposed Date: <span className="font-extrabold text-amber-900">{formattedDateStr}</span> at <span className="font-extrabold text-amber-900">{slotTimeStr}</span>
                            </p>
                            {!isMe ? (
                              <button
                                onClick={() => handleAcceptReschedule(apptIdStr, rawDateStr, slotTimeStr)}
                                disabled={acceptingRescheduleId === apptIdStr}
                                className="mt-2.5 w-full py-2 px-3 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {acceptingRescheduleId === apptIdStr ? 'Confirming Schedule...' : 'Agree & Confirm Reschedule'}
                              </button>
                            ) : (
                              <p className="text-[10px] text-amber-700 font-semibold italic mt-1.5">
                                Waiting for confirmation from {profile?.role === 'doctor' ? 'patient' : 'doctor'} in chat...
                              </p>
                            )}
                          </div>
                        );
                      })()
                    ) : msg.content ? (
                      <div className="whitespace-pre-line">
                        {msg.content}
                      </div>
                    ) : null}

                    {/* Book consultation prompt for AI Assistant responses */}
                    {(isAiMode || msg.sender_id === '00000000-0000-0000-0000-0000000000a1') && !isMe && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                        <p className="text-[10px] text-slate-500 font-semibold">Need official personalized medical advice from Dr. Deepa Madhavan?</p>
                        <button
                          type="button"
                          onClick={() => router.push('/consult')}
                          className="w-full py-2 px-3 bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          Book a Consultation with Dr. Deepa Madhavan
                        </button>
                      </div>
                    )}

                    <span className={cn('mt-1 block text-[9px] text-right', isMe ? 'text-white/75' : 'text-slate-400')}>
                      {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Doctor-side Patient Info & Reschedule Slide-out Drawer */}
        {profile?.role === 'doctor' && showPatientDrawer && (
          <div className="absolute top-0 right-0 h-full w-80 bg-white border-l border-bloom-100 shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-bloom-50 bg-slate-50 shrink-0">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Patient Dashboard</h3>
              <button
                onClick={() => setShowPatientDrawer(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
              {/* Profile details */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Profile</p>
                {patientProfile ? (
                  <div className="space-y-2 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-xl p-2 border border-bloom-50/50 flex flex-col items-center">
                        <Weight className="h-4 w-4 text-bloom-600" />
                        <span className="text-[11px] font-black text-slate-800 mt-1">{patientProfile.weight_kg ? `${patientProfile.weight_kg} kg` : '--'}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Weight</span>
                      </div>
                      <div className="bg-white rounded-xl p-2 border border-bloom-50/50 flex flex-col items-center">
                        <Ruler className="h-4 w-4 text-bloom-600" />
                        <span className="text-[11px] font-black text-slate-800 mt-1">{patientProfile.height_cm ? `${patientProfile.height_cm} cm` : '--'}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Height</span>
                      </div>
                      <div className="bg-white rounded-xl p-2 border border-bloom-50/50 flex flex-col items-center">
                        <UserIcon className="h-4 w-4 text-bloom-600" />
                        <span className="text-[11px] font-black text-slate-800 mt-1">{computedBmi || '--'}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">BMI</span>
                      </div>
                      <div className="bg-white rounded-xl p-2 border border-bloom-50/50 flex flex-col items-center">
                        <Droplets className="h-4 w-4 text-bloom-600" />
                        <span className="text-[11px] font-black text-slate-800 mt-1">{patientProfile.blood_group || '--'}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Blood</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold space-y-1.5 pt-2 border-t border-slate-200/50">
                      <p>Name: <span className="text-slate-800 font-extrabold">{patientProfile.full_name || 'Patient'}</span></p>
                      <p>Date of Birth: <span className="text-slate-800 font-bold">{patientProfile.date_of_birth ? new Date(patientProfile.date_of_birth).toLocaleDateString('en-GB') : '--'}</span></p>
                      <p>Phone: <span className="text-slate-800 font-bold">{patientProfile.phone || '--'}</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Loading patient metrics...</p>
                )}
              </div>

              {/* Consultation Rescheduling */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Consultation</p>
                {patientAppointments.length > 0 ? (
                  <form onSubmit={handleRescheduleSubmit} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                    <div className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      <p>Current booking:</p>
                      <p className="text-bloom-700 font-black mt-0.5">
                        {new Date(patientAppointments[0].appointment_date).toLocaleDateString('en-GB')} at {patientAppointments[0].slot_time.substring(0, 5)}
                      </p>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">New Date</label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={e => setRescheduleDate(e.target.value)}
                        className="h-9 w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">New Time</label>
                      <select
                        value={rescheduleTime}
                        onChange={e => setRescheduleTime(e.target.value)}
                        className="h-9 w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2 focus:outline-none"
                      >
                        {timesList.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {rescheduleSuccess && (
                      <div className="text-[9px] font-bold text-green-600 bg-green-50 p-2 rounded-lg flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {rescheduleSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full h-9 bg-bloom-600 hover:bg-bloom-700 text-white font-bold text-xs rounded-xl flex items-center justify-center shadow-sm"
                    >
                      Update Schedule
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold">No active bookings found.</p>
                )}
              </div>

              {/* Uploaded medical documents */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Records</p>
                {patientRecords.length > 0 ? (
                  <div className="space-y-2">
                    {patientRecords.map((rec) => {
                      const filename = rec.file_url?.split('/').pop() || 'report.pdf';
                      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/doctor-portal/patients/${otherUserId}/documents/${filename}`;
                      return (
                        <div key={rec.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                          <FileText className="h-4.5 w-4.5 text-bloom-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-700 truncate">{rec.file_name || rec.record_type}</p>
                            <p className="text-[8px] text-slate-400 font-semibold">{new Date(rec.record_date).toLocaleDateString('en-GB')}</p>
                          </div>
                          {rec.file_url && (
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={filename}
                              className="h-7 w-7 rounded-lg hover:bg-bloom-100 flex items-center justify-center text-bloom-600 shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 border border-slate-100 rounded-2xl font-semibold">No health records uploaded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar / lock banner */}
      <div className="border-t border-bloom-100 bg-white px-4 py-3 shrink-0">
        {!isConfirmedBooking && profile?.role === 'patient' ? (
          /* Locked State for Patients */
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-2.5 items-start">
            <Clock className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-normal font-semibold">
              Chat features and calling capabilities will be unlocked once your booking status is set to <span className="font-bold">confirmed</span>.
            </p>
          </div>
        ) : (
          /* Standard Input Bar */
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bloom-50 hover:bg-bloom-100 transition"
            >
              <Paperclip className="h-5 w-5 text-bloom-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleSendAttachment}
            />
            <div className="flex flex-1 items-center rounded-full border border-bloom-100 bg-lavender-50 px-4 py-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bloom-gradient text-white shadow-bloom-btn transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Reschedule Consultation Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#5b21b6]" />
                <h3 className="font-bold text-slate-800 text-base">Request Consultation Reschedule</h3>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Select a new date and available time slot. A reschedule proposal will be sent directly into chat for mutual agreement.
            </p>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select New Date</label>
              <input
                type="date"
                value={modalRescheduleDate}
                onChange={(e) => setModalRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-bloom-300 focus:outline-none"
              />
            </div>

            {/* Slots Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Available Time Slot</label>
              {loadingModalSlots ? (
                <p className="text-xs text-slate-400 animate-pulse text-center py-4">Checking slots availability...</p>
              ) : modalRescheduleSlots.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl text-center font-semibold border border-amber-100">No available slots on this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                  {modalRescheduleSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={slot.isBooked}
                      onClick={() => setModalSelectedSlot(slot.time)}
                      className={cn(
                        'py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center',
                        slot.isBooked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed opacity-50'
                          : modalSelectedSlot === slot.time
                          ? 'bg-[#5b21b6] text-white border-[#5b21b6] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#5b21b6]'
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 h-11 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={!modalSelectedSlot || sendingRescheduleReq}
                onClick={handleSendRescheduleProposal}
                className="flex-1 h-11 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-extrabold rounded-full text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {sendingRescheduleReq ? 'Sending Request...' : 'Send Reschedule Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
