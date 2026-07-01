export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: number;
  totalReps: number;
  totalWorkouts: number;
  streak: number;
  badges: Badge[];
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export interface Workout {
  id: string;
  userId: string;
  exerciseType: ExerciseType;
  reps: number;
  duration: number;
  formAccuracy: number;
  calories: number;
  createdAt: string;
  feedback: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
}

export type ExerciseType = 'squats' | 'pushups' | 'lunges';

export interface PoseKeypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseLandmarks {
  [key: string]: PoseKeypoint;
}

export interface RepCounterState {
  count: number;
  stage: 'up' | 'down' | 'invalid';
  formAccuracy: number;
  feedback: string[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'challenge' | 'workout' | 'community';
  participants: number;
  maxParticipants?: number;
  createdBy: string;
}

export interface DietEntry {
  id: string;
  userId: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}