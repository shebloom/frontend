'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Stethoscope, HeartPulse, Sparkles, User, Users, BarChart3, FileText, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';

const patientNav = [
  { id: 'home',     label: 'Home',     icon: Home,        href: '/home' },
  { id: 'consult',  label: 'Consult',  icon: Stethoscope, href: '/consult' },
  { id: 'programs', label: 'Programs', icon: HeartPulse,  href: '/programs' },
  { id: 'wellness', label: 'Wellness', icon: Sparkles,    href: '/wellness' },
  { id: 'profile',  label: 'Profile',  icon: User,        href: '/profile' },
];

const adminNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin-panel' },
  { id: 'users',     label: 'Users',     icon: Users,           href: '/admin-panel/users' },
  { id: 'content',   label: 'Content',   icon: FileText,        href: '/admin-panel/content' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3,       href: '/admin-panel/analytics' },
  { id: 'profile',   label: 'Profile',   icon: User,            href: '/profile' },
];

const doctorNav = [
  { id: 'home',      label: 'Home',      icon: Home,            href: '/home' },
  { id: 'profile',   label: 'Profile',   icon: User,            href: '/profile' },
];

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = 
    profile?.role === 'admin' 
      ? adminNav 
      : profile?.role === 'doctor'
      ? doctorNav
      : patientNav;

  return (
    <nav
      className={cn(
        'flex w-full items-stretch justify-around',
        'border-t border-bloom-100/60',
        'bg-white/95 backdrop-blur-md',
        'shadow-bloom-nav',
        'pb-safe px-2 pt-2',
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === '/admin-panel'
            ? pathname === '/admin-panel'
            : pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-bloom-300"
          >
            <Icon
              className={cn(
                'h-6 w-6 transition-all duration-200',
                isActive ? 'text-bloom-600 scale-110' : 'text-slate-400',
              )}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={cn(
                'text-[10px] font-medium leading-none transition-colors duration-200',
                isActive ? 'text-bloom-600' : 'text-slate-400',
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// Legacy export kept for backward compat
export type { NavItem } from './bottom-nav-types';
