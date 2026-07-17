'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CycleState =
  | 'period'
  | 'fertile'
  | 'ovulation'
  | 'predicted'
  | 'selected'
  | 'default';

export interface CalendarDay {
  day: number;
  state?: CycleState;
}

interface CalendarGridProps {
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
  days?: CalendarDay[];
  onSelectDay?: (day: CalendarDay) => void;
  className?: string;
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const stateStyles: Record<CycleState, string> = {
  period:    'text-slate-800 font-semibold hover:bg-bloom-50',
  fertile:   'text-slate-800 font-semibold hover:bg-bloom-50',
  ovulation: 'text-slate-800 font-semibold hover:bg-bloom-50',
  predicted: 'text-slate-800 font-semibold hover:bg-bloom-50',
  selected:  'bg-bloom-600 text-white font-bold rounded-full',
  default:   'text-slate-600 hover:bg-bloom-50',
};

const dotColor: Record<CycleState, string> = {
  period:    'bg-[#ef4444]', // Red
  fertile:   'bg-[#22c55e]', // Green
  ovulation: 'bg-[#8b5cf6]', // Violet/Purple
  predicted: 'bg-[#f97316]', // Orange/Predicted
  selected:  '',
  default:   '',
};

function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function CalendarGrid({
  currentMonth = new Date(),
  onMonthChange,
  days,
  onSelectDay,
  className,
}: CalendarGridProps & { currentMonth?: Date; onMonthChange?: (date: Date) => void }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a lookup from provided days, or use empty
  const dayMap = new Map<number, CycleState>();
  if (days) {
    days.forEach((d) => dayMap.set(d.day, d.state ?? 'default'));
  }

  const cells: (CalendarDay | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const state = dayMap.get(d) ?? 'default';
    cells.push({ day: d, state: selectedDay === d ? 'selected' : state });
  }

  const handlePrev = () => onMonthChange?.(new Date(year, month - 1, 1));
  const handleNext = () => onMonthChange?.(new Date(year, month + 1, 1));

  const handleSelect = (day: CalendarDay) => {
    setSelectedDay(day.day);
    onSelectDay?.(day);
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-3xl bg-white p-4',
        'shadow-bloom-card border border-bloom-100/60',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">
          {getMonthName(currentMonth)}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-bloom-50 hover:text-bloom-600"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-bloom-50 hover:text-bloom-600"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-semibold text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="aspect-square" />;
          const state = cell.state ?? 'default';
          return (
            <button
              key={i}
              onClick={() => handleSelect(cell)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center pb-2 pt-1',
                'rounded-full text-sm transition-all duration-150',
                'active:scale-95',
                stateStyles[state],
              )}
            >
              <span className="leading-none">{cell.day}</span>
              {/* Dot indicator below number */}
              {cell.state && cell.state !== 'selected' && cell.state !== 'default' && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                    dotColor[cell.state],
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-bloom-100 pt-3">
        <LegendDot color="bg-[#ef4444]" label="Period" />
        <LegendDot color="bg-[#22c55e]" label="Fertile Window" />
        <LegendDot color="bg-[#8b5cf6]" label="Ovulation" />
        <LegendDot color="bg-[#f97316]" label="Predicted" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
