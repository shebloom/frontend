'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { BloomLogo } from '@/components/shebloom';
import {
  Users,
  Calendar,
  MessageSquare,
  Shield,
  Bell,
  Sparkles,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && profile?.role !== 'admin') {
      router.replace('/home');
    }
  }, [isLoading, profile, router]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    async function load() {
      try {
        const [statsRes, notifRes] = await Promise.all([
          apiFetch('/admin/stats'),
          apiFetch('/admin/notifications'),
        ]);
        setStats(statsRes);
        setNotifications(notifRes.notifications || []);
      } catch (err) {
        console.error('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  if (isLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-lavender-100">
        <BloomLogo size="md" />
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'bg-bloom-100 text-bloom-700', href: '/admin-panel/users' },
    { label: 'Consultations', value: stats?.total_appointments || 0, icon: Calendar, color: 'bg-blue-100 text-blue-700', href: '/admin-panel/analytics' },
    { label: 'Yoga Conditions', value: 3, icon: Sparkles, color: 'bg-purple-100 text-purple-700', href: '/admin-panel/wellness' },
    { label: 'Community Posts', value: stats?.total_community_posts || 0, icon: MessageSquare, color: 'bg-amber-100 text-amber-700', href: '/admin-panel/content' },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-lavender-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-bloom-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">SheBloom Control Center</p>
            </div>
          </div>
          <div className="relative">
            <Bell className="h-5 w-5 text-slate-500" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-white rounded-2xl p-4 shadow-sm border border-bloom-100/50 hover:shadow-md transition-all group"
              >
                <div className={`h-9 w-9 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5 group-hover:text-bloom-600 transition-colors">{card.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin-panel/doctor" className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-all flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Dr. Deepa & Slots</p>
              <p className="text-[10px] text-slate-400">Profile & slot editor</p>
            </div>
          </Link>
          <Link href="/admin-panel/users" className="bg-white rounded-2xl p-4 shadow-sm border border-bloom-100/50 hover:shadow-md transition-all flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-bloom-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-bloom-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Manage Users</p>
              <p className="text-[10px] text-slate-400">View & delete members</p>
            </div>
          </Link>
          <Link href="/admin-panel/wellness" className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-all flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Yoga CRUD</p>
              <p className="text-[10px] text-slate-400">Manage categories & videos</p>
            </div>
          </Link>
          <Link href="/admin-panel/content" className="bg-white rounded-2xl p-4 shadow-sm border border-bloom-100/50 hover:shadow-md transition-all flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-bloom-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-bloom-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Content & Posts</p>
              <p className="text-[10px] text-slate-400">Manage community feed</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
