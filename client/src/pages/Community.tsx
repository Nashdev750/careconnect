import React, { useState } from 'react';
import { Users, MessageSquare, Plus } from 'lucide-react';
import { useCommunityStore } from '../store/communityStore';
import { useAuthStore } from '../store/authStore';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { GroupChat } from '../components/GroupChat';
import { Button } from '../components/ui/Button';

export function Community() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuthStore();
  const {
    groups,
    activeGroupId,
    createGroup,
    joinGroup,
    sendMessage,
    setActiveGroup
  } = useCommunityStore();

  const activeGroup = groups.find(group => group.id === activeGroupId);

  const handleCreateGroup = (name: string, description: string, category: string) => {
    if (user) {
      createGroup(name, description, category, user.id);
    }
  };

  const handleJoinGroup = (groupId: string) => {
    if (user) {
      joinGroup(groupId, user.id);
      setActiveGroup(groupId);
    }
  };

  if (activeGroup) {
    return (
      <GroupChat
        group={activeGroup}
        onBack={() => setActiveGroup(null)}
        onSendMessage={(message) => sendMessage(activeGroup.id, message)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Groups</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="!w-auto"
          icon={<Plus className="h-5 w-5" />}
        >
          Create Group
        </Button>
      </div>
      
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{group.memberCount} members</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{group.messages.length} messages</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleJoinGroup(group.id)}
                className="!w-auto"
                icon={<MessageSquare className="h-5 w-5" />}
              >
                Join Discussion
              </Button>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
            <p className="text-gray-500">
              Create a new group to start connecting with others
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </div>
  );
}