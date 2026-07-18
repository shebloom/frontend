'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { GradientButton } from '@/components/shebloom';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  
  const [doctor, setDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<{ time: string; isBooked: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load doctor profile
    apiFetch(`/doctors/${params.id}`).then((res) => {
      setDoctor(res.doctor);
    }).catch(console.error);
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [params.id]);

  useEffect(() => {
    if (!selectedDate) return;
    // Load slots for the selected date
    apiFetch(`/doctors/${params.id}/slots?date=${selectedDate}`)
      .then((res) => {
        // Support both old string[] format and new { time, isBooked }[] format
        const rawSlots = res.slots || [];
        const normalized = rawSlots.map((s: any) =>
          typeof s === 'string' ? { time: s, isBooked: false } : s
        );
        setSlots(normalized);
        setSelectedSlot('');
      })
      .catch(console.error);
  }, [params.id, selectedDate]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: params.id,
          appointment_date: selectedDate,
          slot_time: selectedSlot,
          consultation_type: doctor.consultation_type || 'video',
        })
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate date options (next 7 days)
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayOfMonth: d.getDate(),
    };
  });

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-lavender-100 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h1>
        <p className="mt-2 text-slate-600">
          Your consultation with Dr. {doctor?.users?.full_name?.split(' ')[0]} is scheduled for {selectedDate} at {selectedSlot}.
        </p>
        <GradientButton onClick={() => router.push('/home')} className="mt-8" fullWidth size="lg">
          Go to Dashboard
        </GradientButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lavender-100 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center bg-bloom-header px-5 pb-4 pt-6 shadow-sm">
          <button onClick={() => router.back()} className="mr-4 text-slate-600">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Book Consultation</h1>
        </div>

        <div className="px-5 pt-6 pb-8">
          {/* Doctor summary */}
          {doctor && (
            <div className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-bloom-card border border-bloom-100/60">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bloom-100">
                {doctor.users?.avatar_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={doctor.users.avatar_url} alt={doctor.users.full_name} className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{doctor.users?.full_name}</h2>
                <p className="text-sm text-slate-500">{doctor.specialty}</p>
                <p className="text-sm font-semibold text-bloom-600">${doctor.consultation_fee}</p>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
            <CalendarIcon className="h-5 w-5 text-bloom-600" /> Select Date
          </h3>
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {dateOptions.map((opt) => {
              const isSelected = selectedDate === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDate(opt.value)}
                  className={`flex min-w-[72px] flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                    isSelected 
                      ? 'border-bloom-400 bg-bloom-gradient text-white shadow-bloom-btn' 
                      : 'border-bloom-100 bg-white text-slate-600'
                  }`}
                >
                  <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{opt.dayOfWeek}</span>
                  <span className="text-lg font-bold">{opt.dayOfMonth}</span>
                </button>
              );
            })}
          </div>

          {/* Time Selection */}
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
            <Clock className="h-5 w-5 text-bloom-600" /> Select Time
          </h3>
          {slots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => !slot.isBooked && setSelectedSlot(slot.time)}
                  disabled={slot.isBooked}
                  className={`relative rounded-xl border py-2.5 text-sm font-medium transition-all ${
                    slot.isBooked
                      ? 'border-red-100 bg-red-50 text-red-300 cursor-not-allowed'
                      : selectedSlot === slot.time
                      ? 'border-bloom-400 bg-bloom-50 text-bloom-700'
                      : 'border-bloom-100 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {slot.time}
                  {slot.isBooked && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                      Booked
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="mb-8 text-sm text-slate-500">No slots available for this date.</p>
          )}

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="sticky bottom-0 w-full bg-white px-5 py-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 border-t border-bloom-100/60">
        <div className="mx-auto max-w-[414px]">
          <GradientButton 
            onClick={handleBook} 
            disabled={!selectedSlot || isSubmitting}
            fullWidth 
            size="lg"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
