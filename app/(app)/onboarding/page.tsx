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
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center p-0 md:p-6 lg:p-10">
      
      {/* Desktop Container */}
      <div className="w-full h-full max-w-[1400px] flex md:rounded-[40px] overflow-hidden relative">
        
        {/* LEFT SIDE (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 relative bg-[#EADCF6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/left_banner_full.jpg" 
            alt="SheBloom Features" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE (Phone UI) */}
        <div className="w-full md:w-[400px] bg-white h-full md:h-[90%] md:my-auto md:mr-8 md:rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col z-30 border-[6px] border-white/50 bg-clip-padding">
          
          {/* Fake Phone Status Bar */}
          <div className="w-full h-12 flex justify-between items-center px-6 absolute top-0 left-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-800 tracking-tighter">9:41</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21L15.6 16.2C14.6 15.45 13.35 15 12 15s-2.6.45-3.6 1.2L12 21z" opacity=".3"/><path d="M12 21L21 9C18.66 7.12 15.48 6 12 6 8.52 6 5.34 7.12 3 9l9 12z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 22 1.33-21.4 1.33-20.67V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pt-12 pb-8 px-6 bg-[#fcf7f9]">
            <div className="text-center mb-6 mt-6 flex flex-col items-center">
              <BloomLogo size="lg" layout="vertical" className="mb-2 scale-90" />
              <h1 className="text-[17px] font-bold text-slate-800">Welcome to SheBloom</h1>
              <p className="mt-1 text-xs text-slate-500 font-medium">How would you like to use the app?</p>
            </div>

            {!roleSelection ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handlePatientSubmit()}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-transparent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-bloom-300 hover:shadow-bloom-card transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-bloom-100 flex items-center justify-center text-bloom-600 shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">I am a Patient</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Track health, consult doctors</p>
                  </div>
                </button>

                <button
                  onClick={() => setRoleSelection('doctor')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-transparent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-bloom-300 hover:shadow-bloom-card transition-all text-left"
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
              <form onSubmit={handleDoctorSubmit} className="flex flex-col gap-3.5 bg-white p-5 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
                  <h2 className="font-bold text-slate-800 text-sm">Doctor Details</h2>
                  <button type="button" onClick={() => setRoleSelection(null)} className="text-[11px] font-bold text-bloom-600 bg-bloom-50 px-3 py-1 rounded-full hover:bg-bloom-100">Back</button>
                </div>
                
                {error && <div className="text-[11px] font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialty</label>
                  <input type="text" required value={specialty} onChange={e => setSpecialty(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="e.g. OB/GYN" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience (Yrs)</label>
                  <input type="number" required value={experience} onChange={e => setExperience(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fee (USD)</label>
                  <input type="number" required value={fee} onChange={e => setFee(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="150" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">License Number</label>
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
