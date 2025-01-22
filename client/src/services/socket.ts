import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  partnerId: string | null;
  partnerAlias: string | null;
  isPartnerMentor: boolean;
  activeUsers: {
    total: number;
    mentors: number;
    mentees: number;
  };
  connect: (alias: string, isMentor: boolean) => void;
  disconnect: () => void;
  join: (alias: string, isMentor: boolean) => void;
  sendMessage: (content: string, type?: 'text' | 'audio', audioUrl?: string) => void;
  requestMatch: (preferMentor: boolean) => void;
  leavetMatch: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  partnerId: null,
  partnerAlias: null,
  isPartnerMentor: false,
  activeUsers: {
    total: 0,
    mentors: 0,
    mentees: 0,
  },

  connect: (alias: string, isMentor: boolean) => {
    const { socket:oldsocket, isConnected } = get();
    // Check if socket already exists and is connected
    if (oldsocket && isConnected) {
        console.log("Already connected");
        return; // Exit if already connected
    }

    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      set({ isConnected: true });
      // socket.emit('join', { alias, isMentor });
    });

    socket.on('joined', ({ id }) => {
      console.log('Joined with ID:', id);
    });

    socket.on('matched', ({ partnerId, partnerAlias, isMentor }) => {
      console.log("matched")
      set({
        partnerId,
        partnerAlias,
        isPartnerMentor: isMentor,
      });
    });

    socket.on('partner_left', () => {
      set({
        partnerId: null,
        partnerAlias: null,
        isPartnerMentor: false,
      });
    });

    socket.on('active_users_count', (counts) => {
      set({ activeUsers: counts });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    set({ socket });
  },

  join: (alias, isMentor) => {
    const { socket } = get();
    console.log("request join",socket)
    if (socket) {
      socket.emit('join', { alias, isMentor });
    }
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        partnerId: null,
        partnerAlias: null,
        isPartnerMentor: false,
      });
    }
  },

  sendMessage: (content: string, type = 'text', audioUrl?: string) => {
    const { socket, partnerId } = get();
    if (socket && partnerId) {
      socket.emit('message', {
        to: partnerId,
        content,
        type,
        audioUrl,
      });
    }
  },

  requestMatch: (preferMentor: boolean) => {
    const { socket } = get();
    console.log("request match",socket)
    if (socket) {
      socket.emit('request_match', { preferMentor });
      console.log("request match")
    }
  },
  leavetMatch: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave_chat');
    }
  },
}));