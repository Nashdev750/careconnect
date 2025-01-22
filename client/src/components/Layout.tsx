import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Heart, Users, BookOpen, MessageCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <Heart className="h-8 w-8 text-rose-500" />
                <span className="ml-2 text-xl font-semibold">MindfulConnect</span>
              </Link>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <Link to="/chat" className="nav-link">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat</span>
                </Link>
                <Link to="/community" className="nav-link">
                  <Users className="h-5 w-5" />
                  <span>Community</span>
                </Link>
                <Link to="/resources" className="nav-link">
                  <BookOpen className="h-5 w-5" />
                  <span>Resources</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}