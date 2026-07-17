'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Plus, Users, X, Send, Trash2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

const topics = ['All', 'Pregnancy', 'PCOS', 'IVF', 'Motherhood'] as const;
type Topic = (typeof topics)[number];

export default function CommunityPage() {
  const { profile } = useAuth();
  const [activeTopic, setActiveTopic] = useState<Topic>('All');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Modal / Drawer state
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTopic, setNewTopic] = useState<Topic>('Pregnancy');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Comment Detail Drawer state
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [activeTopic]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const topicParam = activeTopic !== 'All' ? `?topic=${activeTopic}` : '';
      const res = await apiFetch(`/community/posts${topicParam}`);
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmittingPost(true);
    try {
      await apiFetch('/community/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          topic: newTopic
        })
      });
      setIsNewPostOpen(false);
      setNewTitle('');
      setNewContent('');
      loadPosts();
    } catch (err) {
      alert('Failed to share post. Please try again!');
    } finally {
      setSubmittingPost(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const res = await apiFetch(`/community/posts/${postId}/like`, {
        method: 'POST'
      });
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (res.liked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      // Refresh count locally
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes: res.liked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  // Comments drawer trigger
  const openComments = async (post: any) => {
    setSelectedPost(post);
    try {
      const res = await apiFetch(`/community/posts/${post.id}`);
      setComments(res.comments || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;
    setSubmittingComment(true);
    try {
      const res = await apiFetch(`/community/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment })
      });
      setComments([...comments, res.comment]);
      setNewComment('');
      // Update count locally
      setPosts(posts.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, comments: (p.comments || 0) + 1 };
        }
        return p;
      }));
    } catch (err) {
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // ADMIN CONTROL: Deactivate post (take down)
  const handleTakeDownPost = async (postId: string) => {
    if (!confirm('Are you sure you want to take down this post for violating community guidelines?')) return;
    try {
      await apiFetch(`/admin/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: false })
      });
      setPosts(posts.filter(p => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
      alert('Post has been successfully taken down.');
    } catch (err) {
      alert('Failed to take down post');
    }
  };

  // ADMIN CONTROL: Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await apiFetch(`/admin/comments/${commentId}`, {
        method: 'DELETE'
      });
      setComments(comments.filter(c => c.id !== commentId));
      // Update count locally
      setPosts(posts.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, comments: Math.max(0, (p.comments || 0) - 1) };
        }
        return p;
      }));
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-full pb-28 relative">
      {/* Header */}
      <header className="bg-bloom-header px-5 pb-4 pt-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-bloom-600" />
          <h1 className="text-xl font-extrabold text-slate-800 leading-tight">Community</h1>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">You are not alone · Join our discussions 💜</p>

        {/* Topic filters - flex-wrap, no scrollbar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTopic(t)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                activeTopic === t
                  ? 'bg-bloom-gradient text-white shadow-bloom-btn'
                  : 'bg-white text-slate-500 border border-bloom-100/60 hover:bg-bloom-50',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Posts list */}
      <section className="px-5 pt-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs font-medium text-slate-400">Loading conversations...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center text-xs font-medium text-slate-400 border border-bloom-100">
            No discussions in this topic yet. Be the first to start one!
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            return (
              <div key={post.id} className="rounded-3xl bg-white p-4 shadow-bloom-card border border-bloom-100/60">
                {/* Author row */}
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-bloom-100 flex items-center justify-center font-bold text-xs text-bloom-600">
                    {post.users?.avatar_url ? (
                      <img src={post.users.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      post.users?.full_name?.charAt(0).toUpperCase() || 'M'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{post.users?.full_name || 'Anonymous'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Topic badge */}
                  <span className="rounded-full bg-bloom-50 px-2 py-0.5 text-[9px] font-bold text-bloom-600">
                    {post.topic}
                  </span>

                  {/* Admin Take Down */}
                  {isAdmin && (
                    <button
                      onClick={() => handleTakeDownPost(post.id)}
                      className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-lg transition"
                      title="Take Down Post"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Body Content */}
                <h3 className="mt-2.5 text-sm font-bold text-slate-700 leading-snug">{post.title}</h3>
                {post.content && (
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed truncate">{post.content}</p>
                )}

                {/* Actions bottom */}
                <div className="mt-3.5 flex items-center gap-4 border-t border-bloom-50 pt-2.5">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-petal-500 font-bold"
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4 transition',
                        isLiked ? 'fill-petal-500 text-petal-500 scale-110' : 'text-slate-300',
                      )}
                    />
                    <span className={isLiked ? 'text-petal-600' : ''}>
                      {post.likes || 0}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => openComments(post)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-bloom-600 font-bold"
                  >
                    <MessageCircle className="h-4 w-4 text-slate-300" />
                    <span>{post.comments || 0}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Floating Create FAB */}
      <button
        onClick={() => setIsNewPostOpen(true)}
        className="fixed bottom-24 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-bloom-gradient text-white shadow-bloom-btn transition hover:brightness-105 active:scale-95 z-20"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* NEW POST MODAL - fixed position so it works even when scrolled */}
      {isNewPostOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="w-full max-w-[414px] bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-bloom-50 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Start a Conversation</h3>
              <button onClick={() => setIsNewPostOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-2">Select Topic</label>
                <div className="flex flex-wrap gap-2">
                  {topics.filter(t => t !== 'All').map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTopic(t as any)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold transition-all border',
                        newTopic === t
                          ? 'bg-bloom-gradient text-white border-transparent shadow-bloom-btn'
                          : 'bg-white text-slate-500 border-bloom-100 hover:bg-bloom-50'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Title / Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tips to improve egg quality naturally?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs focus:ring-bloom-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Details (Optional)</label>
                <textarea
                  placeholder="Write a brief explanation..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-20 rounded-xl border border-slate-200 p-3 text-xs focus:ring-bloom-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPost}
                className="w-full h-11 bg-bloom-gradient rounded-full text-xs font-bold text-white shadow-bloom-btn disabled:opacity-75"
              >
                {submittingPost ? 'Posting...' : 'Post to Community'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMMENTS DRAWER / OVERLAY */}
      {selectedPost && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="w-full bg-white rounded-t-3xl max-h-[80%] flex flex-col animate-in slide-in-from-bottom duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-bloom-50 flex items-start justify-between">
              <div className="min-w-0 pr-4">
                <span className="text-[9px] font-bold text-bloom-600 bg-bloom-50 rounded-full px-2 py-0.5">
                  {selectedPost.topic}
                </span>
                <h4 className="font-bold text-slate-800 text-xs mt-1.5 leading-snug">{selectedPost.title}</h4>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[200px]">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Comments ({comments.length})</p>
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No answers yet. Share your thoughts below!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-2xl p-3 border border-bloom-100/50 shadow-sm flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-bloom-100 flex items-center justify-center font-bold text-[10px] text-bloom-600 shrink-0">
                      {comment.users?.full_name?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800">{comment.users?.full_name || 'Anonymous'}</span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 p-0.5 hover:bg-red-50 rounded"
                            title="Delete Comment"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-bloom-100 bg-white flex gap-2 items-center">
              <input
                type="text"
                required
                placeholder="Write a support reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs focus:ring-bloom-300 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="h-10 w-10 shrink-0 rounded-xl bg-bloom-600 flex items-center justify-center text-white hover:bg-bloom-700 active:scale-95 transition"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
