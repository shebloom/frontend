import { Star, Video, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount?: number;
  photoUrl: string;
  availability?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBookConsult?: (id: string) => void;
  onMessage?: (id: string) => void;
  className?: string;
}

export function DoctorCard({
  doctor,
  onBookConsult,
  onMessage,
  className,
}: DoctorCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-3xl bg-white p-4',
        'shadow-bloom-card border border-bloom-100/60',
        'w-full max-w-sm',
        className,
      )}
    >
      {/* Top: photo + info */}
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-bloom-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate text-base font-semibold text-slate-800">
            {doctor.name}
          </h3>
          <p className="truncate text-sm text-slate-500">
            {doctor.specialty}
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-slate-700">
              {doctor.rating.toFixed(1)}
            </span>
            {doctor.reviewCount && (
              <span className="text-xs text-slate-400">
                ({doctor.reviewCount})
              </span>
            )}
          </div>

          {doctor.availability && (
            <p className="mt-0.5 text-xs font-medium text-green-600">
              {doctor.availability}
            </p>
          )}
        </div>
      </div>

      {/* Bottom: action buttons */}
      <div className="flex gap-2.5">
        <button
          onClick={() => onBookConsult?.(doctor.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5',
            'h-10 rounded-xl bg-bloom-gradient text-white text-sm font-semibold',
            'shadow-bloom-btn transition-all duration-200',
            'hover:brightness-105 active:scale-[0.98]',
          )}
        >
          <Video className="h-4 w-4" />
          Book Now
        </button>
        <button
          onClick={() => onMessage?.(doctor.id)}
          className={cn(
            'flex items-center justify-center gap-1.5',
            'h-10 px-4 rounded-xl bg-bloom-50 text-bloom-700 text-sm font-semibold',
            'border border-bloom-200 transition-all duration-200',
            'hover:bg-bloom-100 active:scale-[0.98]',
          )}
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </button>
      </div>
    </div>
  );
}
