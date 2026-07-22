'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Trash2,
  Video,
  Layers,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function AdminWellnessCrudPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  const [conditions, setConditions] = useState<any[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Category Form State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [catTitle, setCatTitle] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // New Video Form State
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [vidTitle, setVidTitle] = useState('');
  const [vidDesc, setVidDesc] = useState('');
  const [vidDuration, setVidDuration] = useState('20 min');
  const [vidUrl, setVidUrl] = useState('');
  const [vidThumb, setVidThumb] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && profile?.role !== 'admin') {
      router.replace('/home');
    }
  }, [isLoading, profile, router]);

  const loadConditions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/wellness/conditions');
      const list = res.conditions || [];
      setConditions(list);
      if (list.length > 0 && !selectedCondition) {
        setSelectedCondition(list[0]);
      } else if (selectedCondition) {
        const updated = list.find((c: any) => c.id === selectedCondition.id);
        if (updated) setSelectedCondition(updated);
      }
    } catch (err) {
      console.error('Failed to load conditions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadConditions();
    }
  }, [profile]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle.trim()) return;
    setSubmitting(true);

    try {
      await apiFetch('/wellness/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          title: catTitle.trim(),
          description: catDesc.trim(),
        }),
      });
      setShowAddCategoryModal(false);
      setCatTitle('');
      setCatDesc('');
      setActionSuccess('Created new condition category');
      setTimeout(() => setActionSuccess(null), 3000);
      loadConditions();
    } catch (err) {
      alert('Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCondition || !vidTitle.trim() || !vidUrl.trim()) return;
    setSubmitting(true);

    try {
      await apiFetch('/wellness/admin/videos', {
        method: 'POST',
        body: JSON.stringify({
          condition_id: selectedCondition.id,
          title: vidTitle.trim(),
          description: vidDesc.trim(),
          duration: vidDuration.trim(),
          video_url: vidUrl.trim(),
          thumbnail_url: vidThumb.trim() || undefined,
        }),
      });
      setShowAddVideoModal(false);
      setVidTitle('');
      setVidDesc('');
      setVidUrl('');
      setActionSuccess('Added video class to playlist');
      setTimeout(() => setActionSuccess(null), 3000);
      loadConditions();
    } catch (err) {
      alert('Failed to add video class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to remove this video class?')) return;
    try {
      await apiFetch(`/wellness/admin/videos/${videoId}`, {
        method: 'DELETE',
      });
      setActionSuccess('Video class removed');
      setTimeout(() => setActionSuccess(null), 3000);
      loadConditions();
    } catch (err) {
      alert('Failed to delete video');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-panel"
              className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 font-playfair">Yoga Condition & Video CRUD</h1>
              <p className="text-xs text-slate-500 font-medium">Manage Condition Categories & External Hosted Video Playlists</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="h-9 px-3 bg-[#5b21b6] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-3.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Categories List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Condition Categories ({conditions.length})</h2>
            
            {conditions.map((cat) => {
              const isSelected = selectedCondition?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCondition(cat)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5b21b6] text-white border-[#5b21b6] shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <h3 className="font-bold text-sm font-playfair">{cat.title}</h3>
                  <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                    {cat.description}
                  </p>
                  <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-semibold">
                    <span>{cat.video_count || cat.videos?.length || 0} Classes</span>
                    <span>Select Category →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Video Playlist CRUD for Selected Category */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            
            {selectedCondition ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#5b21b6] uppercase tracking-wider">Selected Category</span>
                    <h2 className="text-xl font-bold text-slate-900 font-playfair">{selectedCondition.title}</h2>
                  </div>

                  <button
                    onClick={() => setShowAddVideoModal(true)}
                    className="h-9 px-3.5 bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add Video Class
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-700">Video Playlist Classes</h3>

                  {(selectedCondition.videos || []).length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 font-medium">
                      No video classes in this playlist yet. Click "Add Video Class" to add one.
                    </div>
                  ) : (
                    (selectedCondition.videos || []).map((vid: any, idx: number) => (
                      <div key={vid.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5b21b6] flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{vid.title}</h4>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">{vid.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold">
                              <span>Duration: {vid.duration}</span>
                              <span>•</span>
                              <span className="truncate max-w-[200px]">Host: {vid.video_url}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="h-8 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">Select a category on the left to view and manage its video playlist.</p>
            )}

          </div>

        </div>

      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 font-playfair">Add Condition Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={catTitle}
                  onChange={e => setCatTitle(e.target.value)}
                  placeholder="e.g. Yoga for Endometriosis"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={e => setCatDesc(e.target.value)}
                  placeholder="Evidence-based yoga sequences tailored for..."
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="w-1/2 h-10 text-slate-500 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 h-10 bg-[#5b21b6] text-white font-bold rounded-xl"
                >
                  {submitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Class Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 font-playfair">Add Video Class to {selectedCondition?.title}</h3>
            <form onSubmit={handleCreateVideo} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  value={vidTitle}
                  onChange={e => setVidTitle(e.target.value)}
                  placeholder="e.g. Class 4: Pelvic Lymphatic Drainage"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Duration</label>
                <input
                  type="text"
                  value={vidDuration}
                  onChange={e => setVidDuration(e.target.value)}
                  placeholder="e.g. 25 min"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              {/* DEDICATED PROMINENT VIDEO FILE UPLOAD BOX */}
              <div className="p-4 bg-purple-50/70 rounded-2xl border-2 border-dashed border-purple-200 text-center space-y-2">
                <label className="block text-[11px] font-extrabold text-[#5b21b6] uppercase tracking-wider">
                  1. Upload Prerecorded Video File (Required)
                </label>

                <input
                  type="file"
                  id="adminVideoFile"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const objectUrl = URL.createObjectURL(file);
                      setVidUrl(objectUrl);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => document.getElementById('adminVideoFile')?.click()}
                  className="w-full py-3 px-4 bg-white hover:bg-purple-100 text-[#5b21b6] border border-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs group"
                >
                  <Video className="w-4 h-4 text-[#5b21b6] group-hover:scale-110 transition-transform" />
                  <span>{vidUrl ? '✓ Video File Uploaded! Click to Change' : '📁 Click to Choose Prerecorded Video File (.mp4 / .mov)'}</span>
                </button>

                {vidUrl && (
                  <div className="pt-2 space-y-1.5 text-left">
                    <span className="text-[10px] font-extrabold text-[#5b21b6] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ▶ Video Confirmation Preview
                    </span>
                    <video
                      controls
                      src={vidUrl}
                      className="w-full h-40 object-cover rounded-xl border border-purple-300 bg-black shadow-xs"
                    />
                    <p className="text-[9px] text-slate-500 font-bold text-center">
                      Play the video above to verify before saving this session.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-purple-100/80">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                    Or Paste Cloudinary Stream URL Directly
                  </label>
                  <input
                    type="text"
                    required
                    value={vidUrl}
                    onChange={e => setVidUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/shebloom/video/upload/pcos_class.mp4"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium text-slate-800 text-[11px] focus:outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={vidDesc}
                  onChange={e => setVidDesc(e.target.value)}
                  placeholder="Focuses on gentle hip openings and deep breathing..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
                  className="w-1/2 h-10 text-slate-500 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 h-10 bg-[#5b21b6] text-white font-bold rounded-xl"
                >
                  {submitting ? 'Adding...' : 'Add Video Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
