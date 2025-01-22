export interface User {
  id: string;
  alias: string;
  email?: string;
  isGuest: boolean;
  isMentor: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'audio';
  audioUrl?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  supporterId: string;
  messages: Message[];
  status: 'active' | 'ended';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'assessment';
  category: string;
  url: string;
  thumbnail?: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  createdBy: string;
  createdAt: Date;
  messages: Message[];
  members: string[];
}

export interface GroupMessage extends Message {
  senderAlias: string;
}