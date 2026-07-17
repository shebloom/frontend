'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Sparkles, Activity, Calendar, Check, X, Loader2 } from 'lucide-react';
import { CalendarGrid, type CalendarDay } from '@/components/shebloom';
import { StatCard, type Stat } from '@/components/shebloom';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

export default function CyclePage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cycleDays, setCycleDays] = useState<CalendarDay[]>([]);
  const [insights, setInsights] = useState<{ avg_cycle_length: number | null; avg_period_length: number | null; last_period_start: string | null }>({
    avg_cycle_length: null,
    avg_period_length: null,
    last_period_start: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Edit period date state
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [savingPeriod, setSavingPeriod] = useState(false);

  useEffect(() => {
    loadCycleData();
  }, [currentMonth]);

  const loadCycleData = async () => {
    setIsLoading(true);
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const [logsData, insightsData] = await Promise.all([
        apiFetch(`/cycle/logs?month=${monthStr}`),
        apiFetch('/cycle/insights'),
      ]);

      // Convert DB logs into CalendarDay format (day number only for the current month)
      const days: CalendarDay[] = (logsData.logs || []).map((log: any) => {
        const d = new Date(log.log_date + 'T00:00:00');
        return { day: d.getDate(), state: log.state };
      });
      setCycleDays(days);
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load cycle data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodStart || !periodEnd) return;
    setSavingPeriod(true);
    try {
      await apiFetch('/cycle/period', {
        method: 'PUT',
        body: JSON.stringify({ start_date: periodStart, end_date: periodEnd }),
      });
      setIsEditingPeriod(false);
      setPeriodStart('');
      setPeriodEnd('');
      loadCycleData(); // Reload calendar with new data
    } catch (err) {
      alert('Failed to save period dates. Please try again.');
    } finally {
      setSavingPeriod(false);
    }
  };

  // Compute today's cycle day from last period start
  const todayCycleDay = insights.last_period_start
    ? Math.floor((Date.now() - new Date(insights.last_period_start).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;

  const cycleLength = insights.avg_cycle_length || 28;
  const ovulationDay = Math.round(cycleLength / 2);
  const fertileStart = ovulationDay - 2;
  const fertileEnd = ovulationDay + 2;

  const isInFertileWindow = todayCycleDay !== null && todayCycleDay >= fertileStart && todayCycleDay <= fertileEnd;
  const isOvulation = todayCycleDay !== null && todayCycleDay === ovulationDay;
  const isInPeriod = todayCycleDay !== null && todayCycleDay <= (insights.avg_period_length || 5);

  const todayPhaseLabel = isInPeriod ? 'Menstrual Phase'
    : isOvulation ? 'Ovulation Day 🌟'
    : isInFertileWindow ? 'Fertile Window'
    : todayCycleDay !== null && todayCycleDay < fertileStart ? 'Follicular Phase'
    : todayCycleDay !== null ? 'Luteal Phase'
    : 'No Cycle Data Yet';

  const todayPhaseDesc = isInPeriod
    ? 'Rest and take it easy. Stay hydrated and warm.'
    : isOvulation
    ? 'Peak fertility today. Your energy levels are at their highest.'
    : isInFertileWindow
    ? 'Fertility is high. Great time for activity and social connection.'
    : todayCycleDay !== null && todayCycleDay < fertileStart
    ? 'Energy levels are rising. Great time for new activities and exercise.'
    : todayCycleDay !== null
    ? 'Progesterone is high. Focus on rest and self-care.'
    : 'Log your period dates below to start tracking your cycle.';

  // Compute next period estimate
  const nextPeriodDate = insights.last_period_start
    ? new Date(new Date(insights.last_period_start).getTime() + cycleLength * 24 * 60 * 60 * 1000)
    : null;

  const insightStats: Stat[] = [
    {
      label: 'Cycle Length',
      value: insights.avg_cycle_length?.toString() || '--',
      unit: 'days',
      icon: Activity,
      iconBg: 'bg-bloom-soft',
      trend: insights.avg_cycle_length ? 'Regular' : undefined,
      trendUp: true,
    },
    {
      label: 'Period Length',
      value: insights.avg_period_length?.toString() || '--',
      unit: 'days',
      icon: Calendar,
      iconBg: 'bg-petal-100',
    },
  ];

  return (
    <div>
      {/* Header */}
      <header className="flex items-center gap-3 bg-bloom-header px-5 pb-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-bloom-card border border-bloom-100"
        >
          <ArrowLeft className="h-5 w-5 text-bloom-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Hi {profile?.full_name?.split(' ')[0] || 'there'}, your Cycle 🌸
          </h1>
          <p className="text-sm text-slate-500">Track and understand your cycle</p>
        </div>
      </header>

      {/* Today's info */}
      <section className="px-5 pt-5">
        <div className="overflow-hidden rounded-3xl bg-bloom-gradient p-5 text-white shadow-bloom-btn">
          <p className="text-xs font-medium text-white/80">Today{todayCycleDay ? ` · Day ${todayCycleDay}` : ''}</p>
          <div className="mt-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <h2 className="text-xl font-bold">{todayPhaseLabel}</h2>
          </div>
          <p className="mt-1 text-sm text-white/85">{todayPhaseDesc}</p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs text-white/70">Next Period</p>
              <p className="text-sm font-semibold">
                {nextPeriodDate
                  ? nextPeriodDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  : '--'}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs text-white/70">Ovulation</p>
              <p className="text-sm font-semibold">
                {insights.avg_cycle_length ? `Day ${ovulationDay}` : '--'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="px-5 pt-5">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-3xl bg-white shadow-bloom-card border border-bloom-100/60">
            <Loader2 className="h-6 w-6 animate-spin text-bloom-400" />
          </div>
        ) : (
          <CalendarGrid
            currentMonth={currentMonth}
            onMonthChange={(m) => setCurrentMonth(m)}
            days={cycleDays}
          />
        )}
      </section>

      {/* Edit period dates */}
      <section className="px-5 pt-5">
        {!isEditingPeriod ? (
          <button
            onClick={() => setIsEditingPeriod(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-bloom-200 bg-white py-3 text-sm font-semibold text-bloom-700 transition hover:bg-bloom-50 active:scale-[0.98]"
          >
            <Edit3 className="h-4 w-4" />
            Edit Period Dates
          </button>
        ) : (
          <form
            onSubmit={handleSavePeriod}
            className="rounded-2xl border-2 border-bloom-200 bg-white p-4 shadow-bloom-card"
          >
            <p className="text-sm font-semibold text-slate-800 mb-3">Set Period Dates</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={periodEnd}
                  min={periodStart}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setIsEditingPeriod(false); setPeriodStart(''); setPeriodEnd(''); }}
                className="flex flex-1 items-center justify-center gap-1 h-11 rounded-full border-2 border-slate-200 text-sm font-semibold text-slate-600"
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="submit"
                disabled={savingPeriod}
                className="flex flex-1 items-center justify-center gap-1 h-11 rounded-full bg-bloom-gradient text-sm font-semibold text-white shadow-bloom-btn disabled:opacity-70"
              >
                {savingPeriod ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {savingPeriod ? 'Saving...' : 'Save Dates'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Insights */}
      <section className="px-5 pt-6">
        <h2 className="text-base font-semibold text-slate-800">Your Insights</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {insightStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      {/* Phase info */}
      <section className="px-5 pt-5 pb-8">
        <div className="rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60">
          <h3 className="text-sm font-semibold text-slate-800">Current Phase</h3>
          <p className="mt-1 text-xs text-slate-600">{todayPhaseDesc}</p>
          {!insights.last_period_start && (
            <p className="mt-2 text-xs text-bloom-600 font-medium">
              Tap &quot;Edit Period Dates&quot; above to log your period and get personalised insights!
            </p>
          )}
          {insights.last_period_start && (
            <div className="mt-3 pt-3 border-t border-bloom-100/60 space-y-1.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Calendar Colors</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-cycle-period" />Period</span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-cycle-ovulation" />Ovulation</span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-cycle-fertile" />Fertile Window</span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-cycle-predicted" />Predicted</span>
              </div>
            </div>
          )}
        </div>

        {/* Cycle terms explainer — helps users who don't know what these mean */}
        <div className="mt-3 rounded-2xl bg-bloom-50 border border-bloom-100 p-4 space-y-3">
          <p className="text-xs font-bold text-bloom-700">🌸 What do these numbers mean?</p>
          <div className="space-y-2.5">
            <div>
              <p className="text-xs font-semibold text-slate-700">Cycle Length</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                The number of days from the <strong>first day of your period</strong> to the first day of your <em>next</em> period. The average is 28 days, but anywhere from 21–35 days is normal. Don't worry if yours is different!
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Period Length</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                How many days your period actually lasts. Usually 3–7 days. We use this to predict your fertile window and ovulation day.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Not sure about your numbers?</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Just log your period start and end dates each month — SheBloom will automatically learn your cycle and fill these in for you. 💜
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
