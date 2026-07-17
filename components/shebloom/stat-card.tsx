import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface Stat {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  /** Tailwind gradient classes for the icon badge background */
  iconBg?: string;
  /** Optional trend indicator, e.g. "+12%" */
  trend?: string;
  trendUp?: boolean;
}

interface StatCardProps {
  stat: Stat;
  className?: string;
}

export function StatCard({ stat, className }: StatCardProps) {
  const { label, value, unit, icon: Icon, iconBg, trend, trendUp } = stat;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl bg-white p-4',
        'shadow-bloom-card border border-bloom-100/60',
        'w-full',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconBg ?? 'bg-bloom-soft',
          )}
        >
          <Icon className="h-5 w-5 text-bloom-600" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold',
              trendUp ? 'text-green-600' : 'text-slate-400',
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
