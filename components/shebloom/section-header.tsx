import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
