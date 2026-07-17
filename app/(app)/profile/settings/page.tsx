'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { GradientButton } from '@/components/shebloom';
import { ArrowLeft, Key, Mail, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updates: any = {};
      
      // Update email if changed
      if (email !== user?.email) {
        updates.email = email;
      }
      
      // Update password if provided
      if (password) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        updates.password = password;
      }

      if (Object.keys(updates).length === 0) {
        setMessage({ type: 'success', text: 'No changes made.' });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Credentials updated successfully! If you changed your email, you may need to verify it.' });
      setPassword(''); // Clear password field
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-slate-100">
        <Link href="/profile" className="text-slate-600 hover:text-bloom-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Account Settings</h1>
      </header>

      <main className="max-w-[414px] mx-auto px-6 py-8">
        
        {message && (
          <div className={`mb-6 rounded-2xl p-4 text-sm leading-relaxed border shadow-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Change Credentials</h2>
          
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-2xl border-0 bg-slate-50 pl-11 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-bloom-300"
                  placeholder="sara@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-2xl border-0 bg-slate-50 pl-11 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-bloom-300"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            <GradientButton type="submit" className="mt-2" disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </GradientButton>
          </form>
        </div>

        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-white border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors shadow-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>

      </main>
    </div>
  );
}
