'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation mode fallback (for when Daily.co URL returns 404 or fails)
  const [useSimulation, setUseSimulation] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

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
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

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

      // Fetch active diet plan
      if (appointmentId) {
        apiFetch(`/diet/appointment/${appointmentId}`)
          .then(res => {
            if (res.diet_plan) {
              setDietPlanId(res.diet_plan.id);
              setDietTitle(res.diet_plan.title || '');
              setMedications(res.diet_plan.plan_details?.medications || '');
              
              const details = res.diet_plan.plan_details;
              const guidelinesText = details?.guidelines
                ? (Array.isArray(details.guidelines) ? details.guidelines.join('\n') : details.guidelines)
                : '';
              setDietGuidelines(guidelinesText);
            }
          })
          .catch(() => {});
      }
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
    if (isOpen && useSimulation) {
      navigator.mediaDevices.getUserMedia({ video: cameraOn, audio: micOn })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
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
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, useSimulation, cameraOn, micOn]);

  const handleClose = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    onClose();
  };

  if (!isOpen) return null;

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
            <button
              onClick={() => setUseSimulation(!useSimulation)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-extrabold rounded-lg border transition-all",
                useSimulation 
                  ? "bg-amber-600 border-amber-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
              )}
            >
              {useSimulation ? "Daily.co Mode" : "Daily.co Offline? Use local Sandbox"}
            </button>
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
          
          {/* Embedded Video Call Frame */}
          <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
            {useSimulation ? (
              <div className="w-full h-full p-4 grid grid-cols-1 gap-4 bg-slate-950">
                {/* Local camera view */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center h-48 md:h-auto">
                  {cameraOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-500 space-y-2">
                      <VideoOff className="w-10 h-10 mx-auto opacity-40" />
                      <p className="text-[11px] font-bold">Your camera is off</p>
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white border border-slate-800 uppercase tracking-wider">
                    You (Secure Feed)
                  </span>
                </div>

                {/* Remote client view (doctor or patient) */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center h-48 md:h-auto">
                  <div className="text-center space-y-3 z-10 p-4">
                    <div className="w-14 h-14 rounded-full bg-bloom-100/10 text-bloom-400 border border-bloom-500/20 flex items-center justify-center mx-auto animate-pulse">
                      <Sparkles className="w-6 h-6 text-bloom-400" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-200">{doctorName}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold max-w-xs leading-normal">
                      Connected. Waiting for host to share feed...
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(91,33,182,0.15),transparent)] animate-pulse" />
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white border border-slate-800 uppercase tracking-wider">
                    {doctorName} (Consulting)
                  </span>
                </div>
              </div>
            ) : roomUrl ? (
              <iframe
                src={roomUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media"
                className="w-full h-full border-0"
                title="SheBloom Doctor Video Call"
              />
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-900/40 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30">
                  <Video className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-400">Initializing encrypted video room...</p>
              </div>
            )}
          </div>

          {/* Right panel: Patient case file & Treatment updates (Doctor only) */}
          {profile?.role === 'doctor' && showPatientInfo && (
            <div className="w-96 bg-white border-l border-slate-800 flex flex-col shrink-0 overflow-hidden text-slate-800 animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Consultation Case File</h3>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Live Profile, Reports & Treatment Updates</p>
                </div>
                <button
                  onClick={() => setShowPatientInfo(false)}
                  className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
                {loadingPatient ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-1.5">
                    <div className="h-6 w-6 rounded-full border-2 border-bloom-200 border-t-bloom-600 animate-spin" />
                    <p className="text-[10px] font-semibold text-slate-400">Loading profile data...</p>
                  </div>
                ) : patientProfile ? (
                  <>
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
                        <Droplets className="h-4 w-4 text-bloom-600" />
                        <span className="text-[11px] font-black text-slate-800 mt-1">{patientProfile.blood_group || '--'}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Blood</span>
                      </div>
                    </div>

                    {/* Uploaded Reports & Records */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical Records</p>
                      {patientRecords.length > 0 ? (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide">
                          {patientRecords.map((rec: any) => (
                            <div key={rec.id} className="p-2 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-bloom-500 shrink-0" />
                                <span className="text-[10px] font-bold text-slate-700 truncate">{rec.file_name || rec.record_type}</span>
                              </div>
                              {rec.file_url && (
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/doctor-portal/patients/${patientId}/documents/${rec.file_url.split('/').pop()}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] font-bold text-bloom-600 bg-bloom-50 px-2 py-1 rounded-md hover:bg-bloom-100"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No health records uploaded.</p>
                      )}
                    </div>

                    {/* Diet & Medications Form */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Apple className="w-3.5 h-3.5 text-bloom-600" />
                        <span>Prescribe Diet & Medication</span>
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
                            rows={3}
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
                          {savingTreatment ? 'Saving changes...' : 'Save Treatment Plan'}
                        </button>
                      </div>
                    </div>
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
              onClick={() => setMicOn(!micOn)}
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md',
                micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white hover:bg-red-700'
              )}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCameraOn(!cameraOn)}
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
