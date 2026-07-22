'use client';

import { AuthSidebar } from '@/components/shebloom';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 lg:grid lg:grid-cols-12 bg-lavender-100 overflow-hidden">
      <AuthSidebar className="lg:col-span-5" />

      {/* Right side: auth area */}
      <div className="col-span-12 lg:col-span-7 h-full flex flex-col relative overflow-hidden bg-lavender-100 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
        {/* Main Content Area - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto w-full mx-auto relative custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
