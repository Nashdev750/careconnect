import { create } from 'zustand';
import { ChatSession, Message } from '../types';
import { useSocketStore } from '../services/socket';

interface ChatState {
  activeSessions: ChatSession[];
  currentSessionId: string | null;
  startSession: (userId: string, supporterId: string) => void;
  sendMessage: (content: string, type?: 'text' | 'audio', audioUrl?: string) => void;
  endSession: (sessionId: string) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeSessions: [],
  currentSessionId: null,

  startSession: (userId: string, supporterId: string) => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(7),
      userId,
      supporterId,
      messages: [],
      status: 'active'
    };

    set(state => ({
      activeSessions: [...state.activeSessions, newSession],
      currentSessionId: newSession.id
    }));
  },

  sendMessage: (content: string, type: 'text' | 'audio' = 'text', audioUrl?: string) => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      content,
      senderId: 'user',
      timestamp: new Date(),
      type,
      audioUrl
    };

    // Add message to local state
    set(state => ({
      activeSessions: state.activeSessions.map(session =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage]
            }
          : session
      )
    }));

    // Send message through socket
    useSocketStore.getState().sendMessage(content+"_"+newMessage.id, type, audioUrl);
  },

  addMessage: (message: Message) => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;
    const messageId = message.content.split('_')[1];
    const session = get().activeSessions.find(session => session.id === currentSessionId);
    const messageExists = session?.messages.some(msg => msg.id === messageId);
    if(messageExists) return
    message.content = message.content.split('_')[0]
    message.id = message.content.split('_')[1]

 
    set(state => ({
      activeSessions: state.activeSessions.map(session =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, message]
            }
          : session
      )
    }));
  },

  endSession: (sessionId: string) => {
    useSocketStore.getState().disconnect();
    set(state => ({
      activeSessions: state.activeSessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'ended' }
          : session
      ),
      currentSessionId: null
    }));
  }
}));