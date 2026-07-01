import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Activity, 
  MessageCircle, 
  Calendar, 
  Apple, 
  User, 
  Trophy,
  Target,
  Flame,
  TrendingUp
} from 'lucide-react';
import { User as UserType } from '../types';
import ExerciseSelector from './ExerciseSelector';
import WorkoutSession from './WorkoutSession';
import { ExerciseType } from '../types';

interface DashboardProps {
  user: UserType;
}

type TabType = 'home' | 'workout' | 'chat' | 'events' | 'diet' | 'profile';

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentExercise, setCurrentExercise] = useState<ExerciseType | null>(null);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Activity },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'diet', label: 'Diet', icon: Apple },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleExerciseSelect = (type: ExerciseType) => {
    setCurrentExercise(type);
  };

  const handleWorkoutComplete = (data: any) => {
    console.log('Workout completed:', data);
    // Here you would save to database
    setCurrentExercise(null);
    setActiveTab('home');
  };

  const handleBackToSelector = () => {
    setCurrentExercise(null);
  };

  const renderHomeContent = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-blue-100">Ready to crush your fitness goals?</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">Level {user.level}</div>
            <div className="text-blue-200 text-sm">{user.totalReps} total reps</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Streak</p>
              <p className="text-2xl font-bold">{user.streak} days</p>
            </div>
            <Flame className="text-orange-400" size={24} />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Workouts</p>
              <p className="text-2xl font-bold">{user.totalWorkouts}</p>
            </div>
            <Target className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Level</p>
              <p className="text-2xl font-bold">{user.level}</p>
            </div>
            <TrendingUp className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Badges</p>
              <p className="text-2xl font-bold">{user.badges.length}</p>
            </div>
            <Trophy className="text-yellow-400" size={24} />
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user.badges.slice(0, 3).map((badge) => (
            <div key={badge.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold">{badge.name}</p>
                <p className="text-sm text-gray-300">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('workout')}
            className="p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity size={24} className="mx-auto mb-2" />
            <div className="text-center">Start Workout</div>
          </button>
          
          <button
            onClick={() => setActiveTab('diet')}
            className="p-4 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Apple size={24} className="mx-auto mb-2" />
            <div className="text-center">Log Meal</div>
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            className="p-4 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Calendar size={24} className="mx-auto mb-2" />
            <div className="text-center">View Events</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderWorkoutContent = () => {
    if (currentExercise) {
      return (
        <WorkoutSession
          exerciseType={currentExercise}
          onWorkoutComplete={handleWorkoutComplete}
          onBack={handleBackToSelector}
        />
      );
    }

    return (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Exercise</h2>
          <p className="text-gray-300">Select an exercise to start your AI-powered workout</p>
        </div>
        <ExerciseSelector onSelectExercise={handleExerciseSelect} />
      </div>
    );
  };

  const renderChatContent = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Community Chat</h3>
      <div className="bg-white/5 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
        <p className="text-gray-300 text-center">Chat feature coming soon!</p>
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
        />
        <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Send
        </button>
      </div>
    </div>
  );

  const renderEventsContent = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold text-purple-400">30-Day Squat Challenge</h4>
          <p className="text-gray-300 text-sm">Join 1,234 other participants</p>
          <p className="text-gray-400 text-xs">Starts in 3 days</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold text-green-400">Weekly Push-up Contest</h4>
          <p className="text-gray-300 text-sm">Compete for the top spot</p>
          <p className="text-gray-400 text-xs">Starts tomorrow</p>
        </div>
      </div>
    </div>
  );

  const renderDietContent = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Diet Tracker</h3>
      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Today's Intake</h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-400">1,850</p>
              <p className="text-sm text-gray-300">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">120g</p>
              <p className="text-sm text-gray-300">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">200g</p>
              <p className="text-sm text-gray-300">Carbs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">65g</p>
              <p className="text-sm text-gray-300">Fat</p>
            </div>
          </div>
        </div>
        
        <button className="w-full bg-green-600 py-3 rounded-lg hover:bg-green-700 transition-colors">
          Add Meal
        </button>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Profile</h3>
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <h4 className="text-xl font-semibold">{user.name}</h4>
          <p className="text-gray-300">{user.email}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{user.level}</p>
            <p className="text-sm text-gray-300">Level</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{user.totalReps}</p>
            <p className="text-sm text-gray-300">Total Reps</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (currentExercise) {
    return renderWorkoutContent();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/10 backdrop-blur-sm min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FitAI Pro
            </h1>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-white/10 text-gray-300'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'home' && renderHomeContent()}
            {activeTab === 'workout' && renderWorkoutContent()}
            {activeTab === 'chat' && renderChatContent()}
            {activeTab === 'events' && renderEventsContent()}
            {activeTab === 'diet' && renderDietContent()}
            {activeTab === 'profile' && renderProfileContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;