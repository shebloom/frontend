'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Video,
  Star,
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

export default function ConsultPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  // Booking state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<{ time: string; isBooked: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Generate next 14 days for date selector
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
    };
  });

  // Load Dr. Deepa Madhavan's profile
  useEffect(() => {
    async function loadDoctor() {
      try {
        setLoadingDoctor(true);
        const res = await apiFetch('/doctors');
        if (res.doctors && res.doctors.length > 0) {
          setDoctor(res.doctors[0]);
        }
      } catch (err) {
        console.error('Failed to load Dr. Deepa Madhavan profile', err);
      } finally {
        setLoadingDoctor(false);
      }
    }
    loadDoctor();
  }, []);

  // Load slots whenever selectedDate or doctor changes
  useEffect(() => {
    if (!doctor?.id) return;
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const res = await apiFetch(`/doctors/${doctor.id}/slots?date=${selectedDate}`);
        setSlots(res.slots || []);
      } catch (err) {
        console.error('Failed to load slots', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [doctor?.id, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot || !doctor?.id) return;
    setBooking(true);
    setBookingError(null);

    try {
      const res = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: doctor.id,
          appointment_date: selectedDate,
          slot_time: selectedSlot,
          consultation_type: 'video',
          notes: notes.trim() || undefined,
        }),
      });

      if (res.appointment) {
        setBookingSuccess(true);
      } else {
        throw new Error(res.error || 'Failed to complete booking');
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setBooking(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Loading Dr. Deepa's profile...</p>
      </div>
    );
  }

  const doctorName = doctor?.users?.full_name || 'Dr. Deepa Madhavan';
  const doctorAvatar = doctor?.users?.avatar_url || '/images/dr_deepa_cutout.png';

  return (
    <div className="pb-28 max-w-[640px] mx-auto px-4 pt-6">
      
      {/* Header */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold text-[#9d174d] uppercase tracking-widest bg-pink-100/70 px-3 py-1 rounded-full">
          Primary Care Specialist
        </span>
        <h1 className="text-2xl font-black text-slate-800 font-playfair tracking-tight mt-2">
          Consult with Dr. Deepa Madhavan
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Direct 1-on-1 video consultations for all your reproductive and menstrual health needs.
        </p>
      </div>

      {/* Dr. Deepa Madhavan Hero Card */}
      <div className="bg-gradient-to-br from-white via-[#FFF5F8] to-[#FCE7F3] rounded-[32px] p-6 border border-pink-100/80 shadow-[0_10px_30px_rgba(91,33,182,0.06)] relative overflow-hidden mb-8">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          
          {/* Doctor Image */}
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-[#f0f8ff]" style={{ background: 'aliceblue' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={doctorAvatar} 
              alt={doctorName} 
              className="h-full w-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/dr_deepa_avatar_pink.jpg";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#5b21b6]" />
              <span className="text-[11px] font-bold text-[#5b21b6]">Verified Chief Specialist</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 font-playfair">{doctorName}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{doctor?.specialty || 'Obstetrics & Gynecology (OB/GYN)'}</p>
            
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {Number(doctor?.rating || 4.9).toFixed(1)}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">{doctor?.experience_years || 15}+ Yrs Exp</span>
              <span>•</span>
              <span className="text-[#5b21b6] font-bold">12 Free Consults/Yr</span>
            </div>

            {/* Specialties Badges */}
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mt-3.5">
              {(doctor?.specialties || ['PCOS Care', 'High-Risk Pregnancy', 'Infertility', 'Menstrual Health']).map((s: string, idx: number) => (
                <span key={idx} className="text-[10.5px] font-semibold text-slate-700 bg-white/90 px-2.5 py-1 rounded-full border border-pink-100 shadow-2xs">
                  {s}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 leading-relaxed mt-5 pt-4 border-t border-pink-100/60 font-sans relative z-10">
          {doctor?.about || 'Dr. Deepa Madhavan is a renowned Gynecologist and Reproductive Health Specialist with over 15 years of clinical experience in women’s wellness, fertility care, and PCOS management.'}
        </p>

      </div>

      {/* Booking Form Section */}
      <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#5b21b6]" />
            <h3 className="font-bold text-slate-800 text-base">Select Consultation Date</h3>
          </div>
        </div>

        {/* Horizontal Date Picker */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {availableDates.map((item) => {
            const isSelected = selectedDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[62px] h-[72px] rounded-2xl transition-all border shrink-0',
                  isSelected
                    ? 'bg-[#5b21b6] text-white border-[#5b21b6] shadow-md scale-[1.03]'
                    : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-pink-50/50'
                )}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{item.dayName}</span>
                <span className="text-lg font-black leading-tight mt-0.5">{item.dayNumber}</span>
                <span className="text-[9px] font-semibold opacity-75">{item.monthName}</span>
              </button>
            );
          })}
        </div>

        {/* Time Slots Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5b21b6]" />
              <span className="text-sm font-bold text-slate-700">Available Time Slots</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {slots.filter(s => !s.isBooked).length} slots available
            </span>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-6">
              <p className="text-xs font-bold text-slate-400 animate-pulse">Checking Dr. Deepa's availability...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
              <p className="text-xs font-bold text-slate-600">No available slots on this date.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Please choose another date above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.time;
                const isBooked = slot.isBooked;

                return (
                  <button
                    key={slot.time}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center',
                      isBooked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-[#5b21b6] text-white border-[#5b21b6] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#5b21b6] hover:bg-pink-50/30'
                    )}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Optional Notes */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Describe your concern or symptoms (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Irregular cycles, severe cramping, or fertility questions for Dr. Deepa..."
            className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-900 focus:border-[#5b21b6] focus:ring-2 focus:ring-pink-200 focus:outline-none"
          />
        </div>

        {/* Error Banner */}
        {bookingError && (
          <div className="p-3.5 bg-red-50 text-red-600 text-xs font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        {/* Submit Action */}
        <button
          disabled={!selectedSlot || booking}
          onClick={handleBook}
          className="w-full h-14 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-extrabold rounded-full text-sm shadow-[0_8px_20px_-6px_rgba(91,33,182,0.4)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Video className="w-4 h-4" />
          {booking ? 'Confirming Appointment...' : selectedSlot ? `Confirm Booking for ${selectedSlot}` : 'Select a Time Slot Above'}
        </button>

      </div>

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-slate-800">Booking Confirmed!</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Your video consultation with <span className="font-bold text-slate-800">Dr. Deepa</span> is scheduled for <span className="font-bold text-[#5b21b6]">{selectedDate}</span> at <span className="font-bold text-[#5b21b6]">{selectedSlot}</span>.
              </p>
            </div>

            <div className="bg-pink-50/70 p-3.5 rounded-2xl text-left border border-pink-100/60 text-xs text-slate-600 space-y-1 font-medium">
              <p className="font-bold text-slate-800">Consultation Details:</p>
              <p>• Type: 1-on-1 Video Call</p>
              <p>• Doctor: Dr. Deepa Madhavan (OB/GYN Specialist)</p>
              <p>• Platform Fee: Free (Included in annual 12 consultations)</p>
            </div>

            <button
              onClick={() => {
                setBookingSuccess(false);
                router.push('/home');
              }}
              className="w-full h-12 bg-[#5b21b6] text-white font-bold rounded-full text-xs shadow-md"
            >
              Go to Home & View Appointments
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
