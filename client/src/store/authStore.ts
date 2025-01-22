import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (alias: string, email: string, isMentor:boolean) => void;
  loginAsGuest: (isMentor:boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  login: (alias, email, isMentor) => {
    const user: User = {
      id: Math.random().toString(36).substring(7),
      alias,
      email,
      isGuest: false,
      isMentor
    };
    set({ user });
  },
  loginAsGuest: (isMentor) => {
    const user: User = {
      id: Math.random().toString(36).substring(7),
      alias: `Guest_${Math.floor(Math.random() * 1000)}`,
      email:"",
      isGuest: true,
      isMentor
    };
    set({ user });
  },
  logout: () => set({ user: null }),
}));