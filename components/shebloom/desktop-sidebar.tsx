'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Activity, Users, Settings, User, LogOut } from 'lucide-react';
import { BloomLogo } from './logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';

const navItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Calendar, label: 'Consult', href: '/consult' },
  { icon: Activity, label: 'Health', href: '/health' },
  { icon: Users, label: 'Community', href: '/community' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  
  // Hide on onboarding/auth pages
  const isAuthFlow = ['/login', '/signup', '/onboarding', '/'].includes(pathname || '');

  if (isAuthFlow) {
    return (
      <div className="hidden lg:flex lg:w-[48%] xl:w-[42%] flex-col bg-[#fff5f8] px-12 py-10 overflow-hidden justify-center border-r border-bloom-100">
         <BloomLogo size="xl" layout="vertical" />
         <p className="mt-6 text-center text-slate-500 font-medium">Welcome to SheBloom. Your complete women's health companion.</p>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col bg-white border-r border-bloom-100 p-6 justify-between shrink-0 h-screen sticky top-0">
      <div>
        <div className="mb-10 pl-2">
          <BloomLogo size="md" showIcon />
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all',
                  isActive
                    ? 'bg-bloom-50 text-bloom-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-bloom-600' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
