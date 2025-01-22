import React, { useEffect } from 'react';
import { Message } from '../types';
import { format } from 'date-fns';
import { AudioMessage } from './AudioMessage';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.senderId === 'user';

  useEffect(() => {
    return () => {
      // Cleanup audio URL when component unmounts
      if (message.type === 'audio' && message.audioUrl) {
        URL.revokeObjectURL(message.audioUrl);
      }
    };
  }, [message]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] group relative`}>
        <div
          className={`rounded-2xl p-3 ${
            isUser
              ? 'bg-rose-500 text-white rounded-br-none'
              : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
          }`}
        >
          {message.type === 'audio' && message.audioUrl ? (
            <AudioMessage audioUrl={message.audioUrl} />
          ) : (
            message.content
          )}
        </div>
        <span className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'} block opacity-0 group-hover:opacity-100 transition-opacity`}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}