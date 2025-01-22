import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, User, Mail, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useSocketStore } from '../services/socket';

export function Home() {
  const socket = useSocketStore()
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    alias?: string;
    email?: string;
    mentor?: string;
  }>({});

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const alias = formData.get('alias') as string;
    const email = formData.get('email') as string;
    const mentor = formData.get('mentor') as string;

    // Simple validation
    const newErrors: typeof errors = {};
    if (!alias.trim()) {
      newErrors.alias = 'Alias is required';
    } else if (alias.length < 3) {
      newErrors.alias = 'Alias must be at least 3 characters';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    console.log(mentor,"mentee or mentor")
    
    login(alias, email, mentor == "on");
    socket.connect(alias,mentor == "on")
    navigate('/chat');
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    loginAsGuest(false);
    socket.connect("guest",false)
    navigate('/chat');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <Heart className="h-16 w-16 text-rose-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to MindfulConnect</h1>
        <p className="text-xl text-gray-600">A safe space for mental health support</p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6 text-green-600 bg-green-50 rounded-lg py-2">
            <Shield className="h-5 w-5 mr-2" />
            <span className="text-sm">Your privacy is our priority</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="alias"
              name="alias"
              label="Choose an alias"
              placeholder="Enter your preferred name"
              icon={<User className="h-5 w-5" />}
              error={errors.alias}
              required
              autoComplete="off"
              autoFocus
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email (optional)"
              placeholder="your@email.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email}
              autoComplete="email"
            />
            <label htmlFor="" style={{marginRight:10}}>Are you a mentor?</label>
            <input
              id="mentor"
              name="mentor"
              type="checkbox"
              placeholder=""
            />

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                icon={<LogIn className="h-5 w-5" />}
              >
                Register Anonymously
              </Button>
            </div>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={handleGuestLogin}
              isLoading={isLoading}
            >
              Continue as Guest
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="font-medium text-rose-600 hover:text-rose-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-rose-600 hover:text-rose-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}