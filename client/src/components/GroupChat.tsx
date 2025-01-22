import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { CommunityGroup, GroupMessage } from '../types';
import { useAuthStore } from '../store/authStore';
import { ChatMessage } from './ChatMessage';

interface GroupChatProps {
  group: CommunityGroup;
  onBack: () => void;
  onSendMessage: (message: GroupMessage) => void;
}

export function GroupChat({ group, onBack, onSendMessage }: GroupChatProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    const newMessage: GroupMessage = {
      id: Math.random().toString(36).substring(7),
      content: message.trim(),
      senderId: user.id,
      senderAlias: user.alias,
      timestamp: new Date(),
      type: 'text'
    };

    onSendMessage(newMessage);
    setMessage('');
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [group.messages]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <p className="text-sm text-gray-500">{group.memberCount} members</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {group.messages.map(msg => (
          <ChatMessage
            key={msg.id}
            message={{
              ...msg,
              content: `${(msg as GroupMessage).senderAlias}: ${msg.content}`
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t relative">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 px-4 py-2"
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className="bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              width={320}
              height={400}
            />
          </div>
        )}
      </form>
    </div>
  );
}