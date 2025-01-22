import React, { useState } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { mockPeerSupporters } from '../data/mockData';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { useSocketStore } from '../services/socket';

export function Chat() {
  const [selectedSupporter, setSelectedSupporter] = useState<{
    supporterId: string;
    supporterAlias: string;
  } | null>(null);
  const { user } = useAuthStore();
  console.log(user)
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (selectedSupporter) {
    // socket.join(user.alias,user.isMentor)
    return (
      <ChatInterface
        supporterId={selectedSupporter.supporterId}
        supporterAlias={selectedSupporter.supporterAlias}
        onBack={() => {setSelectedSupporter(null)}}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Talk to Someone</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* {mockPeerSupporters.map((supporter) => ( */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Users className="h-10 w-10 text-rose-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">SupportiveFriend</h3>
                <p className="text-sm text-gray-600">
                 anxiety, depression
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSupporter({
                supporterId: "1",
                supporterAlias: "SupportiveFriend"
              })}
              className="w-full bg-rose-500 text-white rounded-md py-2 px-4 hover:bg-rose-600 flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chat
            </button>
          </div>
          {/* mentor */}
          {!user.isMentor &&
          <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="h-10 w-10 text-rose-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">HelpingHand</h3>
              <p className="text-sm text-gray-600">stress, meditation</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSupporter({
              supporterId: "2",
              supporterAlias: "HelpingHand"
            })}
            className="w-full bg-rose-500 text-white rounded-md py-2 px-4 hover:bg-rose-600 flex items-center justify-center"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Start Chat
          </button>
        </div>
          }
          
        {/* ))} */}
      </div>
    </div>
  );
}