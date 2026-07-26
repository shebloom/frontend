'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Maximize2,
  Minimize2,
  MessageSquare,
  Sparkles,
  User,
  FileText,
  Weight,
  Ruler,
  Droplets,
  Apple,
  Save,
  CheckCircle2,
  ChevronRight,
  X,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { openMedicalReport } from '@/lib/reports';
import { useAuth } from '@/components/auth-provider';

interface VideoRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  doctorName?: string;
  patientName?: string;
  appointmentDate?: string;
  slotTime?: string;
  patientId?: string;
  appointmentId?: string;
}

export function VideoRoomModal({
  isOpen,
  onClose,
  roomUrl,
  doctorName = 'Dr. Deepa Madhavan',
  patientName = 'Patient',
  appointmentDate,
  slotTime,
  patientId,
  appointmentId,
}: VideoRoomModalProps) {
  const { profile } = useAuth();
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const remoteName = profile?.role === 'doctor' ? patientName : doctorName;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).shebloom_is_in_call = isOpen;
    }
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).shebloom_is_in_call = false;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !appointmentId) return;
    // Wait until localStream is available before setting up WebRTC
    // This prevents the race condition where tracks are added before the stream is ready
    if (!localStream) {
      return;
    }

    let pc: RTCPeerConnection | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const signalingChannel = supabase.channel(`video-room-${appointmentId}`, {
      config: { broadcast: { self: false } },
    });

    const initPeerConnection = () => {
      if (pcRef.current) {
        pcRef.current.close();
      }

      pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
      });
      pcRef.current = pc;

      // ── Add all local tracks BEFORE creating any offer/answer ──────────────
      localStream.getTracks().forEach((track) => {
        pc?.addTrack(track, localStream);
      });

      // ── Remote track received ──────────────────────────────────────────────
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          setRemoteStream(stream);
          setHasRemoteVideo(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        }
      };

      // ── ICE candidate generated → broadcast to peer ────────────────────────
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          signalingChannel.send({
            type: 'broadcast',
            event: 'webrtc-ice',
            payload: { candidate: event.candidate, senderId: profile?.id },
          });
        }
      };

      pc.onicegatheringstatechange = () => {};

      // ── ICE connection state — handle reconnection ─────────────────────────
      pc.oniceconnectionstatechange = () => {
        const state = pc?.iceConnectionState;

        if (state === 'connected' || state === 'completed') {
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
        } else if (state === 'disconnected') {
          reconnectTimeout = setTimeout(async () => {
            if (!pcRef.current || pcRef.current.iceConnectionState !== 'disconnected') return;
            try {
              const offer = await pcRef.current.createOffer({ iceRestart: true });
              await pcRef.current.setLocalDescription(offer);
              signalingChannel.send({
                type: 'broadcast',
                event: 'webrtc-offer',
                payload: { offer, senderId: profile?.id, isReconnect: true },
              });
            } catch (e) {
              console.error('[WebRTC] Reconnection offer failed:', e);
            }
          }, 3000);
        } else if (state === 'failed') {
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
        }
      };

      pc.onsignalingstatechange = () => {};

      pc.onconnectionstatechange = () => {};
    };

    signalingChannel
      .on('broadcast', { event: 'state-change' }, ({ payload }) => {
        const isDoc = profile?.role === 'doctor';
        if (isDoc) {
          if (payload.patientMic !== undefined) setRemoteMicOn(payload.patientMic);
          if (payload.patientCam !== undefined) setRemoteCameraOn(payload.patientCam);
        } else {
          if (payload.doctorMic !== undefined) setRemoteMicOn(payload.doctorMic);
          if (payload.doctorCam !== undefined) setRemoteCameraOn(payload.doctorCam);
        }
      })
      .on('broadcast', { event: 'webrtc-join' }, async ({ payload }) => {
        if (payload?.senderId === profile?.id) return;
        if (pcRef.current && (profile?.role === 'doctor' || payload?.senderRole === 'patient')) {
          try {
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            signalingChannel.send({
              type: 'broadcast',
              event: 'webrtc-offer',
              payload: { offer, senderId: profile?.id },
            });
          } catch (e) {
            console.error('[WebRTC] Offer creation error:', e);
          }
        }
      })
      .on('broadcast', { event: 'webrtc-offer' }, async ({ payload }) => {
        if (payload?.senderId === profile?.id || !pcRef.current) return;
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          signalingChannel.send({
            type: 'broadcast',
            event: 'webrtc-answer',
            payload: { answer, senderId: profile?.id },
          });
        } catch (e) {
          console.error('[WebRTC] Answer creation error:', e);
        }
      })
      .on('broadcast', { event: 'webrtc-answer' }, async ({ payload }) => {
        if (payload?.senderId === profile?.id || !pcRef.current) return;
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        } catch (e) {
          console.error('[WebRTC] setRemoteDescription (answer) error:', e);
        }
      })
      .on('broadcast', { event: 'webrtc-ice' }, async ({ payload }) => {
        if (payload?.senderId === profile?.id || !pcRef.current) return;
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {
          // Benign: can happen if remote description not set yet
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          initPeerConnection();
          const isDoc = profile?.role === 'doctor';
          signalingChannel.send({
            type: 'broadcast',
            event: 'state-change',
            payload: isDoc
              ? { doctorMic: micOn, doctorCam: cameraOn }
              : { patientMic: micOn, patientCam: cameraOn },
          });
          signalingChannel.send({
            type: 'broadcast',
            event: 'webrtc-join',
            payload: { senderId: profile?.id, senderRole: profile?.role },
          });
        }
      });

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      supabase.removeChannel(signalingChannel);
    };
  }, [isOpen, appointmentId, localStream, profile, micOn, cameraOn]);

  const sendStateUpdate = (newMic: boolean, newCam: boolean) => {
    if (!appointmentId) return;
    const isDoc = profile?.role === 'doctor';
    const channel = supabase.channel(`video-room-${appointmentId}`);
    channel.send({
      type: 'broadcast',
      event: 'state-change',
      payload: isDoc 
        ? { doctorMic: newMic, doctorCam: newCam } 
        : { patientMic: newMic, patientCam: newCam }
    });
  };

  const handleToggleMic = () => {
    const nextVal = !micOn;
    setMicOn(nextVal);
    sendStateUpdate(nextVal, cameraOn);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = nextVal);
    }
  };

  const handleToggleCamera = () => {
    const nextVal = !cameraOn;
    setCameraOn(nextVal);
    sendStateUpdate(micOn, nextVal);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = nextVal);
    }
  };

  // Simulation mode fallback (for when Daily.co URL returns 404 or fails)
  const [useSimulation, setUseSimulation] = useState(false);

  // Split-screen Patient Info State
  const [showPatientInfo, setShowPatientInfo] = useState(!!patientId);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Diet & Med plan states
  const [dietPlanId, setDietPlanId] = useState<string | null>(null);
  const [dietTitle, setDietTitle] = useState('PCOS anti-inflammatory');
  const [dietGuidelines, setDietGuidelines] = useState('');
  const [medications, setMedications] = useState('');
  
  // Meal Structure & Alternatives state
  const [breakfastPrimary, setBreakfastPrimary] = useState('');
  const [breakfastAlt, setBreakfastAlt] = useState('');
  const [lunchPrimary, setLunchPrimary] = useState('');
  const [lunchAlt, setLunchAlt] = useState('');
  const [snackPrimary, setSnackPrimary] = useState('');
  const [snackAlt, setSnackAlt] = useState('');
  const [dinnerPrimary, setDinnerPrimary] = useState('');
  const [dinnerAlt, setDinnerAlt] = useState('');

  const [savingTreatment, setSavingTreatment] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Prescription Form State
  const [rxMedication, setRxMedication] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');
  const [rxIsSigning, setRxIsSigning] = useState(true);
  const [rxSending, setRxSending] = useState(false);
  const [rxSuccess, setRxSuccess] = useState('');

  const [doctorActiveTab, setDoctorActiveTab] = useState<'profile' | 'diet' | 'prescription'>('profile');

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (isOpen && patientId && profile?.role === 'doctor') {
      setLoadingPatient(true);
      Promise.all([
        apiFetch(`/doctor-portal/patients/${patientId}`),
        apiFetch(`/doctor-portal/patients/${patientId}/health-records`),
      ])
        .then(([profRes, recsRes]) => {
          setPatientProfile(profRes.patient);
          setPatientRecords(recsRes.records || []);
        })
        .catch(err => console.error("Error loading patient records inside call:", err))
        .finally(() => setLoadingPatient(false));

      // Fetch active diet plan for patient (pre-fills existing doctor or AI plan)
      const dietEndpoint = appointmentId ? `/diet/appointment/${appointmentId}` : `/diet/patient/${patientId}`;
      apiFetch(dietEndpoint)
        .then(res => {
          if (res.diet_plan) return res.diet_plan;
          if (patientId) {
            return apiFetch(`/diet/patient/${patientId}`).then(pRes => pRes.diet_plan);
          }
          return null;
        })
        .then(plan => {
          if (plan) {
            setDietPlanId(plan.id);
            setDietTitle(plan.title || '');
            setMedications(plan.plan_details?.medications || '');
            
            const details = plan.plan_details || {};
            const ms = details.meal_structure || {};
            setBreakfastPrimary(ms.breakfast || '');
            setBreakfastAlt(ms.breakfast_alternate || ms.breakfastAlternate || '');
            setLunchPrimary(ms.lunch || '');
            setLunchAlt(ms.lunch_alternate || ms.lunchAlternate || '');
            setSnackPrimary(ms.snack || '');
            setSnackAlt(ms.snack_alternate || ms.snackAlternate || '');
            setDinnerPrimary(ms.dinner || '');
            setDinnerAlt(ms.dinner_alternate || ms.dinnerAlternate || '');

            const guidelinesText = details?.guidelines
              ? (Array.isArray(details.guidelines) ? details.guidelines.join('\n') : details.guidelines)
              : '';
            setDietGuidelines(guidelinesText);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, patientId, appointmentId, profile]);

  const handleSaveTreatment = async () => {
    if (!patientId || !dietTitle.trim()) return;
    setSavingTreatment(true);
    setSaveSuccess('');
    try {
      const parsedGuidelines = dietGuidelines.split('\n').filter(line => line.trim());
      const planDetails = {
        summary: `Custom treatment plan assigned by ${doctorName} during consultation.`,
        guidelines: parsedGuidelines,
        medications: medications,
        meal_structure: {
          breakfast: breakfastPrimary,
          breakfast_alternate: breakfastAlt,
          lunch: lunchPrimary,
          lunch_alternate: lunchAlt,
          snack: snackPrimary,
          snack_alternate: snackAlt,
          dinner: dinnerPrimary,
          dinner_alternate: dinnerAlt,
        },
      };

      if (dietPlanId && !dietPlanId.startsWith('diet-')) {
        // Update existing plan
        await apiFetch(`/diet/${dietPlanId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: dietTitle,
            plan_details: planDetails,
          }),
        });
      } else {
        // Create new plan
        const res = await apiFetch('/diet/attach', {
          method: 'POST',
          body: JSON.stringify({
            appointment_id: appointmentId || null,
            patient_id: patientId,
            title: dietTitle,
            plan_details: planDetails,
          }),
        });
        if (res.diet_plan) setDietPlanId(res.diet_plan.id);
      }
      setSaveSuccess('Treatment plan saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save treatment plan');
    } finally {
      setSavingTreatment(false);
    }
  };

  const handleSendPrescription = async () => {
    if (!patientId || !rxMedication.trim()) return;
    setRxSending(true);
    setRxSuccess('');
    try {
      await apiFetch(`/health-records/prescriptions`, {
        method: 'POST',
        body: JSON.stringify({
          patient_id: patientId,
          medications: rxMedication,
          instructions: rxInstructions,
          is_signed: rxIsSigning,
          appointment_id: appointmentId || null,
        }),
      });
      setRxSuccess('Prescription PDF sent via chat!');
      setRxMedication('');
      setRxInstructions('');
      setTimeout(() => setRxSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send prescription');
    } finally {
      setRxSending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          stream.getAudioTracks().forEach(track => track.enabled = micOn);
          stream.getVideoTracks().forEach(track => track.enabled = cameraOn);
        })
        .catch(err => {
          console.warn("Camera/Mic access rejected or unavailable:", err);
        });
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (cameraOn && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [cameraOn, localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, hasRemoteVideo, remoteCameraOn]);

  useEffect(() => {
    if (isOpen && appointmentId) {
      apiFetch(`/appointments/${appointmentId}/events/presence`, {
        method: 'POST',
        body: JSON.stringify({ event: 'joined' }),
      }).catch(() => {});
    }
  }, [isOpen, appointmentId]);

  const handleClose = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (appointmentId) {
      void apiFetch(`/appointments/${appointmentId}/events/presence`, {
        method: 'POST',
        body: JSON.stringify({ event: 'left' }),
      }).catch(() => {});
      void apiFetch(`/appointments/${appointmentId}/end`, {
        method: 'POST',
      }).catch(() => {});
    }
    onClose();
    router.push('/home');
  };

  if (!isOpen) return null;

  const participantDisplayName = profile?.role === 'doctor'
    ? (profile?.full_name || doctorName || 'Dr. Deepa Madhavan')
    : (profile?.full_name || patientName || 'Patient');

  const encodedDisplayName = encodeURIComponent(participantDisplayName);

  const jitsiConfigHash = `#userInfo.displayName="${encodedDisplayName}"` +
    `&config.prejoinPageEnabled=false` +
    `&config.requireDisplayName=false` +
    `&config.SHOW_JITSI_WATERMARK=false` +
    `&config.SHOW_WATERMARK_FOR_GUESTS=false` +
    `&config.SHOW_BRAND_WATERMARK=false` +
    `&config.toolbarButtons=[]` +
    `&interfaceConfig.TOOLBAR_BUTTONS=[]` +
    `&interfaceConfig.SHOW_JITSI_WATERMARK=false` +
    `&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`;

  const formattedRoomUrl = roomUrl
    ? (roomUrl.includes('#') ? `${roomUrl.split('#')[0]}${jitsiConfigHash}` : `${roomUrl}${jitsiConfigHash}`)
    : '';

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Container */}
      <div className={cn(
        'w-full h-full bg-slate-900 sm:rounded-[32px] overflow-hidden flex flex-col relative border border-slate-800 shadow-2xl transition-all',
        isFullscreen ? 'max-w-none max-h-none rounded-none' : 'max-w-4xl max-h-[90vh]'
      )}>
        
        {/* Header Bar */}
        <div className="bg-slate-950/80 backdrop-blur-md px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-white shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5b21b6] flex items-center justify-center text-white">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm font-playfair">{doctorName} Video Consultation</h3>
                <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {useSimulation ? 'LOCAL WEBRTC SECURE' : 'LIVE ENCRYPTED'}
                </span>
              </div>
              {appointmentDate && (
                <p className="text-[10px] text-slate-400 font-medium">
                  {appointmentDate} at {slotTime || 'Scheduled Slot'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold font-mono text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40">
              {formatDuration(callDuration)}
            </span>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Body (Horizontal split if showPatientInfo is active) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Native HTML5 WebRTC Video Call Room */}
          <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
            <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950">
              {/* Local camera view */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[220px] md:h-auto">
                {cameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <VideoOff className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                    <p className="text-xs font-bold text-slate-400">Your camera is off</p>
                  </div>
                )}
                {!micOn && (
                  <span className="absolute top-3 right-3 bg-red-600/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-extrabold flex items-center gap-1 border border-red-500/30 shadow-md z-10">
                    <MicOff className="w-3.5 h-3.5" /> MUTED
                  </span>
                )}
                <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white border border-slate-800 uppercase tracking-wider z-10">
                  You (Secure Feed)
                </span>
              </div>

              {/* Remote client view (doctor or patient) */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[220px] md:h-auto">
                {remoteCameraOn ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <VideoOff className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                    <p className="text-xs font-bold text-slate-400">{remoteName}'s camera is off</p>
                  </div>
                )}
                {!remoteMicOn && (
                  <span className="absolute top-3 right-3 bg-red-600/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-extrabold flex items-center gap-1 border border-red-500/30 shadow-md z-10">
                    <MicOff className="w-3.5 h-3.5" /> MUTED
                  </span>
                )}
                <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white border border-slate-800 uppercase tracking-wider z-10">
                  {remoteName} (Consulting)
                </span>
              </div>
            </div>
          </div>

          {/* Right panel: Patient case file & Treatment updates (Doctor only) */}
          {profile?.role === 'doctor' && showPatientInfo && (
            <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden text-slate-800 animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="flex flex-col border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-playfair">Consultation Workspace</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Live Clinical Tools & Records</p>
                  </div>
                  <button
                    onClick={() => setShowPatientInfo(false)}
                    className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Tabs Switcher */}
                <div className="flex text-[10px] border-b border-slate-100">
                  {(['profile', 'diet', 'prescription'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDoctorActiveTab(tab)}
                      className={cn(
                        "flex-1 py-2.5 text-center font-bold uppercase tracking-wider border-b-2 transition-all",
                        doctorActiveTab === tab
                          ? "border-[#5b21b6] text-[#5b21b6] bg-white"
                          : "border-transparent text-slate-400 hover:text-slate-600 bg-slate-50"
                      )}
                    >
                      {tab === 'profile' ? 'Profile & Reports' : tab === 'diet' ? 'Diet Plan' : 'Prescribe'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {loadingPatient ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-1.5">
                    <div className="h-6 w-6 rounded-full border-2 border-bloom-200 border-t-bloom-600 animate-spin" />
                    <p className="text-[10px] font-semibold text-slate-400">Loading profile data...</p>
                  </div>
                ) : patientProfile ? (
                  <>
                    {/* TAB 1: PROFILE & REPORTS */}
                    {doctorActiveTab === 'profile' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Basic Patient Info */}
                        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-bloom-100 flex items-center justify-center font-bold text-bloom-600 text-sm">
                            {patientProfile.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-xs text-slate-800 truncate">{patientProfile.full_name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{patientProfile.email}</p>
                          </div>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/50 flex flex-col items-center text-center">
                            <Weight className="h-4 w-4 text-bloom-600" />
                            <span className="text-[11px] font-black text-slate-800 mt-1">{patientProfile.weight_kg ? `${patientProfile.weight_kg} kg` : '--'}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Weight</span>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/50 flex flex-col items-center text-center">
                            <Ruler className="h-4 w-4 text-bloom-600" />
                            <span className="text-[11px] font-black text-slate-800 mt-1">{patientProfile.height_cm ? `${patientProfile.height_cm} cm` : '--'}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Height</span>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/50 flex flex-col items-center text-center">
                            <User className="h-4 w-4 text-bloom-600" />
                            <span className="text-[11px] font-black text-slate-800 mt-1 text-center">
                              {patientProfile.date_of_birth ? `${calculateAge(patientProfile.date_of_birth)} yrs` : '--'}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Age</span>
                          </div>
                        </div>

                        {/* Extra profile details: Blood group & Medical conditions */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50 space-y-2.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-400 uppercase tracking-wide">Blood Group</span>
                            <span className="font-extrabold text-slate-800">{patientProfile.blood_group || '--'}</span>
                          </div>
                          <div className="border-t border-slate-200/60 pt-2">
                            <span className="font-bold text-slate-400 uppercase tracking-wide text-[8px] block mb-1">Existing Conditions / Symptoms</span>
                            <p className="text-[10px] font-semibold text-slate-700 leading-normal">
                              {patientProfile.medical_conditions || 'None declared'}
                            </p>
                          </div>
                        </div>

                        {/* Uploaded Reports & Records */}
                        <div className="space-y-2 pt-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical Reports</p>
                          {patientRecords.length > 0 ? (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                              {patientRecords.map((rec: any) => (
                                <div key={rec.id} className="p-2 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-between gap-2">
                                  <div className="min-w-0 flex-1 flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-bloom-500 shrink-0" />
                                    <span className="text-[10px] font-bold text-slate-700 truncate">{rec.file_name || rec.record_type}</span>
                                  </div>
                                  {rec.file_url && (
                                    <button
                                      type="button"
                                      onClick={() => openMedicalReport(rec.file_url, rec.file_name)}
                                      className="text-[9px] font-bold text-bloom-600 bg-bloom-50 px-2.5 py-1 rounded-md hover:bg-bloom-100"
                                    >
                                      View
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">No health records uploaded.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 2: DIET PLAN */}
                    {doctorActiveTab === 'diet' && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Apple className="w-3.5 h-3.5 text-bloom-600" />
                          <span>Prescribe Diet & Lifestyle</span>
                        </p>

                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Plan Title *</label>
                            <input
                              type="text"
                              value={dietTitle}
                              onChange={e => setDietTitle(e.target.value)}
                              placeholder="e.g. Hormonal Regulating Plan"
                              className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-bloom-300"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Diet Guidelines (One per line)</label>
                            <textarea
                              rows={5}
                              value={dietGuidelines}
                              onChange={e => setDietGuidelines(e.target.value)}
                              placeholder="Guidelines here..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-bloom-300 resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Medications & Supplements</label>
                            <textarea
                              rows={3}
                              value={medications}
                              onChange={e => setMedications(e.target.value)}
                              placeholder="e.g. Supplement 2g daily..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-bloom-300 resize-none font-semibold"
                            />
                          </div>

                          {/* Meal Structure & Alternatives */}
                          <div className="pt-2 border-t border-slate-200/80 space-y-2">
                            <label className="text-[9px] font-extrabold text-[#5b21b6] uppercase tracking-wider block">
                              Meal Structure & Alternatives
                            </label>

                            {/* Breakfast */}
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Breakfast</span>
                              <input
                                type="text"
                                value={breakfastPrimary}
                                onChange={e => setBreakfastPrimary(e.target.value)}
                                placeholder="Primary Breakfast Option..."
                                className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={breakfastAlt}
                                onChange={e => setBreakfastAlt(e.target.value)}
                                placeholder="Alternative Breakfast Option..."
                                className="w-full h-7 rounded-lg border border-emerald-200/80 bg-white px-2 text-[11px] font-medium text-emerald-800"
                              />
                            </div>

                            {/* Lunch */}
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Lunch</span>
                              <input
                                type="text"
                                value={lunchPrimary}
                                onChange={e => setLunchPrimary(e.target.value)}
                                placeholder="Primary Lunch Option..."
                                className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={lunchAlt}
                                onChange={e => setLunchAlt(e.target.value)}
                                placeholder="Alternative Lunch Option..."
                                className="w-full h-7 rounded-lg border border-emerald-200/80 bg-white px-2 text-[11px] font-medium text-emerald-800"
                              />
                            </div>

                            {/* Snack */}
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Snack</span>
                              <input
                                type="text"
                                value={snackPrimary}
                                onChange={e => setSnackPrimary(e.target.value)}
                                placeholder="Primary Snack Option..."
                                className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={snackAlt}
                                onChange={e => setSnackAlt(e.target.value)}
                                placeholder="Alternative Snack Option..."
                                className="w-full h-7 rounded-lg border border-emerald-200/80 bg-white px-2 text-[11px] font-medium text-emerald-800"
                              />
                            </div>

                            {/* Dinner */}
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                              <span className="text-[9px] font-bold text-[#9d174d] uppercase">Dinner</span>
                              <input
                                type="text"
                                value={dinnerPrimary}
                                onChange={e => setDinnerPrimary(e.target.value)}
                                placeholder="Primary Dinner Option..."
                                className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={dinnerAlt}
                                onChange={e => setDinnerAlt(e.target.value)}
                                placeholder="Alternative Dinner Option..."
                                className="w-full h-7 rounded-lg border border-emerald-200/80 bg-white px-2 text-[11px] font-medium text-emerald-800"
                              />
                            </div>
                          </div>

                          {saveSuccess && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                              {saveSuccess}
                            </div>
                          )}

                          <button
                            onClick={handleSaveTreatment}
                            disabled={savingTreatment || !dietTitle.trim()}
                            className="w-full h-9 bg-bloom-gradient text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {savingTreatment ? 'Saving changes...' : 'Save Diet Plan'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: PRESCRIPTION PDF GENERATOR */}
                    {doctorActiveTab === 'prescription' && (
                      <div className="space-y-3.5 animate-in fade-in duration-200">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <HeartPulse className="w-3.5 h-3.5 text-bloom-600" />
                          <span>Generate PDF Prescription</span>
                        </p>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Medications & Dosage *</label>
                            <textarea
                              rows={4}
                              value={rxMedication}
                              onChange={e => setRxMedication(e.target.value)}
                              placeholder="e.g.&#10;1. Metformin 500mg - 1 Tab daily after lunch&#10;2. Thyroxine 50mcg - 1 Tab empty stomach"
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-bloom-300 resize-none"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Instructions & Advice</label>
                            <textarea
                              rows={3}
                              value={rxInstructions}
                              onChange={e => setRxInstructions(e.target.value)}
                              placeholder="e.g. Walk 30 mins daily, repeat blood tests in 4 weeks."
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-bloom-300 resize-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              id="sign-check"
                              checked={rxIsSigning}
                              onChange={e => setRxIsSigning(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-bloom-600 focus:ring-bloom-300 cursor-pointer"
                            />
                            <label htmlFor="sign-check" className="text-[10px] font-bold text-slate-600 cursor-pointer">
                              Sign prescription as Dr. Deeba Madhavan
                            </label>
                          </div>

                          {rxSuccess && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 p-2 rounded-lg border border-green-100 animate-in fade-in">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                              {rxSuccess}
                            </div>
                          )}

                          <button
                            onClick={handleSendPrescription}
                            disabled={rxSending || !rxMedication.trim()}
                            className="w-full h-9 bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition disabled:opacity-50"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {rxSending ? 'Generating PDF...' : 'Sign & Send Prescription'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 italic text-center py-6">Unable to resolve patient details.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Call Controls Bar */}
        <div className="bg-slate-950/90 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#5b21b6]" />
              {useSimulation ? "Sandbox Simulation Active" : "HIPAA & Medical Encrypted"}
            </span>
            {profile?.role === 'doctor' && patientId && (
              <button
                type="button"
                onClick={() => setShowPatientInfo(!showPatientInfo)}
                className={cn(
                  "ml-3 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border",
                  showPatientInfo
                    ? "bg-[#5b21b6] border-[#4c1d95] text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                {showPatientInfo ? "Hide Case File" : "Show Case File"}
              </button>
            )}
          </div>

          {/* Center Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMic}
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md',
                micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white hover:bg-red-700'
              )}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleToggleCamera}
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md',
                cameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white hover:bg-red-700'
              )}
            >
              {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleClose}
              className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          </div>

          <div className="hidden sm:block">
            <span className="text-[10px] font-semibold text-slate-500">SheBloom Consultation Room</span>
          </div>
        </div>

      </div>

    </div>
  );
}
