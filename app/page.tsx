'use client';

import { useRouter } from 'next/navigation';
import { BloomLogo, GradientButton } from '@/components/shebloom';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex flex-col bg-lavender-100 overflow-hidden justify-between py-10 px-6">
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center mt-2">
        <BloomLogo size="xl" layout="vertical" />
        <h2 className="mt-3 text-[13px] font-bold text-slate-500 uppercase tracking-wide">
          Your Journey to Better Health Starts Here
        </h2>
      </div>

      {/* Doctor Image Panel (Styled like mockup) */}
      <div className="my-6 flex justify-center">
        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-bloom-card bg-bloom-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/doctor_deepa.png"
            alt="Dr. Deepa Madhavan with babies"
            className="w-full h-full object-cover object-center"
          />
          {/* Abstract gradient back drop overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bloom-900/10 to-transparent" />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full space-y-3">
        <GradientButton
          size="lg"
          fullWidth
          onClick={() => router.push('/signup')}
        >
          Create Account
        </GradientButton>
        <button
          onClick={() => router.push('/login')}
          className="h-12 w-full rounded-full border-2 border-bloom-200 bg-white text-base font-bold text-bloom-700 transition-all hover:bg-bloom-50 active:scale-[0.98] shadow-sm"
        >
          Login
        </button>
        <p className="text-center text-[10px] text-slate-400 font-medium tracking-wide">
          Secure. Private. For You.
        </p>
      </div>
    </div>
  );
}
