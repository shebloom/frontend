'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, Video, Paperclip, Image as ImageIcon, X, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  created_at: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Call state
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  // Load messages
  const loadMessages = async () => {
    try {
      const data = await apiFetch(`/chat/messages/${conversationId}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  // Load conversation details
  useEffect(() => {
    loadMessages();

    // Poll for new messages every 3s
    pollRef.current = setInterval(loadMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Clean up call on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await apiFetch('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: conversationId,
          content: input.trim(),
        }),
      });
      setInput('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await apiFetch('/chat/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversation_id: conversationId,
            content: `📎 ${file.name}`,
            attachment_url: base64,
          }),
        });
        await loadMessages();
        setSending(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to send attachment', err);
      setSending(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── WebRTC Calling ──────────────────────────────────────────────────────
  const startCall = async (type: 'voice' | 'video') => {
    setCallType(type);
    setCallActive(true);
    setCallDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('Could not access your camera/microphone. Please check permissions.');
      setCallActive(false);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallActive(false);
    setCallDuration(0);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="absolute inset-x-0 top-0 bottom-[80px] flex flex-col bg-lavender-100">
      {/* Call Overlay */}
      {callActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-bloom-900">
          {callType === 'video' ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-24 right-4 h-36 w-28 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
              />
            </>
          ) : (
            <>
              <div className="h-24 w-24 rounded-full bg-bloom-200 flex items-center justify-center mb-6">
                <Phone className="h-10 w-10 text-bloom-700" />
              </div>
              <h3 className="text-xl font-bold text-white">Voice Call</h3>
              <p className="text-sm text-white/60 mt-1">Connected</p>
            </>
          )}

          <p className="mt-4 text-2xl font-mono text-white/80 tracking-widest">
            {formatDuration(callDuration)}
          </p>

          <button
            onClick={endCall}
            className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition active:scale-90"
          >
            <PhoneOff className="h-7 w-7" />
          </button>
        </div>
      )}

      {/* Chat header */}
      <header className="flex items-center gap-3 border-b border-bloom-100 bg-white px-4 py-3 shadow-bloom-card z-10">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bloom-50"
        >
          <ArrowLeft className="h-5 w-5 text-bloom-700" />
        </button>

        <div className="h-10 w-10 overflow-hidden rounded-full bg-bloom-100 shrink-0">
          <div className="h-full w-full bg-bloom-200 flex items-center justify-center text-bloom-600 font-bold text-sm">
            Dr
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-800">Doctor</h2>
          <p className="flex items-center gap-1 text-xs text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Online
          </p>
        </div>

      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-lavender-100 px-4 py-4 scrollbar-hide">
        <div className="flex justify-center">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-400 shadow-sm">
            Today
          </span>
        </div>

        {loading ? (
          <p className="text-center text-xs text-slate-400 py-8">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-8">No messages yet. Say hello! 👋</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    isMe
                      ? 'bg-bloom-gradient text-white rounded-tr-md shadow-bloom-btn'
                      : 'bg-white text-slate-700 rounded-tl-md shadow-bloom-card',
                  )}
                >
                  {/* Attachment preview */}
                  {msg.attachment_url && (
                    <div className="mb-2">
                      {msg.attachment_url.startsWith('data:image') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.attachment_url}
                          alt="attachment"
                          className="rounded-xl max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            const w = window.open();
                            if (w) w.document.write('<img src="' + msg.attachment_url + '" style="max-width:100%"/>');
                          }}
                        />
                      ) : (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex items-center gap-1.5 text-xs font-medium underline',
                            isMe ? 'text-white/90' : 'text-bloom-600'
                          )}
                        >
                          <Paperclip className="h-3 w-3" /> View Attachment
                        </a>
                      )}
                    </div>
                  )}
                  {msg.content && <span>{msg.content}</span>}
                  <span className={cn('mt-1 block text-[10px]', isMe ? 'text-white/70' : 'text-slate-400')}>
                    {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-bloom-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bloom-50 hover:bg-bloom-100 transition"
          >
            <Paperclip className="h-5 w-5 text-bloom-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleSendAttachment}
          />
          <div className="flex flex-1 items-center rounded-full border border-bloom-100 bg-lavender-50 px-4 py-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bloom-gradient text-white shadow-bloom-btn transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
