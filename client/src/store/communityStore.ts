import { create } from 'zustand';
import { CommunityGroup, GroupMessage } from '../types';

interface CommunityState {
  groups: CommunityGroup[];
  activeGroupId: string | null;
  createGroup: (name: string, description: string, category: string, userId: string) => void;
  joinGroup: (groupId: string, userId: string) => void;
  leaveGroup: (groupId: string, userId: string) => void;
  sendMessage: (groupId: string, message: GroupMessage) => void;
  setActiveGroup: (groupId: string | null) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  groups: [],
  activeGroupId: null,

  createGroup: (name, description, category, userId) => {
    const newGroup: CommunityGroup = {
      id: Math.random().toString(36).substring(7),
      name,
      description,
      category,
      memberCount: 1,
      createdBy: userId,
      createdAt: new Date(),
      messages: [],
      members: [userId],
    };

    set(state => ({
      groups: [...state.groups, newGroup],
      activeGroupId: newGroup.id,
    }));
  },

  joinGroup: (groupId, userId) => {
    set(state => ({
      groups: state.groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              memberCount: group.memberCount + 1,
              members: [...group.members, userId],
            }
          : group
      ),
    }));
  },

  leaveGroup: (groupId, userId) => {
    set(state => ({
      groups: state.groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              memberCount: group.memberCount - 1,
              members: group.members.filter(id => id !== userId),
            }
          : group
      ),
      activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
    }));
  },

  sendMessage: (groupId, message) => {
    set(state => ({
      groups: state.groups.map(group =>
        group.id === groupId
          ? { ...group, messages: [...group.messages, message] }
          : group
      ),
    }));
  },

  setActiveGroup: (groupId) => {
    set({ activeGroupId: groupId });
  },
}));