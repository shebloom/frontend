'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { BloomLogo } from '@/components/shebloom';
import {
  Users,
  UserCheck,
  User,
  Trash2,
  Search,
  ArrowLeft,
  FileCheck,
  XCircle,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');
  const [showVerifications, setShowVerifications] = useState(true);

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
      const [usersRes, appsRes] = await Promise.all([
        apiFetch('/admin/users'),
        apiFetch('/admin/doctor-applications'),
      ]);
      setUsers(usersRes.users || []);
      setApplications(appsRes.applications || []);
    } catch (err) {
      console.error('Admin users load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleReviewDoctor = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      await apiFetch(`/admin/doctor-applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to review application');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingApps = applications.filter(a => a.status === 'pending');

  if (isLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-lavender-100">
        <BloomLogo size="md" />
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-lavender-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin-panel" className="h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-sm">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">User Management</h1>
            <p className="text-xs text-slate-500 font-medium">{users.length} total members</p>
          </div>
        </div>

        {/* Doctor Verifications */}
        {pendingApps.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 mb-4 overflow-hidden">
            <button
              onClick={() => setShowVerifications(!showVerifications)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-bold text-amber-800">Pending Verifications ({pendingApps.length})</span>
              </div>
              {showVerifications ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {showVerifications && (
              <div className="px-4 pb-4 space-y-3">
                {pendingApps.map((app) => (
                  <div key={app.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{app.users?.full_name || 'Unknown'}</p>
                        <p className="text-[10px] text-bloom-600 font-medium">{app.specialty} · {app.experience_years}y exp · License: {app.license_number}</p>
                      </div>
                    </div>
                    {app.doctor_documents?.length > 0 && (
                      <a 
                        href={app.doctor_documents[0].file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded inline-block mb-2"
                      >
                        📄 View Document
                      </a>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewDoctor(app.id, 'rejected')}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-500 font-bold text-[11px] hover:bg-red-50 flex items-center justify-center gap-1"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                      <button
                        onClick={() => handleReviewDoctor(app.id, 'approved')}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-bloom-600 text-white font-bold text-[11px] hover:bg-bloom-700 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-bloom-300"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-bloom-300"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-bloom-100/50 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-bloom-100 flex items-center justify-center shrink-0 overflow-hidden">
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-bloom-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{u.full_name || 'Unnamed User'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{u.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                u.role === 'doctor' ? 'bg-green-50 text-green-700 border border-green-200' :
                u.role === 'admin' ? 'bg-bloom-50 text-bloom-700 border border-bloom-200' :
                'bg-slate-50 text-slate-600 border border-slate-200'
              }`}>
                {u.role}
              </span>
              {u.role !== 'admin' && (
                <button
                  onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs font-semibold border border-slate-200">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
