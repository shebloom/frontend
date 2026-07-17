'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BloomLogo, GradientButton, AuthSidebar } from '@/components/shebloom';
import { User, Stethoscope } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [roleSelection, setRoleSelection] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Doctor application state
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [license, setLicense] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handlePatientSubmit = async () => {
    // Patients don't need further setup, they are default.
    router.push('/home');
  };

  const [phone, setPhone] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload a verification document.');
      return;
    }
    setLoading(true);
    setError(null);
    setIsUploading(true);

    // Mock progress bar animation
    for (let progress = 10; progress <= 100; progress += 30) {
      setUploadProgress(progress);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    setIsUploading(false);

    try {
      await apiFetch('/doctors/apply', {
        method: 'POST',
        body: JSON.stringify({
          specialty,
          experience_years: parseInt(experience, 10),
          consultation_fee: parseFloat(fee),
          consultation_type: 'video',
          category: 'Gynecologist',
          license_number: license,
          languages: ['English'],
          phone, // Contact number
          document_urls: [selectedFile.name]
        })
      });
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden flex items-center justify-center">
      
      {/* Desktop Container (Split 50/50 on PC) */}
      <div className="w-full h-full flex flex-col md:flex-row relative">
        
        {/* LEFT SIDE (Hidden on mobile) */}
        <div className="hidden md:block md:w-1/2 h-full relative bg-[#F7F4FB] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/left_banner_full.jpg" 
            alt="SheBloom Features" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 bg-[#fcf7f9] overflow-y-auto">
          <div className="w-full max-w-[420px] mx-auto py-8">
            <div className="text-center mb-8 flex flex-col items-center">
              <BloomLogo size="lg" layout="vertical" className="mb-3 scale-110" />
              <h1 className="text-2xl font-black text-slate-800">Welcome to SheBloom</h1>
              <p className="mt-1.5 text-sm text-slate-500 font-medium">How would you like to use the app?</p>
            </div>

            {!roleSelection ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handlePatientSubmit()}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-transparent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-bloom-300 hover:shadow-bloom-card transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-bloom-100 flex items-center justify-center text-bloom-600 shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">I am a User</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Track health, consult doctors</p>
                  </div>
                </button>

                <button
                  onClick={() => setRoleSelection('doctor')}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-transparent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-bloom-300 hover:shadow-bloom-card transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-bloom-100 flex items-center justify-center text-bloom-600 shrink-0">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">I am a Doctor</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Provide care to patients</p>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleDoctorSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
                  <h2 className="font-bold text-slate-800 text-sm">Doctor Details</h2>
                  <button type="button" onClick={() => setRoleSelection(null)} className="text-[11px] font-bold text-bloom-600 bg-bloom-50 px-3 py-1 rounded-full hover:bg-bloom-100">Back</button>
                </div>
                
                {error && <div className="text-[11px] font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialty</label>
                  <input type="text" required value={specialty} onChange={e => setSpecialty(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="e.g. OB/GYN" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience (Yrs)</label>
                  <input type="number" required value={experience} onChange={e => setExperience(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fee (USD)</label>
                  <input type="number" required value={fee} onChange={e => setFee(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="150" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">License Number</label>
                  <input type="text" required value={license} onChange={e => setLicense(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="Lic-12345" />
                </div>
                <div className="pt-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">ID / License Document</label>
                  </div>
                  <label className="relative flex flex-col items-center justify-center h-20 w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-bloom-300 hover:bg-slate-50 transition-all cursor-pointer bg-slate-50/50 p-4">
                    <input 
                      type="file" 
                      required
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    {!selectedFile ? (
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[11px] font-bold text-bloom-600">Click to Upload</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">PDF or Image (Max 5MB)</span>
                      </div>
                    ) : (
                      <div className="w-full flex items-center gap-2 text-left">
                        <div className="h-8 w-8 shrink-0 bg-bloom-100 rounded-xl flex items-center justify-center text-bloom-600 font-bold text-[9px]">
                          {selectedFile.name.split('.').pop()?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-700 truncate">{selectedFile.name}</p>
                          <p className="text-[9px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                          }}
                          className="text-[9px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </label>
                  
                  {isUploading && (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1.5">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-bloom-600 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <GradientButton type="submit" className="mt-4 h-12 text-[13px] shadow-[0_8px_20px_-6px_rgba(91,33,182,0.5)]" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Details'}
                </GradientButton>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
