'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BloomLogo, GradientButton } from '@/components/shebloom';
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
    <div className="min-h-screen bg-lavender-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[414px] bg-white rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <BloomLogo size="lg" layout="vertical" className="mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">Welcome to SheBloom</h1>
          <p className="mt-2 text-sm text-slate-500">How would you like to use the app?</p>
        </div>

        {!roleSelection ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handlePatientSubmit()}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-bloom-300 hover:bg-bloom-50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-bloom-100 flex items-center justify-center text-bloom-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">I am a Patient</h3>
                <p className="text-xs text-slate-500">Track health, consult doctors</p>
              </div>
            </button>

            <button
              onClick={() => setRoleSelection('doctor')}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-bloom-300 hover:bg-bloom-50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-bloom-100 flex items-center justify-center text-bloom-600">
                <Stethoscope size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">I am a Doctor</h3>
                <p className="text-xs text-slate-500">Provide care to patients</p>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleDoctorSubmit} className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-800">Doctor Verification</h2>
              <button type="button" onClick={() => setRoleSelection(null)} className="text-xs text-bloom-600">Back</button>
            </div>
            
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Specialty</label>
              <input type="text" required value={specialty} onChange={e => setSpecialty(e.target.value)} className="h-10 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300" placeholder="e.g. OB/GYN" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Years of Experience</label>
              <input type="number" required value={experience} onChange={e => setExperience(e.target.value)} className="h-10 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Consultation Fee (USD)</label>
              <input type="number" required value={fee} onChange={e => setFee(e.target.value)} className="h-10 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300" placeholder="e.g. 150" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Medical License Number</label>
              <input type="text" required value={license} onChange={e => setLicense(e.target.value)} className="h-10 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-bloom-300" placeholder="Lic-12345" />
            </div>
             <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">Upload Verification Document</label>
                <span className="text-[10px] text-bloom-600 font-medium">* Required</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                Please upload a copy of your <strong>Medical License</strong>, <strong>Govt ID Proof (Passport/National ID)</strong>, or <strong>Specialty Degree Certificate</strong>.
              </p>
              <label className="relative flex flex-col items-center justify-center h-28 w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-bloom-300 hover:bg-slate-50 transition-all cursor-pointer bg-slate-50/50 p-4">
                <input 
                  type="file" 
                  required
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {!selectedFile ? (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl">📄</span>
                    <span className="mt-2 text-xs font-semibold text-slate-600">Select Document</span>
                    <span className="text-[10px] text-slate-400 mt-1">PDF or Image up to 5MB</span>
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 bg-bloom-100 rounded-xl flex items-center justify-center text-bloom-600 font-bold text-sm">
                      {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFile(null);
                      }}
                      className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </label>
              
              {isUploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                    <span>Uploading document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-bloom-gradient rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <GradientButton type="submit" className="mt-4" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </GradientButton>
          </form>
        )}
      </div>
    </div>
  );
}
