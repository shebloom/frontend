'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { BloomLogo } from '@/components/shebloom';
import {
  TrendingUp,
  ArrowLeft,
  Calendar,
  Stethoscope,
  IndianRupee,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && profile?.role !== 'admin') {
      router.replace('/home');
    }
  }, [isLoading, profile, router]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      const [consRes, statsRes] = await Promise.all([
        apiFetch('/admin/consultations'),
        apiFetch('/admin/stats'),
      ]);
      setConsultations(consRes.consultations || []);
      setStats(statsRes);
    } catch (err) {
      console.error('Admin analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-lavender-100">
        <BloomLogo size="md" />
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  // Compute Revenue
  const totalRevenue = consultations
    .filter(c => c.status === 'completed' || c.status === 'confirmed')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const completedCount = consultations.filter(c => c.status === 'completed').length;
  const pendingCount = consultations.filter(c => c.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-lavender-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin-panel" className="h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-sm">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Business Analytics</h1>
            <p className="text-xs text-slate-500 font-medium">Revenue & Consultations</p>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-bloom-600 to-bloom-500 rounded-3xl p-5 text-white shadow-bloom-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold opacity-90">Total Revenue</p>
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <IndianRupee className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</h2>
            <p className="text-[10px] font-medium opacity-80 mt-1">From {completedCount} completed sessions</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-bloom-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-500">Total Consults</p>
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{consultations.length}</h2>
            <p className="text-[10px] font-medium text-slate-400 mt-1">{pendingCount} currently pending</p>
          </div>
        </div>

        {/* Consultation History */}
        <h2 className="text-sm font-bold text-slate-800 mb-3 ml-1">Recent Consultations</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-bloom-100/50 overflow-hidden">
          {consultations.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No consultations recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {consultations.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      c.status === 'completed' ? 'bg-green-50' :
                      c.status === 'confirmed' ? 'bg-blue-50' :
                      c.status === 'cancelled' || c.status === 'rejected' ? 'bg-red-50' :
                      'bg-amber-50'
                    }`}>
                      {c.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                       c.status === 'confirmed' ? <Calendar className="h-5 w-5 text-blue-500" /> :
                       c.status === 'cancelled' || c.status === 'rejected' ? <XCircle className="h-5 w-5 text-red-500" /> :
                       <Clock className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{c.patient?.full_name || 'Unknown Patient'}</p>
                      <p className="text-[10px] text-slate-500 font-medium">with Dr. {c.doctor?.users?.full_name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">₹{c.amount || 0}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      c.status === 'completed' ? 'text-green-600' :
                      c.status === 'confirmed' ? 'text-blue-600' :
                      c.status === 'cancelled' || c.status === 'rejected' ? 'text-red-500' :
                      'text-amber-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
