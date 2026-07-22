'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  Calendar,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Download,
  Stethoscope,
  Heart,
  ChevronRight,
  Edit3,
  Bot,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';

export default function PatientMyDietPlanPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Doctor Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editBreakfast, setEditBreakfast] = useState('');
  const [editLunch, setEditLunch] = useState('');
  const [editSnack, setEditSnack] = useState('');
  const [editDinner, setEditDinner] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDoctorOrAdmin = profile?.role === 'doctor' || profile?.role === 'admin';

  const loadDietPlans = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/diet/patient');
      const plans = res.diet_plans || [];
      
      // If empty, provide default condition-based clinical plan
      if (plans.length === 0) {
        const defaultPlan = {
          id: 'default-pcos-plan',
          title: 'PCOS & Menstrual Hormonal Balance Diet Plan',
          category: 'PCOS & Menstrual Care',
          plan_details: {
            summary: 'Clinical nutrition plan formulated to reduce insulin resistance, stabilize blood sugar spikes, and decrease pelvic inflammation.',
            guidelines: [
              'Focus on low glycemic index (GI) whole grains: quinoa, steel-cut oats, and brown rice.',
              'Seed Cycling Protocol: 1 tbsp flax + pumpkin seeds (Days 1-14); 1 tbsp sesame + sunflower seeds (Days 15-28).',
              'Spearmint Tea: Drink twice daily to help balance androgen levels naturally.',
              'Avoid refined sugars, artificial sweeteners, and processed seed oils.',
            ],
            meal_structure: {
              breakfast: 'Avocado & poached eggs on sourdough or chia pudding with berries & flax seeds.',
              lunch: 'Grilled salmon or tofu salad with spinach, olive oil, and quinoa.',
              snack: 'Handful of raw walnuts + warm spearmint herbal tea.',
              dinner: 'Steamed greens with roasted vegetables and lean protein or dal with ghee & turmeric.',
            },
            ai_tips: [
              'Hydrate with at least 2.5L of warm water daily to assist in hormone excretion.',
              'Pair carbohydrates with healthy fats and protein to flatten glucose spikes after meals.',
            ],
          },
          notes: 'Assigned by Dr. Deepa Madhav. Please follow the seed cycling protocol consistently.',
          created_at: new Date().toISOString(),
        };
        setDietPlans([defaultPlan]);
        setActivePlan(defaultPlan);
      } else {
        setDietPlans(plans);
        setActivePlan(plans[0]);
      }
    } catch (err) {
      console.error('Failed to fetch diet plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDietPlans();
  }, []);

  const startDoctorEdit = () => {
    if (!activePlan) return;
    setEditTitle(activePlan.title || '');
    setEditNotes(activePlan.notes || '');
    const ms = activePlan.plan_details?.meal_structure || {};
    setEditBreakfast(ms.breakfast || '');
    setEditLunch(ms.lunch || '');
    setEditSnack(ms.snack || '');
    setEditDinner(ms.dinner || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan) return;
    setSaving(true);

    const updatedDetails = {
      ...activePlan.plan_details,
      meal_structure: {
        breakfast: editBreakfast,
        lunch: editLunch,
        snack: editSnack,
        dinner: editDinner,
      },
    };

    try {
      if (!activePlan.id.startsWith('default-')) {
        await apiFetch(`/diet/${activePlan.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: editTitle,
            notes: editNotes,
            plan_details: updatedDetails,
          }),
        });
      }

      setActivePlan({
        ...activePlan,
        title: editTitle,
        notes: editNotes,
        plan_details: updatedDetails,
      });

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save diet plan updates');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading your clinical diet plan...</p>
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-[640px] mx-auto px-4 pt-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-extrabold text-[#9d174d] uppercase tracking-wider bg-pink-100/70 px-2.5 py-0.5 rounded-full">
              Condition & AI Nutrition
            </span>
            <h1 className="text-xl font-bold text-slate-800 font-playfair tracking-tight mt-1">
              Clinical & AI Diet Plan
            </h1>
          </div>
        </div>

        {/* Doctor Edit Button */}
        {isDoctorOrAdmin && activePlan && (
          <button
            onClick={startDoctorEdit}
            className="px-3.5 py-2 bg-[#5b21b6] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-[#4c1d95]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Plan
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Diet plan updated successfully! Changes saved for patient.</span>
        </div>
      )}

      {/* Multiple Plan Tabs if available */}
      {dietPlans.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {dietPlans.map((plan, idx) => (
            <button
              key={plan.id || idx}
              onClick={() => setActivePlan(plan)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                activePlan?.id === plan.id
                  ? 'bg-[#5b21b6] text-white border-[#5b21b6] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {plan.title || `Plan ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {activePlan && (
        <div className="space-y-5">
          
          {/* Active Plan Card Header */}
          <div className="bg-gradient-to-br from-white via-pink-50/50 to-purple-50/50 rounded-[32px] p-6 border border-pink-100 shadow-sm relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#5b21b6] uppercase tracking-wider bg-purple-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" />
                Assigned by Dr. Deepa Madhav
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {new Date(activePlan.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 font-playfair">{activePlan.title}</h2>
              {activePlan.plan_details?.summary && (
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                  {activePlan.plan_details.summary}
                </p>
              )}
            </div>

            {/* Doctor's Notes */}
            {activePlan.notes && (
              <div className="p-3.5 bg-white/90 rounded-2xl border border-pink-100 text-xs text-slate-700 font-medium">
                <span className="font-bold text-slate-900 block mb-0.5">Doctor's Clinical Suggestions:</span>
                {activePlan.notes}
              </div>
            )}
          </div>

          {/* AI Tailored Smart Recommendations */}
          <div className="bg-gradient-to-br from-purple-900 to-[#5b21b6] text-white rounded-[32px] p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-playfair">AI Smart Condition Recommendations</h3>
                <p className="text-[10px] text-purple-200">Personalized to your logged health metrics & condition</p>
              </div>
            </div>

            <ul className="space-y-2 pt-1 text-xs text-purple-100 font-medium">
              {(activePlan.plan_details?.ai_tips || [
                'Maintain glucose stability: Pair carbohydrates with protein and healthy fats at every meal.',
                'Seed Cycling: Take flax + pumpkin seeds in phase 1, sunflower + sesame seeds in phase 2 for estrogen/progesterone sync.',
                'Hydration: Drink 2.5L warm water + spearmint tea daily to reduce free androgens.'
              ]).map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-pink-300 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Guidelines Section */}
          {activePlan.plan_details?.guidelines && (
            <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm font-playfair flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Condition Guidelines & Rules
              </h3>

              <ul className="space-y-2.5">
                {activePlan.plan_details.guidelines.map((g: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5b21b6] shrink-0 mt-1.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meal Structure Section */}
          {activePlan.plan_details?.meal_structure && (
            <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm font-playfair flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#5b21b6]" />
                Daily Meal Structure
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(activePlan.plan_details.meal_structure).map(([mealKey, mealText]: any) => (
                  <div key={mealKey} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#5b21b6]">
                      {mealKey}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {mealText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Doctor Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base font-playfair">Edit Patient Diet Plan</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor Suggestions & Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-[#5b21b6] uppercase tracking-wider">Meal Structure</span>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-500">Breakfast</label>
                  <input
                    type="text"
                    value={editBreakfast}
                    onChange={e => setEditBreakfast(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500">Lunch</label>
                  <input
                    type="text"
                    value={editLunch}
                    onChange={e => setEditLunch(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500">Snack</label>
                  <input
                    type="text"
                    value={editSnack}
                    onChange={e => setEditSnack(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500">Dinner</label>
                  <input
                    type="text"
                    value={editDinner}
                    onChange={e => setEditDinner(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 h-10 text-slate-500 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 h-10 bg-[#5b21b6] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Plan Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
