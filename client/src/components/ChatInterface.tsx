import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Smile, Paperclip, Image, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../services/socket';
import { ChatMessage } from './ChatMessage';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { AudioRecorder } from './AudioRecorder';

interface ChatInterfaceProps {
  supporterId: string;
  supporterAlias: string;
  onBack: () => void;
}

export function ChatInterface({ supporterId, supporterAlias, onBack }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuthStore();
  const { startSession, sendMessage, currentSessionId, activeSessions } = useChatStore();
  const socket = useSocketStore();

  useEffect(() => {
    if (user && !currentSessionId) {
      startSession(user.id, supporterId);
      // Connect to socket and request match
      // socket.connect(user.alias, false);
      
    }
    if(user){
      socket.join(user.alias, user.isMentor);
      
      setTimeout(() => {
        socket.requestMatch(supporterAlias !== "SupportiveFriend");
      }, 3000);
    }
    

    return () => {
      console.log('leave match')
      socket.leavetMatch();
    };
  }, [supporterId, currentSessionId, startSession]);

  useEffect(() => {
    const { socket } = useSocketStore.getState();
    if (socket) {
      socket.on('message', ({ from, content, type, audioUrl, alias }) => {
        console.log("message",content)
        useChatStore.getState().addMessage({
          id: Math.random().toString(36).substring(7),
          content,
          senderId: 'supporter',
          timestamp: new Date(),
          type: type || 'text',
          audioUrl
        });
      });
      return () => {
        socket.off('message', ()=>{});
      };
    }
    
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showEmojiPicker &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.EmojiPickerReact')
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const currentSession = activeSessions.find(session => session.id === currentSessionId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const handleAudioSubmit = async (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    sendMessage('Audio message', 'audio', audioUrl);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold">
              {socket.partnerAlias || supporterAlias}
            </h2>
            <p className="text-sm text-green-500">
              {socket.isConnected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {socket.activeUsers.total} online ({socket.activeUsers.mentors} mentors)
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {currentSession?.messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <ChatTypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t relative">
        <div className="flex items-center space-x-2">
          <AudioRecorder onAudioSubmit={handleAudioSubmit} />
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 px-4 py-2"
          />
          <button
            type="button"
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 relative"
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

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2">
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                width={320}
                height={400}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}