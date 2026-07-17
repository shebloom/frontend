'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { BloomLogo } from '@/components/shebloom';
import {
  FileText,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Plus,
  Edit2,
  Video,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminContentPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'programs'>('posts');

  // Program creation state
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [newProgram, setNewProgram] = useState({ title: '', description: '', category: 'Yoga', duration_weeks: 4 });

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
      const [postsRes, programsRes] = await Promise.all([
        apiFetch('/admin/posts'),
        apiFetch('/admin/programs'),
      ]);
      setPosts(postsRes.posts || []);
      setPrograms(programsRes.programs || []);
    } catch (err) {
      console.error('Admin content load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeratePost = async (postId: string, is_active: boolean) => {
    try {
      await apiFetch(`/admin/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active }),
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_active } : p));
    } catch (err) {
      alert('Failed to moderate post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Permanently delete this post? This cannot be undone.')) return;
    try {
      await apiFetch(`/admin/posts/${postId}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/programs', {
        method: 'POST',
        body: JSON.stringify(newProgram),
      });
      setPrograms([res.program, ...programs]);
      setShowProgramForm(false);
      setNewProgram({ title: '', description: '', category: 'Yoga', duration_weeks: 4 });
    } catch (err) {
      alert('Failed to create program');
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Permanently delete this program?')) return;
    try {
      await apiFetch(`/admin/programs/${programId}`, { method: 'DELETE' });
      setPrograms(prev => prev.filter(p => p.id !== programId));
    } catch (err) {
      alert('Failed to delete program');
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
              <h1 className="text-xl font-bold text-slate-800">Content Management</h1>
              <p className="text-xs text-slate-500 font-medium">Posts and Programs</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'posts' ? 'bg-bloom-50 text-bloom-700' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Community Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'programs' ? 'bg-bloom-50 text-bloom-700' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Programs ({programs.length})
          </button>
        </div>

        {activeTab === 'posts' ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${post.is_active ? 'border-bloom-100/50' : 'border-red-200 bg-red-50/10'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{post.title}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">By {post.users?.full_name} · Topic: {post.topic}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    post.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {post.is_active ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{post.content || '(No additional text)'}</p>
                
                <div className="mt-4 flex gap-2">
                  {post.is_active ? (
                    <button
                      onClick={() => handleModeratePost(post.id, false)}
                      className="px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-600 hover:bg-amber-50 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Hide Post
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModeratePost(post.id, true)}
                      className="px-3.5 py-1.5 rounded-xl border border-green-200 text-green-500 hover:bg-green-50 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Restore Post
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-[11px] font-bold flex items-center gap-1.5 ml-auto"
                  >
                    <Trash2 size={14} /> Delete Forever
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">No community posts found.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setShowProgramForm(!showProgramForm)}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-bloom-300 rounded-2xl text-bloom-600 font-bold hover:bg-bloom-50 transition-colors"
            >
              <Plus className="h-5 w-5" /> Add New Program
            </button>

            {showProgramForm && (
              <form onSubmit={handleCreateProgram} className="bg-white rounded-2xl p-5 shadow-sm border border-bloom-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Create Wellness Program</h3>
                <input
                  type="text"
                  placeholder="Program Title"
                  required
                  value={newProgram.title}
                  onChange={e => setNewProgram({ ...newProgram, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-bloom-300 outline-none"
                />
                <textarea
                  placeholder="Program Description"
                  required
                  value={newProgram.description}
                  onChange={e => setNewProgram({ ...newProgram, description: e.target.value })}
                  className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-bloom-300 outline-none resize-none"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Category</label>
                    <select
                      value={newProgram.category}
                      onChange={e => setNewProgram({ ...newProgram, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
                    >
                      <option>Yoga</option>
                      <option>Meditation</option>
                      <option>Nutrition</option>
                      <option>Fitness</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Duration (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newProgram.duration_weeks}
                      onChange={e => setNewProgram({ ...newProgram, duration_weeks: parseInt(e.target.value) || 1 })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowProgramForm(false)} className="px-4 py-2 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-bloom-600 text-white font-bold text-xs hover:bg-bloom-700">Save Program</button>
                </div>
              </form>
            )}

            {programs.map((prog) => (
              <div key={prog.id} className="bg-white rounded-2xl p-5 shadow-sm border border-bloom-100/50 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-petal-100 flex items-center justify-center shrink-0">
                  <Video className="h-5 w-5 text-petal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">{prog.title}</h3>
                  <p className="text-[10px] text-bloom-600 font-semibold mb-1">{prog.category} · {prog.duration_weeks} Weeks</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{prog.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteProgram(prog.id)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {programs.length === 0 && !showProgramForm && (
              <p className="text-center text-slate-400 text-sm py-8">No programs created yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
