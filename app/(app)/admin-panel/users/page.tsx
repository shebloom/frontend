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
  X,
  XCircle,
  Clock,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Stethoscope,
  Award,
  FileText,
  Calendar,
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

  // Selected User Modal/Drawer State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Verify Doctor Form State
  const [specialty, setSpecialty] = useState('Obstetrics & Gynecology (OB/GYN)');
  const [experienceYears, setExperienceYears] = useState('10');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [verifyingDoctor, setVerifyingDoctor] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState('');

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

  const handleSelectUser = async (userObj: any) => {
    setSelectedUser(userObj);
    setUserDetails(null);
    setVerifySuccess('');
    setSpecialty('Obstetrics & Gynecology (OB/GYN)');
    setExperienceYears('10');
    setLicenseNumber(`MD-GYN-${Math.floor(100000 + Math.random() * 900000)}`);

    try {
      setLoadingDetails(true);
      const res = await apiFetch(`/admin/users/${userObj.id}`);
      setUserDetails(res);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleVerifyDoctor = async () => {
    if (!selectedUser?.id) return;
    setVerifyingDoctor(true);
    setVerifySuccess('');

    try {
      const res = await apiFetch(`/admin/users/${selectedUser.id}/verify-doctor`, {
        method: 'PATCH',
        body: JSON.stringify({
          specialty: specialty.trim() || 'Obstetrics & Gynecology (OB/GYN)',
          experience_years: parseInt(experienceYears) || 10,
          license_number: licenseNumber.trim() || `MD-VERIFIED-${Date.now().toString().slice(-6)}`,
        }),
      });

      if (res.success) {
        setVerifySuccess('User successfully verified as Doctor!');
        // Update state in user list
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, role: 'doctor' } : u))
        );
        setSelectedUser((prev: any) => (prev ? { ...prev, role: 'doctor' } : null));

        // Reload applications list & user details
        loadData();
      } else {
        alert(res.error || 'Failed to verify doctor');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify doctor');
    } finally {
      setVerifyingDoctor(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
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
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      );
      loadData();
    } catch (err) {
      alert('Failed to review application');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingApps = applications.filter((a) => a.status === 'pending');

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin-panel" className="h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-sm">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">User Management</h1>
              <p className="text-xs text-slate-500 font-medium">{users.length} total members • Select any user to view profile & verify</p>
            </div>
          </div>
        </div>

        {/* Doctor Verifications Banner */}
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
                <span className="text-sm font-bold text-amber-800">Pending Doctor Verifications ({pendingApps.length})</span>
              </div>
              {showVerifications ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {showVerifications && (
              <div className="px-4 pb-4 space-y-3">
                {pendingApps.map((app) => (
                  <div key={app.id} className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{app.users?.full_name || 'Doctor Applicant'}</p>
                      <p className="text-xs text-bloom-700 font-semibold mt-0.5">{app.specialty} · {app.experience_years} Years Experience</p>
                      <p className="text-[10px] text-slate-400 font-mono">License: {app.license_number}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewDoctor(app.id, 'rejected')}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 font-bold text-[11px] hover:bg-red-50 flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleReviewDoctor(app.id, 'approved')}
                        className="px-4 py-1.5 rounded-xl bg-[#5b21b6] text-white font-extrabold text-[11px] hover:bg-[#4c1d95] flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve Doctor
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
            <div
              key={u.id}
              onClick={() => handleSelectUser(u)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-bloom-100/50 flex items-center gap-3 hover:border-bloom-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-full bg-bloom-100 flex items-center justify-center shrink-0 overflow-hidden">
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-bloom-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#5b21b6] transition-colors">
                    {u.full_name || 'Unnamed User'}
                  </p>
                  {u.role === 'doctor' && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Doctor
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">{u.email}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                u.role === 'doctor' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                u.role === 'admin' ? 'bg-bloom-100 text-bloom-800 border border-bloom-200' :
                'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {u.role}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectUser(u);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-bloom-100 text-[#5b21b6] font-bold text-xs transition-colors shrink-0"
              >
                View Profile
              </button>

              {u.role !== 'admin' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser(u.id, u.full_name || u.email);
                  }}
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

      {/* Selected User Profile & Verify Doctor Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 space-y-5 max-h-[90vh] overflow-y-auto scrollbar-hide">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-bloom-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedUser.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-bloom-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{selectedUser.full_name || 'User Profile'}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Account Role:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedUser.role === 'doctor' ? 'bg-emerald-100 text-emerald-800' :
                  selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Doctor Status:</span>
                {selectedUser.role === 'doctor' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Active Doctor
                  </span>
                ) : (
                  <span className="text-slate-500 font-semibold">Standard Patient</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Member Since:</span>
                <span className="text-slate-700 font-bold">
                  {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>

            {/* Success Toast */}
            {verifySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{verifySuccess}</span>
              </div>
            )}

            {/* Doctor Verification Form (If not already a Doctor) */}
            {selectedUser.role !== 'doctor' ? (
              <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-xs border-b border-purple-100 pb-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>Verify User as Medical Doctor</span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Promote this user to a Verified Doctor. This grants them access to the Doctor Portal, patient scheduling, and direct consultations.
                </p>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medical Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Obstetrics & Gynecology (OB/GYN)"
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-bloom-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-bloom-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">License Number</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-bloom-300"
                    />
                  </div>
                </div>

                <button
                  disabled={verifyingDoctor}
                  onClick={handleVerifyDoctor}
                  className="w-full h-11 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {verifyingDoctor ? 'Verifying Doctor...' : `Verify ${selectedUser.full_name || 'User'} as Doctor`}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">{selectedUser.full_name || 'User'} is a Verified Doctor</h4>
                <p className="text-xs text-emerald-700 font-medium">
                  This user has active doctor permissions and can receive patient consultation bookings.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 h-10 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedUser.role !== 'admin' && (
                <button
                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.full_name || selectedUser.email)}
                  className="px-4 h-10 border border-red-200 text-red-600 hover:bg-red-50 rounded-full text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete User
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
