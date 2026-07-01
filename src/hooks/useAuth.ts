import { useState, useEffect } from 'react';
import { User } from '../types';

// Mock user data for demo mode
const mockUser: User = {
  id: 'demo-user-123',
  email: 'demo@fitaipro.com',
  name: 'Demo User',
  level: 5,
  totalReps: 1250,
  totalWorkouts: 42,
  streak: 7,
  badges: [
    {
      id: '1',
      name: 'First Workout',
      description: 'Completed your first workout',
      icon: '🏃',
      color: '#3B82F6',
      unlockedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Squat Master',
      description: 'Performed 100 squats',
      icon: '🏋️',
      color: '#10B981',
      unlockedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      name: 'Week Warrior',
      description: 'Maintained a 7-day streak',
      icon: '🔥',
      color: '#F59E0B',
      unlockedAt: '2024-01-25T09:15:00Z'
    }
  ],
  createdAt: '2024-01-10T08:00:00Z'
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and set demo user
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulate sign in delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      setUser(mockUser);
      return { error: null };
    }
    
    return { error: { message: 'Please enter valid credentials' } };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Simulate sign up delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password && name) {
      const newUser = {
        ...mockUser,
        email,
        name,
        level: 1,
        totalReps: 0,
        totalWorkouts: 0,
        streak: 0,
        badges: []
      };
      setUser(newUser);
      return { error: null };
    }
    
    return { error: { message: 'Please fill in all fields' } };
  };

  const signOut = async () => {
    setUser(null);
    return { error: null };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};