# FitAI Pro - AI-Based Rep Counter for Fitness

A cutting-edge fitness web application that uses MediaPipe Pose estimation and TensorFlow.js to provide real-time rep counting and form analysis for exercises like squats, push-ups, and lunges.

## Features

### Core Functionality
- **Real-time Pose Detection**: Uses MediaPipe Pose to detect human body keypoints
- **Intelligent Rep Counting**: Analyzes joint angles to accurately count exercise repetitions
- **Form Feedback**: Provides real-time feedback on exercise form and posture
- **Multi-Exercise Support**: Supports squats, push-ups, and lunges with exercise-specific analysis

### Gamification
- **Progress Tracking**: Track workout history, rep counts, and form accuracy
- **Achievement System**: Earn badges and level up based on performance
- **Streak Tracking**: Maintain daily workout streaks
- **Performance Analytics**: View detailed statistics and progress charts

### Dashboard Features
- **Workout Sessions**: Interactive workout interface with live camera feed
- **Community Chat**: Real-time chat with other users
- **Events Calendar**: View and participate in fitness challenges
- **Diet Tracker**: Log meals and track nutritional intake
- **User Profile**: Personal statistics and achievements

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI/ML**: MediaPipe Pose, TensorFlow.js
- **Animation**: Framer Motion
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Netlify/Vercel ready

## Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd fitai-pro
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key to the `.env` file

3. **Database Setup**
   - Run the SQL migrations in your Supabase dashboard
   - Enable Row Level Security for all tables

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  total_reps INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Workouts Table
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  reps INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  form_accuracy DECIMAL(5,2) NOT NULL,
  calories INTEGER NOT NULL,
  feedback TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Exercise Analysis

### Squats
- **Key Points**: Hip, knee, ankle alignment
- **Angle Analysis**: Knee angle for rep detection
- **Form Checks**: Knee tracking, back posture, depth control

### Push-ups
- **Key Points**: Shoulder, elbow, wrist alignment
- **Angle Analysis**: Elbow angle for rep detection
- **Form Checks**: Body alignment, elbow positioning, range of motion

### Lunges
- **Key Points**: Hip, knee, ankle of working leg
- **Angle Analysis**: Knee angle for rep detection
- **Form Checks**: Knee over toe alignment, balance, depth

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Limited MediaPipe support
- Safari: Requires WebRTC permissions

## Performance Optimization

- Pose detection runs at 30 FPS
- Canvas rendering optimized for smooth visualization
- Efficient angle calculations using vector math
- Minimal re-renders with React optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details