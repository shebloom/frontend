'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  X,
  Send,
  Paperclip,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  attachment_url?: string | null;
  created_at: string;
}

// Prohibited content keywords for medical & community safety guidelines
const PROHIBITED_KEYWORDS = [
  'kill', 'suicide', 'self harm', 'bomb', 'weapon', 'illegal drug',
  'nude', 'porn', 'nsfw', 'hate speech', 'curse', 'threat', 'abuse'
];

export function FloatingAiChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Load existing AI conversation if user is logged in
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initAiChat = async () => {
        try {
          const res = await apiFetch('/chat/conversations', {
            method: 'POST',
            body: JSON.stringify({ recipientId: 'ai' }),
          });
          if (res.conversation) {
            setConversationId(res.conversation.id);
            const msgRes = await apiFetch(`/chat/messages/${res.conversation.id}`);
            if (msgRes.messages && msgRes.messages.length > 0) {
              setMessages(msgRes.messages);
            } else {
              // Initial welcome message
              setMessages([
                {
                  id: 'welcome-1',
                  sender_id: '00000000-0000-0000-0000-0000000000a1',
                  content: `Hello! 👋 I am your SheBloom 24/7 AI Health Assistant.\n\nI can answer general questions about menstrual cycles, PCOS, thyroid, and women's reproductive health. You can also upload photos or reports for general education.\n\n*Note: I provide general educational information only and cannot provide medical diagnoses or prescriptions.*`,
                  created_at: new Date().toISOString(),
                },
              ]);
            }
          }
        } catch (err) {
          // Fallback welcome message for unauthenticated guests
          setMessages([
            {
              id: 'welcome-guest',
              sender_id: '00000000-0000-0000-0000-0000000000a1',
              content: `Hello! 👋 I am your 24/7 AI Health Assistant.\n\nAsk me any general question about women's health, period cramps, PCOS, or cycle tracking.\n\n*Note: This response is for educational purposes only.*`,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
      initAiChat();
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSafetyError('⚠️ File size limit exceeded. Please upload files under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment(reader.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSafetyError(null);

    const userText = input.trim();
    if (!userText && !attachment) return;

    // Guideline & Content Moderation Filter
    const lowerText = userText.toLowerCase();
    const hasViolation = PROHIBITED_KEYWORDS.some(kw => lowerText.includes(kw));

    if (hasViolation) {
      setSafetyError(
        '⚠️ Content Warning: Your message contains terms that violate SheBloom Health & Safety Guidelines. Please keep questions focused on general women’s wellness.'
      );
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender_id: 'user',
      content: userText ? userText : (attachmentName ? `[Attached File: ${attachmentName}]` : null),
      attachment_url: attachment,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentAttachment = attachment;
    const currentName = attachmentName;
    setAttachment(null);
    setAttachmentName(null);
    setLoading(true);

    try {
      const promptText = userText + (currentName ? ` (User attached image/report: ${currentName})` : '');
      const res = await apiFetch('/chat/ai/message', {
        method: 'POST',
        body: JSON.stringify({ content: promptText }),
      });

      if (res.aiMessage) {
        setMessages(prev => [...prev, res.aiMessage]);
      } else {
        throw new Error('No AI response');
      }
    } catch (err) {
      // Fallback AI response for guests or connectivity issues
      const fallbackAiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender_id: '00000000-0000-0000-0000-0000000000a1',
        content: `Thank you for sharing. For general educational guidance:\n\n• **Cycle & Hormones**: Fluctuation in cycle length or symptoms is often connected to stress, sleep, or nutrition.\n• **General Care**: Stay hydrated, engage in gentle pelvic yoga, and log symptoms.\n\n*Note: This AI response is for general informational purposes only and is not a substitute for a real medical consultation.*`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ICON BUTTON AT BOTTOM-RIGHT CORNER */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-tr from-[#5b21b6] via-[#7c3aed] to-[#9d174d] text-white shadow-[0_8px_25px_rgba(91,33,182,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group border-2 border-white"
          title="Open 24/7 AI Health Assistant"
        >
          <div className="relative">
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-400 border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-400 border-2 border-white" />
          </div>
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            24/7 AI Health Assistant
          </span>
        </button>
      )}

      {/* FLOATING AI CHATBOT DIALOG / WINDOW */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-20 sm:left-auto sm:right-4 sm:w-[380px] h-[520px] max-h-[80vh] z-50 bg-white rounded-[32px] shadow-2xl border border-purple-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5b21b6] via-[#6d28d9] to-[#7c3aed] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm font-playfair">AI Health Assistant</h3>
                  <span className="text-[8px] font-black uppercase bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
                    24/7
                  </span>
                </div>
                <p className="text-[10px] text-purple-200 font-medium">Educational AI Guide • Open to All</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-purple-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Safety Error Banner */}
          {safetyError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold border-b border-red-100 flex items-start gap-2 shrink-0 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="flex-1">{safetyError}</span>
              <button onClick={() => setSafetyError(null)} className="text-red-500 hover:text-red-700 font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 scrollbar-hide text-xs">
            {messages.map((msg) => {
              const isAi = msg.sender_id === '00000000-0000-0000-0000-0000000000a1';
              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col', isAi ? 'items-start' : 'items-end')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-2xs space-y-2',
                      isAi
                        ? 'bg-white text-slate-800 border border-purple-100 rounded-tl-sm'
                        : 'bg-[#5b21b6] text-white rounded-tr-sm font-medium'
                    )}
                  >
                    {/* Attached Image/File preview */}
                    {msg.attachment_url && (
                      <div className="mb-2">
                        {msg.attachment_url.startsWith('data:image') ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={msg.attachment_url}
                            alt="Attachment"
                            className="rounded-xl max-h-36 object-cover border border-purple-200"
                          />
                        ) : (
                          <div className="p-2 bg-purple-50 text-purple-900 rounded-xl font-bold text-[11px] flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-[#5b21b6]" />
                            <span>File Attached</span>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.content && <div className="whitespace-pre-line">{msg.content}</div>}

                    {/* Book consultation button below AI message */}
                    {isAi && (
                      <div className="pt-2 border-t border-purple-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            router.push('/consult');
                          }}
                          className="w-full py-1.5 px-2.5 bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Stethoscope className="w-3 h-3" />
                          Book with Dr. Deepa Madhav
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs py-2">
                <div className="w-4 h-4 border-2 border-[#5b21b6] border-t-transparent rounded-full animate-spin" />
                <span>AI Assistant thinking...</span>
              </div>
            )}
          </div>

          {/* Attachment Preview Bar */}
          {attachment && (
            <div className="px-4 py-2 bg-purple-50 border-t border-purple-100 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-[#5b21b6] truncate max-w-[240px]">
                📎 {attachmentName || 'Image attached'}
              </span>
              <button
                type="button"
                onClick={() => { setAttachment(null); setAttachmentName(null); }}
                className="text-red-500 font-bold hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 rounded-2xl bg-slate-100 hover:bg-purple-50 text-slate-500 hover:text-[#5b21b6] flex items-center justify-center transition-colors shrink-0"
              title="Attach image or medical report"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask AI Assistant or upload report..."
              className="flex-1 h-10 rounded-2xl bg-slate-50 border border-slate-200 px-3.5 text-xs text-slate-900 focus:border-[#5b21b6] focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !attachment)}
              className="h-10 w-10 rounded-2xl bg-[#5b21b6] hover:bg-[#4c1d95] text-white flex items-center justify-center shadow-xs transition-all disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
