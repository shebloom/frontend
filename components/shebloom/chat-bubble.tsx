import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  content: ReactNode;
  timestamp?: string;
  sender: 'incoming' | 'outgoing';
  avatarUrl?: string;
  senderName?: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
  className?: string;
}

export function ChatBubble({ message, className }: ChatBubbleProps) {
  const isIncoming = message.sender === 'incoming';

  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isIncoming ? 'justify-start' : 'justify-end',
        className,
      )}
    >
      {/* Avatar (incoming only) */}
      {isIncoming && message.avatarUrl && (
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bloom-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.avatarUrl}
            alt={message.senderName ?? 'Avatar'}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-1',
          isIncoming ? 'items-start' : 'items-end',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isIncoming
              ? 'bg-bloom-100 text-slate-700 rounded-tl-md'
              : 'bg-bloom-gradient text-white rounded-tr-md shadow-bloom-btn',
          )}
        >
          {message.content}
        </div>
        {message.timestamp && (
          <span className="px-1 text-[10px] text-slate-400">
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
