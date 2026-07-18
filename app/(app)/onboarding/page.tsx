'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BloomLogo, GradientButton, AuthSidebar } from '@/components/shebloom';
import { User, Stethoscope } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';

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
  const [slotDuration, setSlotDuration] = useState('30');

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
    setUploadProgress(10);

    let documentUrl = '';
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('doctor-documents')
        .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw new Error(`Document upload failed: ${uploadError.message}`);
      }
      setUploadProgress(70);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('doctor-documents')
        .getPublicUrl(fileName);

      documentUrl = urlData.publicUrl;
      setUploadProgress(100);
    } catch (uploadErr: any) {
      setError(uploadErr.message || 'Failed to upload document. Please try again.');
      setLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
      return;
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
          document_urls: [documentUrl],
          slot_duration: parseInt(slotDuration, 10),
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
    <div className="fixed inset-0 bg-[#E5D5F0] overflow-hidden flex items-center justify-center">
      
      {/* Desktop Container (Split 50/50 on PC) */}
      <div className="w-full h-full flex flex-col md:flex-row relative">
        
        {/* LEFT SIDE (Hidden on mobile) */}
        <AuthSidebar className="md:w-[45%]" />

        {/* RIGHT SIDE (Onboarding content) */}
        <div className="w-full md:w-[55%] h-full flex flex-col items-center justify-center bg-[#FBE0E7] relative overflow-hidden">
          
          {/* Subtle watermark background of the woman with flowers */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] select-none flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/woman_with_flowers.png" 
              alt="Background pattern" 
              className="w-full h-full object-cover scale-125"
            />
          </div>

          {!roleSelection ? (
            /* Role Selection Screen - Matches the landing page UI pixel-by-pixel */
            <div className="w-full h-full flex flex-col relative max-w-[500px] mx-auto bg-[#FBE0E7]">
              
              {/* Top Logo and Header */}
              <div className="w-full pt-10 pb-4 flex flex-col items-center text-center px-6 relative z-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/logo_icon.png" 
                  alt="SheBloom Logo" 
                  className="w-12 h-12 object-contain animate-pulse" 
                />
                <span className="text-[10px] font-extrabold text-[#9d174d] uppercase tracking-widest mt-2.5">Welcome to</span>
                <h2 className="text-2xl font-black text-[#5b21b6] mt-0.5 tracking-tight font-playfair">SheBloom</h2>
                <p className="text-[11px] font-extrabold text-slate-600 mt-1 max-w-[200px] leading-tight font-sans">
                  How would you like to use the app?
                </p>
              </div>

              {/* Center Doctor Image with fade */}
              <div className="relative w-full flex-1 flex flex-col justify-end min-h-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/dr_deepa_pink_cropped.png" 
                  alt="Dr. Deepa" 
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/dr_deepa_avatar.jpg";
                  }}
                />
                {/* White gradient fade to blend image into buttons section */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fdf6f8] via-[#fdf6f8]/85 to-transparent" />
              </div>

              {/* Bottom Buttons Section */}
              <div className="w-full bg-[#fdf6f8] px-8 pb-12 pt-2 relative z-20 space-y-3">
                <button
                  onClick={() => handlePatientSubmit()}
                  className="w-full h-14 bg-[#5b21b6] text-white font-extrabold rounded-full text-[14px] md:text-[15px] shadow-[0_8px_20px_-6px_rgba(91,33,182,0.5)] transition-transform active:scale-[0.97] flex items-center justify-center gap-2"
                >
                  I am a User
                </button>
                <button
                  onClick={() => setRoleSelection('doctor')}
                  className="w-full h-14 bg-white border-2 border-[#5b21b6] text-[#5b21b6] font-extrabold rounded-full text-[14px] md:text-[15px] transition-transform active:scale-[0.97] flex items-center justify-center gap-2 shadow-sm"
                >
                  I am a Doctor
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold tracking-wide pt-1">
                  Secure. Private. For You.
                </p>
              </div>

            </div>
          ) : (
            /* Doctor Details Form - Beautiful Card Layout on Pink Background */
            <div className="w-full h-full max-w-[450px] mx-auto px-6 py-8 overflow-y-auto flex flex-col justify-center">
              <div className="bg-white/95 backdrop-blur-md p-6 rounded-[32px] shadow-[0_20px_50px_rgba(91,33,182,0.1)] border border-white/50 w-full">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logo_icon.png" alt="Logo" className="w-6 h-6 object-contain" />
                    <h2 className="font-black text-slate-800 text-base tracking-tight">Doctor Verification</h2>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setRoleSelection(null)} 
                    className="text-[11px] font-bold text-bloom-600 bg-bloom-50 px-3 py-1.5 rounded-full hover:bg-bloom-100 transition-colors"
                  >
                    Back
                  </button>
                </div>
                
                {error && <div className="text-[11px] font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 mb-4">{error}</div>}

                <form onSubmit={handleDoctorSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialty</label>
                    <input type="text" required value={specialty} onChange={e => setSpecialty(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="e.g. OB/GYN" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience (Yrs)</label>
                      <input type="number" required value={experience} onChange={e => setExperience(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="e.g. 10" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fee (USD)</label>
                      <input type="number" required value={fee} onChange={e => setFee(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="150" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="+91 98765 43210" />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Consultation Slot Duration (Time Gap)</label>
                    <select 
                      value={slotDuration} 
                      onChange={e => setSlotDuration(e.target.value)} 
                      className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">License Number</label>
                    <input type="text" required value={license} onChange={e => setLicense(e.target.value)} className="h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300 transition-all font-medium" placeholder="Lic-12345" />
                  </div>

                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ID / License Document</label>
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
                          <span className="text-[11px] font-bold text-bloom-600">Click to Upload Document</span>
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

                  <button 
                    type="submit" 
                    className="w-full h-12 bg-[#5b21b6] text-white font-bold rounded-full text-sm mt-2 shadow-[0_8px_20px_-6px_rgba(91,33,182,0.5)] transition-transform active:scale-95"
                    disabled={loading}
                  >
                    {loading ? 'Submitting Application...' : 'Submit for Verification'}
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
