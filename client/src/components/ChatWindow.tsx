import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

interface ChatWindowProps {
  supporterId: string;
  supporterAlias: string;
  onClose: () => void;
}

export function ChatWindow({ supporterId, supporterAlias, onClose }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { startSession, sendMessage, currentSessionId, activeSessions, endSession } = useChatStore();

  useEffect(() => {
    if (user && !currentSessionId) {
      startSession(user.id, supporterId);
    }
  }, [user, supporterId, currentSessionId, startSession]);

  const currentSession = activeSessions.find(session => session.id === currentSessionId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleClose = () => {
    if (currentSessionId) {
      endSession(currentSessionId);
    }
    onClose();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-rose-500 text-white rounded-t-lg">
        <h3 className="font-semibold">Chat with {supporterAlias}</h3>
        <button onClick={handleClose} className="hover:text-gray-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSession?.messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.senderId === 'user'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="bg-rose-500 text-white rounded-md px-4 py-2 hover:bg-rose-600"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}