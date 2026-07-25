'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { Phone, PhoneOff, Video, MessageSquare, X, Clock, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { VideoRoomModal } from './VideoRoomModal';
import { apiFetch } from '@/lib/api';

// ─── Type Definitions ────────────────────────────────────────────────────────

interface CallAlert {
  appointmentId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  recipientId: string;
  roomUrl: string;
  date?: string;
  slot?: string;
  expiresAt: number;
  type: 'incoming_call' | 'patient_is_waiting';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RealtimeNotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Incoming call/waiting alert (with 15-minute persistence)
  const [incomingCall, setIncomingCall] = useState<CallAlert | null>(null);
  const [remainingSecs, setRemainingSecs] = useState<number>(0);

  // Accepted call modal
  const [activeCallRoom, setActiveCallRoom] = useState<{
    url: string;
    doctorName?: string;
    patientName?: string;
    appointmentId?: string;
    patientId?: string;
    date?: string;
    slot?: string;
  } | null>(null);

  // Toast chat message
  const [chatToast, setChatToast] = useState<{
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
  } | null>(null);

  // Store subscribed room channels so we can clean them up
  const roomChannelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  // ─── Restore persistent 15-minute call alert on mount ────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !profile?.id) return;
    try {
      const saved = sessionStorage.getItem('shebloom_pending_call_alert');
      if (saved) {
        const parsed: CallAlert = JSON.parse(saved);
        // STRICT validation: only restore if explicitly for this user
        if (parsed && parsed.expiresAt > Date.now() && parsed.recipientId === profile.id) {
          setIncomingCall(parsed);
        } else {
          sessionStorage.removeItem('shebloom_pending_call_alert');
        }
      }
    } catch (e) {}
  }, [profile?.id]);

  // ─── 15-Minute Expiration Countdown ──────────────────────────────────────
  useEffect(() => {
    if (!incomingCall) {
      setRemainingSecs(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((incomingCall.expiresAt - Date.now()) / 1000));
      setRemainingSecs(diff);
      if (diff <= 0) {
        setIncomingCall(null);
        sessionStorage.removeItem('shebloom_pending_call_alert');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [incomingCall]);

  // ─── Browser Notification Permission ─────────────────────────────────────
  useEffect(() => {
    if (profile && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [profile]);

  // ─── Subscribe to Appointment-Specific Rooms (ISOLATED SIGNALING) ─────────
  useEffect(() => {
    if (!profile?.id) return;

    // Clean up previous subscriptions
    roomChannelsRef.current.forEach((ch) => {
      supabase.removeChannel(ch);
    });
    roomChannelsRef.current = [];

    // Fetch user's appointments to know which rooms to subscribe to
    const subscribeToAppointmentRooms = async () => {
      try {
        const res = await apiFetch('/appointments');
        const appointments: any[] = res.appointments || [];

        for (const appt of appointments) {
          const roomName = `appointment-room-${appt.id}`;

          const ch = supabase.channel(roomName, {
            config: { broadcast: { self: false } },
          });

          ch
            .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
              if (!payload) return;

              // STRICT recipient check: payload.recipientId MUST exactly match current user's ID
              if (payload.recipientId !== profile.id) {
                return;
              }

              // Don't show if caller is ourselves
              if (payload.callerId === profile.id) return;

              // Don't show if already in a call
              if (activeCallRoom !== null || (typeof window !== 'undefined' && (window as any).shebloom_is_in_call)) {
                return;
              }

              const callData: CallAlert = {
                appointmentId: payload.appointmentId,
                callerId: payload.callerId,
                callerName: payload.callerName || 'Doctor',
                callerAvatar: payload.callerAvatar,
                recipientId: payload.recipientId,
                roomUrl: payload.roomUrl,
                date: payload.date,
                slot: payload.slot,
                expiresAt: payload.expiresAt || (Date.now() + 15 * 60 * 1000),
                type: 'incoming_call',
              };

              setIncomingCall(callData);

              try {
                sessionStorage.setItem('shebloom_pending_call_alert', JSON.stringify(callData));
              } catch (e) {}

              // Browser push notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
                new Notification('Doctor Joined Your Consultation', {
                  body: `${payload.callerName} has joined the video consultation. Tap to join!`,
                  icon: payload.callerAvatar || '/images/logo_icon.png',
                });
              }
            })
            .on('broadcast', { event: 'patient_is_waiting' }, ({ payload }) => {
              if (!payload) return;

              // STRICT recipient check
              if (payload.recipientId !== profile.id) {
                return;
              }

              if (payload.callerId === profile.id) return;

              if (activeCallRoom !== null || (typeof window !== 'undefined' && (window as any).shebloom_is_in_call)) {
                return;
              }

              const callData: CallAlert = {
                appointmentId: payload.appointmentId,
                callerId: payload.callerId,
                callerName: payload.callerName || 'Patient',
                callerAvatar: payload.callerAvatar,
                recipientId: payload.recipientId,
                roomUrl: payload.roomUrl,
                date: payload.date,
                slot: payload.slot,
                expiresAt: payload.expiresAt || (Date.now() + 15 * 60 * 1000),
                type: 'patient_is_waiting',
              };

              setIncomingCall(callData);

              try {
                sessionStorage.setItem('shebloom_pending_call_alert', JSON.stringify(callData));
              } catch (e) {}

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
                new Notification('Patient is Waiting', {
                  body: `${payload.callerName} is waiting to start the wellness session. Join now!`,
                  icon: payload.callerAvatar || '/images/logo_icon.png',
                });
              }
            })
            .subscribe();

          roomChannelsRef.current.push(ch);
        }
      } catch (err) {
        console.error('[Notification] Failed to subscribe to appointment rooms:', err);
      }
    };

    subscribeToAppointmentRooms();

    return () => {
      roomChannelsRef.current.forEach((ch) => {
        supabase.removeChannel(ch);
      });
      roomChannelsRef.current = [];
    };
  }, [profile?.id]);

  // ─── Global Chat Message Notifications (unchanged — chat is not call-sensitive) ──
  useEffect(() => {
    if (!profile?.id) return;

    const chatChannel = supabase.channel('shebloom-chat-notifications', {
      config: { broadcast: { self: false } },
    });

    chatChannel
      .on('broadcast', { event: 'new_chat_message' }, ({ payload }) => {
        if (!payload) return;

        // Strict recipient check for chat too
        const isRecipient =
          payload.recipientId === profile.id ||
          payload.recipientUserId === profile.id;

        if (isRecipient && payload.senderId !== profile.id) {
          const currentChatPath = `/chat/${payload.senderId}`;
          const currentConvoPath = `/chat/${payload.conversationId}`;
          if (pathname !== currentChatPath && pathname !== currentConvoPath) {
            setChatToast({
              conversationId: payload.conversationId,
              senderId: payload.senderId,
              senderName: payload.senderName || 'Doctor / Patient',
              senderAvatar: payload.senderAvatar,
              content: payload.content || 'Sent an attachment',
            });

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
              new Notification(`New Message from ${payload.senderName || 'SheBloom'}`, {
                body: payload.content || 'Sent you a message',
                icon: payload.senderAvatar || '/images/logo_icon.png',
              });
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [profile?.id, pathname]);

  // ─── Accept Call Handler ──────────────────────────────────────────────────
  const handleAcceptCall = () => {
    if (!incomingCall) return;
    const isPatient = profile?.role === 'patient';

    setActiveCallRoom({
      url: incomingCall.roomUrl,
      doctorName: isPatient ? incomingCall.callerName : 'Dr. Deepa Madhavan',
      patientName: !isPatient ? incomingCall.callerName : (profile?.full_name || 'Patient'),
      appointmentId: incomingCall.appointmentId,
      patientId: isPatient ? profile?.id : incomingCall.callerId,
      date: incomingCall.date,
      slot: incomingCall.slot,
    });
    setIncomingCall(null);
    sessionStorage.removeItem('shebloom_pending_call_alert');
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
    sessionStorage.removeItem('shebloom_pending_call_alert');
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isWaitingAlert = incomingCall?.type === 'patient_is_waiting';

  return (
    <>
      {children}

      {/* ─── INCOMING CALL / PATIENT WAITING BANNER ──────────────────────── */}
      {incomingCall && (
        <div className="fixed top-4 inset-x-4 sm:left-auto sm:right-4 z-50 max-w-md bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-pink-500/50 animate-bounce-short">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl overflow-hidden bg-bloom-100 border-2 border-pink-400 shrink-0 flex items-center justify-center">
                {incomingCall.callerAvatar ? (
                  <img src={incomingCall.callerAvatar} alt="" className="h-full w-full object-cover" />
                ) : isWaitingAlert ? (
                  <UserCheck className="w-6 h-6 text-amber-400" />
                ) : (
                  <Video className="w-6 h-6 text-pink-500" />
                )}
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border border-white"></span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isWaitingAlert
                    ? 'text-amber-300 bg-amber-950/80 border-amber-800'
                    : 'text-pink-400 bg-pink-950/80 border-pink-800'
                }`}>
                  {isWaitingAlert ? 'Patient is Waiting' : 'Incoming Consultation Call'}
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                  ⏳ {formatCountdown(remainingSecs)}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white truncate mt-1">{incomingCall.callerName}</h4>
              <p className="text-[11px] text-slate-300 font-medium">
                {isWaitingAlert
                  ? 'Waiting to join the wellness session'
                  : 'Has joined the consultation room'}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              onClick={handleDeclineCall}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              {isWaitingAlert ? 'Dismiss' : 'Decline'}
            </button>

            <button
              onClick={handleAcceptCall}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-black shadow-lg shadow-green-900/40 transition active:scale-95 flex items-center gap-1.5"
            >
              <Video className="w-4 h-4 fill-white animate-pulse" />
              {isWaitingAlert ? 'Join Session' : 'Accept Call'}
            </button>
          </div>
        </div>
      )}

      {/* ─── ACTIVE VIDEO CALL MODAL ──────────────────────────────────────── */}
      {activeCallRoom && (
        <VideoRoomModal
          isOpen={true}
          onClose={() => {
            setActiveCallRoom(null);
            router.push('/profile');
          }}
          roomUrl={activeCallRoom.url}
          doctorName={activeCallRoom.doctorName}
          patientName={activeCallRoom.patientName}
          appointmentId={activeCallRoom.appointmentId}
          patientId={activeCallRoom.patientId}
          appointmentDate={activeCallRoom.date}
          slotTime={activeCallRoom.slot}
        />
      )}

      {/* ─── CHAT MESSAGE TOAST ───────────────────────────────────────────── */}
      {chatToast && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-purple-200 animate-slide-up flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#5b21b6] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-slate-900 truncate">{chatToast.senderName}</h5>
              <button onClick={() => setChatToast(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 truncate mt-0.5">{chatToast.content}</p>
            <button
              onClick={() => {
                const targetId = chatToast.senderId;
                setChatToast(null);
                router.push(`/chat/${targetId}`);
              }}
              className="text-[11px] font-bold text-[#5b21b6] hover:underline mt-1 block"
            >
              Reply →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
