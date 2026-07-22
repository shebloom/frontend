'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (profile?.role === 'admin') {
        router.replace('/admin-panel');
      } else {
        router.replace('/home');
      }
    }
  }, [isLoading, profile, router]);

  return (
    <div className="fixed inset-0 bg-[#FFF5F8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Taking you to SheBloom...</p>
      </div>
    </div>
  );
}
