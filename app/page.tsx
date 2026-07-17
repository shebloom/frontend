'use client';

import { useRouter } from 'next/navigation';
import { BloomLogo, GradientButton } from '@/components/shebloom';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex flex-col bg-lavender-100 overflow-hidden justify-between py-10 px-6">
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center mt-6">
        <BloomLogo size="xl" layout="vertical" showText={false} />
        <h3 className="mt-6 text-sm font-semibold text-bloom-600">Welcome to</h3>
        <h1 className="text-3xl font-bold text-bloom-700 mt-1">SheBloom</h1>
        <h2 className="mt-3 text-sm font-bold text-slate-700">
          Your Journey to Better Health Starts Here
        </h2>
      </div>

      {/* Doctor Image Panel */}
      <div className="mt-auto mb-6 flex justify-center w-full px-4">
        <div className="relative w-[240px] h-[240px] rounded-full overflow-hidden border-8 border-white shadow-bloom-card flex items-center justify-center bg-indigo-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dr_deepa_avatar.jpg"
            alt="Dr. Deepa Madhavan"
            className="w-full h-full object-cover object-top"
          />
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
