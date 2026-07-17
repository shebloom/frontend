'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Users,
  Heart,
  Activity,
  FileText,
  Droplet,
  Pill,
  ChevronRight,
  Weight,
  Ruler,
  Calculator,
  Droplets,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Upload,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';

const tabs = ['Overview', 'Symptoms', 'Reports', 'Prescriptions'] as const;
type Tab = (typeof tabs)[number];

const recordIcons = {
  file: FileText,
  droplet: Droplet,
  pill: Pill,
};

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editWeight, setEditWeight] = useState(profile?.weight_kg?.toString() || '');
  const [editHeight, setEditHeight] = useState(profile?.height_cm?.toString() || '');
  const [editBloodGroup, setEditBloodGroup] = useState(profile?.blood_group || 'O+');
  const [savingProfile, setSavingProfile] = useState(false);

  // Symptoms State
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [isLoggingSymptom, setIsLoggingSymptom] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState('Cramps');
  const [symptomSeverity, setSymptomSeverity] = useState('mild');
  const [savingSymptom, setSavingSymptom] = useState(false);

  // Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const reportInputRef = useRef<HTMLInputElement>(null);

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const data = await apiFetch('/health-records');
      setReports(data.records || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUploadReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReport(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        await apiFetch('/health-records', {
          method: 'POST',
          body: JSON.stringify({
            record_type: ext + ' Report',
            record_date: new Date().toISOString().split('T')[0],
            file_url: base64,
            file_name: file.name,
            notes: 'Uploaded ' + file.name,
          }),
        });
        loadReports();
        setUploadingReport(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Failed to upload report');
      setUploadingReport(false);
    }
    if (reportInputRef.current) reportInputRef.current.value = '';
  };

  useEffect(() => {
    if (activeTab === 'Symptoms') {
      loadSymptoms();
    }
    if (activeTab === 'Reports' || activeTab === 'Overview') {
      loadReports();
    }
  }, [activeTab]);

  useEffect(() => {
    if (profile) {
      setEditWeight(profile.weight_kg?.toString() || '');
      setEditHeight(profile.height_cm?.toString() || '');
      setEditBloodGroup(profile.blood_group || 'O+');
    }
  }, [profile]);

  const loadSymptoms = async () => {
    try {
      const data = await apiFetch('/health-records/symptoms');
      setSymptoms(data.symptoms || []);
    } catch (err) {
      console.error('Failed to load symptoms', err);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await apiFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          weight_kg: editWeight ? parseFloat(editWeight) : null,
          height_cm: editHeight ? parseFloat(editHeight) : null,
          blood_group: editBloodGroup,
        }),
      });
      await refreshProfile();
      setIsEditingProfile(false);
    } catch (err) {
      alert('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSymptom(true);
    try {
      await apiFetch('/health-records/symptoms', {
        method: 'POST',
        body: JSON.stringify({
          symptom: selectedSymptom,
          severity: symptomSeverity,
        }),
      });
      setIsLoggingSymptom(false);
      loadSymptoms(); // Reload the list
    } catch (err) {
      alert('Failed to log symptom');
    } finally {
      setSavingSymptom(false);
    }
  };

  // Compute BMI dynamically
  const computedBmi = profile?.weight_kg && profile?.height_cm 
    ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
    : '--';

  const healthSummary = [
    { label: 'Weight',     value: profile?.weight_kg || '--',   unit: 'kg',  icon: Weight },
    { label: 'Height',     value: profile?.height_cm || '--',  unit: 'cm',  icon: Ruler },
    { label: 'BMI',        value: computedBmi, unit: '',     icon: Calculator },
    { label: 'Blood Group', value: profile?.blood_group || '--',  unit: '',     icon: Droplets },
  ];

  return (
    <div>
      {/* Header with profile */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Health</h1>
            <p className="mt-0.5 text-sm text-slate-500">Your health dashboard</p>
          </div>
          <div className="flex gap-2">
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-bloom-card border border-bloom-100"
              >
                <ShieldCheck className="h-5 w-5 text-bloom-600" />
              </Link>
            )}
            <button
              onClick={() => router.push('/community')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-bloom-card border border-bloom-100"
            >
              <Users className="h-5 w-5 text-bloom-600" />
            </button>
            <Link 
              href="/profile/settings"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-bloom-card border border-bloom-100"
            >
              <Settings className="h-5 w-5 text-bloom-600" />
            </Link>
          </div>
        </div>

        {/* User avatar */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-bloom-card border border-bloom-100/60">
          <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-bloom-200 bg-bloom-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile?.avatar_url || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=128"}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{profile?.full_name || 'Guest'}</p>
            <p className="text-xs text-slate-400" suppressHydrationWarning>Member since {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                activeTab === t
                  ? 'bg-bloom-gradient text-white shadow-bloom-btn'
                  : 'bg-white text-slate-500 border border-bloom-100 hover:bg-bloom-50',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <>
          {/* Health Summary */}
          <section className="px-5 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-800">Health Summary</h2>
              {!isEditingProfile ? (
                <button onClick={() => setIsEditingProfile(true)} className="text-xs font-semibold text-bloom-600 flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditingProfile(false)} className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={savingProfile} className="text-xs font-semibold text-bloom-600 flex items-center gap-1">
                    <Check size={14} /> {savingProfile ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {isEditingProfile ? (
              <div className="rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Weight (kg)</label>
                  <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)} className="w-full mt-1 h-10 rounded-xl border-slate-200 text-sm focus:ring-bloom-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Height (cm)</label>
                  <input type="number" value={editHeight} onChange={e => setEditHeight(e.target.value)} className="w-full mt-1 h-10 rounded-xl border-slate-200 text-sm focus:ring-bloom-300" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500">Blood Group</label>
                  <select value={editBloodGroup} onChange={e => setEditBloodGroup(e.target.value)} className="w-full mt-1 h-10 rounded-xl border-slate-200 text-sm focus:ring-bloom-300">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {healthSummary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bloom-soft">
                        <Icon className="h-4.5 w-4.5 text-bloom-600" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-slate-800">{item.value}</span>
                          {item.unit && <span className="text-xs text-slate-400">{item.unit}</span>}
                        </div>
                        <p className="text-xs text-slate-500">{item.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Records */}
          <section className="px-5 pt-5">
            <h2 className="text-base font-semibold text-slate-800">Recent Records</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60">
              {reports.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No records yet. Upload reports from the Reports tab.</p>
              ) : (
                reports.slice(0, 5).map((rec: any) => (
                  <div key={rec.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bloom-50">
                      <FileText className="h-5 w-5 text-bloom-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{rec.record_type || rec.file_name || 'Report'}</p>
                      <p className="text-xs text-slate-400">{rec.record_date ? new Date(rec.record_date).toLocaleDateString() : ''}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setActiveTab('Reports')}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-bloom-gradient text-xs font-bold text-white shadow-bloom-btn transition hover:brightness-105 active:scale-[0.98]"
            >
              Upload New Report
            </button>
          </section>

          {/* Quick actions */}
          <section className="px-5 pt-5 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cycle"
                className="flex items-center gap-3 rounded-2xl bg-bloom-soft p-4 border border-bloom-100 transition active:scale-[0.98]"
              >
                <Activity className="h-5 w-5 text-bloom-600" />
                <span className="text-sm font-semibold text-bloom-700">Cycle Tracker</span>
              </Link>
              <Link
                href="/community"
                className="flex items-center gap-3 rounded-2xl bg-petal-50 p-4 border border-petal-100 transition active:scale-[0.98]"
              >
                <Users className="h-5 w-5 text-petal-600" />
                <span className="text-sm font-semibold text-petal-700">Community</span>
              </Link>
            </div>
          </section>
        </>
      )}

      {activeTab === 'Symptoms' && (
        <section className="px-5 pt-5 pb-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-bloom-600" />
              <h2 className="text-base font-semibold text-slate-800">How are you feeling today?</h2>
            </div>
            <p className="text-xs text-slate-400 -mt-2">Tap to select all that apply. This helps your doctor understand your health better.</p>

            {/* Symptom Categories */}
            {[
              {
                label: '💪 Physical',
                color: 'bg-rose-50 border-rose-100',
                activeColor: 'bg-rose-500 text-white border-rose-500',
                inactiveColor: 'bg-white border-rose-200 text-rose-700',
                symptoms: ['Cramps', 'Bloating', 'Headache', 'Back Pain', 'Nausea', 'Fatigue', 'Breast Tenderness', 'Spotting', 'Hot Flashes', 'Acne']
              },
              {
                label: '💜 Emotional',
                color: 'bg-bloom-50 border-bloom-100',
                activeColor: 'bg-bloom-600 text-white border-bloom-600',
                inactiveColor: 'bg-white border-bloom-200 text-bloom-700',
                symptoms: ['Mood Swings', 'Irritability', 'Anxiety', 'Sadness', 'Crying Spells', 'Emotional Eating', 'Low Motivation', 'Loneliness']
              },
              {
                label: '🧠 Mental',
                color: 'bg-indigo-50 border-indigo-100',
                activeColor: 'bg-indigo-600 text-white border-indigo-600',
                inactiveColor: 'bg-white border-indigo-200 text-indigo-700',
                symptoms: ['Brain Fog', 'Forgetfulness', 'Difficulty Concentrating', 'Overthinking', 'Low Confidence', 'Stress']
              },
              {
                label: '🏃 Energy & Workout',
                color: 'bg-green-50 border-green-100',
                activeColor: 'bg-green-600 text-white border-green-600',
                inactiveColor: 'bg-white border-green-200 text-green-700',
                symptoms: ['High Energy', 'Low Energy', 'Workout Went Great', 'Too Tired to Exercise', 'Strong Cravings', 'Loss of Appetite', 'Good Sleep', 'Poor Sleep']
              },
            ].map((cat) => {
              return (
                <div key={cat.label} className={`rounded-2xl border p-4 ${cat.color}`}>
                  <p className="text-xs font-bold text-slate-700 mb-3">{cat.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.symptoms.map((s) => {
                      const isSelected = selectedSymptom === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSymptom(isSelected ? '' : s)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95',
                            isSelected ? cat.activeColor : cat.inactiveColor
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Severity + Save */}
            {selectedSymptom && (
              <div className="rounded-2xl bg-white border border-bloom-100 shadow-bloom-card p-4 space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  Selected: <span className="text-bloom-600">{selectedSymptom}</span>
                </p>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-2">How severe is it?</p>
                  <div className="flex gap-2">
                    {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSymptomSeverity(sev)}
                        className={cn(
                          'flex-1 rounded-full py-2 text-xs font-bold border capitalize transition-all',
                          symptomSeverity === sev
                            ? 'bg-bloom-gradient text-white border-transparent shadow-bloom-btn'
                            : 'bg-white border-bloom-100 text-slate-500'
                        )}
                      >
                        {sev === 'mild' ? '😌 Mild' : sev === 'moderate' ? '😣 Moderate' : '😰 Severe'}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setSavingSymptom(true);
                    try {
                      await apiFetch('/health-records/symptoms', {
                        method: 'POST',
                        body: JSON.stringify({ symptom: selectedSymptom, severity: symptomSeverity }),
                      });
                      setSelectedSymptom('');
                      loadSymptoms();
                    } catch { alert('Failed to log symptom'); }
                    finally { setSavingSymptom(false); }
                  }}
                  disabled={savingSymptom}
                  className="h-11 w-full rounded-full bg-bloom-gradient font-semibold text-sm text-white shadow-bloom-btn transition hover:brightness-105 active:scale-[0.98]"
                >
                  {savingSymptom ? 'Saving…' : '✓ Log This Symptom'}
                </button>
              </div>
            )}

            {/* Recent logs */}
            {symptoms.length > 0 && (
              <div className="rounded-2xl bg-white border border-bloom-100 shadow-bloom-card p-4">
                <p className="text-xs font-bold text-slate-400 mb-3">Recent Logs</p>
                <div className="space-y-2">
                  {symptoms.map((log) => (
                    <div key={log.id} className="flex items-center justify-between rounded-xl bg-lavender-50 px-3 py-2">
                      <span className="text-sm font-medium text-slate-700">
                        {log.symptom} <span className="text-xs font-normal text-slate-400 capitalize">({log.severity})</span>
                      </span>
                      <span className="text-xs text-slate-400">{new Date(log.logged_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}


      {activeTab === 'Reports' && (
        <section className="px-5 pt-5">
          <div className="space-y-4 rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Your Reports</h2>
              <button
                onClick={() => reportInputRef.current?.click()}
                disabled={uploadingReport}
                className="flex items-center gap-1.5 rounded-full bg-bloom-gradient px-4 py-2 text-xs font-semibold text-white shadow-bloom-btn transition hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploadingReport ? 'Uploading\u2026' : 'Upload'}
              </button>
              <input
                ref={reportInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleUploadReport}
              />
            </div>

            {loadingReports ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading reports\u2026</p>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bloom-50 mb-3">
                  <FileText className="h-7 w-7 text-bloom-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">No reports uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Tap &ldquo;Upload&rdquo; to add your medical reports, test results, or prescriptions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rec: any) => (
                  <div key={rec.id} className="flex items-center gap-3 border-b border-bloom-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bloom-50 shrink-0">
                      <FileText className="h-5 w-5 text-bloom-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{rec.file_name || rec.record_type}</p>
                      <p className="text-xs text-slate-400">{new Date(rec.record_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    {rec.file_url && (
                      <button
                        onClick={() => {
                          if (rec.file_url.startsWith('data:')) {
                            const w = window.open();
                            if (w) {
                              w.document.write('<img src="' + rec.file_url + '" style="max-width:100%"/>');
                            }
                          } else {
                            window.open(rec.file_url, '_blank');
                          }
                        }}
                        className="text-xs font-medium text-bloom-600 flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'Prescriptions' && (
        <section className="px-5 pt-5">
          <div className="rounded-2xl bg-white p-5 shadow-bloom-card border border-bloom-100/60">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-bloom-600" />
              <h2 className="text-base font-semibold text-slate-800">Active Prescriptions</h2>
            </div>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl bg-lavender-50 p-3">
                <p className="text-sm font-medium text-slate-700">Folic Acid 5mg</p>
                <p className="text-xs text-slate-400">1 tablet daily · 30 days</p>
              </div>
              <div className="rounded-xl bg-lavender-50 p-3">
                <p className="text-sm font-medium text-slate-700">Vitamin D3</p>
                <p className="text-xs text-slate-400">1 tablet weekly · 12 weeks</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Prescribed by Dr. Deepa Madhavan
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
