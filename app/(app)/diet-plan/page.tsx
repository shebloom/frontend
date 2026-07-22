'use client';

import { useState, useEffect } from 'react';
import { Apple, Clipboard, ArrowRight, ShieldCheck, Dumbbell, Sparkles, Loader2, FileCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

export default function DietPlanPage() {
  const { profile, refreshProfile } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [condition, setCondition] = useState('PCOS Insulin Resistance Support');
  const [dietaryPreference, setDietaryPreference] = useState('Vegetarian');
  const [symptoms, setSymptoms] = useState('');
  const [fileName, setFileName] = useState('');

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/diet/patient');
      setPlans(res.diet_plans || []);
    } catch (err) {
      console.error('Failed to load diet plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Prefill from profile data
  useEffect(() => {
    if (profile) {
      if (profile.weight_kg) setWeight(profile.weight_kg.toString());
      if (profile.height_cm) setHeight(profile.height_cm.toString());
      if ((profile as any).medical_conditions) setCondition((profile as any).medical_conditions);
      if ((profile as any).dietary_preference) setDietaryPreference((profile as any).dietary_preference);
      if ((profile as any).symptoms) setSymptoms((profile as any).symptoms);
    }
  }, [profile]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height) {
      alert('Please provide your weight and height.');
      return;
    }

    try {
      setGenerating(true);
      
      // Submit diet generation
      const res = await apiFetch('/diet/generate', {
        method: 'POST',
        body: JSON.stringify({
          weight: parseFloat(weight),
          height: parseFloat(height),
          condition,
          dietary_preference: dietaryPreference,
          symptoms,
        }),
      });

      // Keep user profile in sync with new metrics
      try {
        await apiFetch('/auth/me', {
          method: 'PATCH',
          body: JSON.stringify({
            weight_kg: parseFloat(weight),
            height_cm: parseFloat(height),
            medical_conditions: condition,
            dietary_preference: dietaryPreference,
            symptoms: symptoms,
          }),
        });
        await refreshProfile();
      } catch (profileErr) {
        console.warn('Failed to sync diet metrics back to user profile:', profileErr);
      }

      if (res.diet_plan) {
        setPlans([res.diet_plan, ...plans]);
      }
    } catch (err) {
      alert('Failed to generate diet plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading your diet profile...</p>
      </div>
    );
  }

  const activePlan = plans[0];

  return (
    <div className="pb-28 max-w-[640px] mx-auto px-4 pt-6 space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[11px] font-extrabold text-[#9d174d] uppercase tracking-widest bg-pink-100/70 px-3 py-1 rounded-full">
          Clinical Nutrition
        </span>
        <h1 className="text-2xl font-black text-slate-800 font-playfair tracking-tight mt-2">
          Your Personalized Diet Plan
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Custom clinical nutrition formulated by AI and personalized by Dr. Deepa Madhavan.
        </p>
      </div>

      {generating ? (
        <div className="bg-white rounded-[32px] p-8 text-center border border-slate-200/80 shadow-md space-y-4">
          <Loader2 className="w-10 h-10 text-[#5b21b6] animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-playfair animate-pulse">Formulating Diet Plan...</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Analyzing your height, weight, and condition to build a hormone-regulating, high-nutrition dietary schedule.
          </p>
        </div>
      ) : activePlan ? (
        <div className="space-y-6">
          
          {/* Active Plan Overview */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-800 text-base font-playfair">{activePlan.title}</h2>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                {activePlan.doctor_id || activePlan.is_doctor_assigned ? 'Assigned by Dr. Deepa' : 'Active Plan'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {activePlan.plan_details?.summary || 'Custom nutrition plan to balance hormones and increase energy levels.'}
            </p>

            {/* Prescribed Medications & Supplements */}
            {activePlan.plan_details?.medications && (
              <div className="bg-white/80 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3 shadow-bloom-card">
                <FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Prescribed Medications & Supplements</h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{activePlan.plan_details.medications}</p>
                </div>
              </div>
            )}

            {/* Doctor's Personal Note */}
            {activePlan.notes && (
              <div className="bg-purple-50/80 rounded-2xl p-4 border border-purple-100 flex items-start gap-3">
                <Clipboard className="w-5 h-5 text-[#5b21b6] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5b21b6]">Dr. Deepa Madhavan's Note</h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">{activePlan.notes}</p>
                </div>
              </div>
            )}

            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800">Verified by Dr. Deepa Madhavan</h4>
                <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                  This diet plan can be live-customized by Dr. Deepa Madhavan during your follow-up consultations.
                </p>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm font-playfair flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clipboard className="w-4 h-4 text-[#5b21b6]" /> Nutritional Guidelines
            </h3>
            {(activePlan.plan_details?.guidelines || []).length > 0 ? (
              <ul className="space-y-2">
                {(activePlan.plan_details?.guidelines || []).map((g: string, i: number) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-[#9d174d] font-bold mt-0.5">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            ) : activePlan.plan_details?.notes ? (
              <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{activePlan.plan_details.notes}</p>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No specific guidelines added yet.</p>
            )}
          </div>

          {/* Meal Schedule */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm font-playfair flex items-center gap-2 border-b border-slate-100 pb-2">
              <Dumbbell className="w-4 h-4 text-[#5b21b6]" /> Meal Structure & Alternatives
            </h3>

            <div className="grid gap-4">
              {['breakfast', 'lunch', 'snack', 'dinner'].map((meal) => {
                const primary = activePlan.plan_details?.meal_structure?.[meal];
                const alternate = activePlan.plan_details?.meal_structure?.[`${meal}_alternate`] || 
                                  activePlan.plan_details?.meal_structure?.[`${meal}Alternate`] || 
                                  activePlan.plan_details?.meal_structure?.[`${meal}_alt`] || 
                                  activePlan.plan_details?.meal_structure?.[`${meal}Alt`] || 
                                  activePlan.plan_details?.meal_structure?.[`${meal}Alternative`] || 
                                  activePlan.plan_details?.meal_structure?.[`${meal}_alternative`] || 
                                  '';

                return (
                  <div key={meal} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col gap-2.5">
                    <span className="text-[10px] font-extrabold text-[#9d174d] uppercase tracking-wider block border-b border-slate-200 pb-1">
                      {meal} Recommendation
                    </span>
                    <div>
                      <span className="text-[9px] font-extrabold bg-[#5b21b6]/10 text-[#5b21b6] px-2 py-0.5 rounded-full mr-1.5 uppercase">Primary</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">{primary || 'Consult Dr. Deepa Madhavan'}</p>
                    </div>
                    {alternate && (
                      <div className="pt-2 border-t border-dashed border-slate-200 mt-1">
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mr-1.5 uppercase">Alternative Option</span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{alternate}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generate Another Link */}
          <button
            onClick={() => {
              if (confirm('Create a new plan? This will archive your current plan.')) {
                setPlans([]);
              }
            }}
            className="w-full py-3 rounded-2xl border border-dashed border-slate-300 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Re-generate Diet Plan
          </button>

        </div>
      ) : (
        /* Onboarding Question Form */
        <form onSubmit={handleGenerate} className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-[#5b21b6]" />
            <h2 className="font-bold text-slate-800 text-base font-playfair">Diet Formulation Onboarding</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Weight (kg)</label>
              <input
                type="number"
                placeholder="e.g. 62"
                required
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-bloom-300 outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Height (cm)</label>
              <input
                type="number"
                placeholder="e.g. 165"
                required
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-bloom-300 outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Primary Hormonal/Health Condition</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none bg-white font-bold text-slate-700"
            >
              <option>PCOS Insulin Resistance Support</option>
              <option>Thyroid Metabolic Support</option>
              <option>Menstrual Cycle & Cramps Support</option>
              <option>Fertility Nourishment Plan</option>
              <option>General Hormonal Balance & Wellness</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Dietary Preference</label>
            <select
              value={dietaryPreference}
              onChange={e => setDietaryPreference(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none bg-white font-bold text-slate-700"
            >
              <option>Vegetarian</option>
              <option>Non-Vegetarian</option>
              <option>Vegan</option>
              <option>Eggetarian</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Describe Symptoms or Medical Reports</label>
            <textarea
              placeholder="e.g. Irregular cycles, high fatigue, hair thinning, or any thyroid parameters..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              className="w-full h-20 p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-bloom-300 outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Upload Medical Reports / Prescription (Optional)</label>
            <input
              type="file"
              id="medReportFile"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFileName(file.name);
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('medReportFile')?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <span>{fileName ? `✓ ${fileName}` : '📁 Upload Blood Work / Reports'}</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#5b21b6] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity mt-4 shadow-sm"
          >
            <span>Formulate My Diet Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

    </div>
  );
}
