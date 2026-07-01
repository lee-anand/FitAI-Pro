import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Target, Zap, Camera } from 'lucide-react';
import { PoseDetector, RepCounter } from '../utils/poseDetection';
import { drawPose } from '../utils/drawingUtils';
import { ExerciseType, RepCounterState } from '../types';

interface WorkoutSessionProps {
  exerciseType: ExerciseType;
  onWorkoutComplete: (data: any) => void;
  onBack: () => void;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ 
  exerciseType, 
  onWorkoutComplete, 
  onBack 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [poseDetector, setPoseDetector] = useState<PoseDetector | null>(null);
  const [repCounter, setRepCounter] = useState<RepCounter | null>(null);
  const [repState, setRepState] = useState<RepCounterState>({
    count: 0,
    stage: 'up',
    formAccuracy: 100,
    feedback: []
  });
  const [sessionTime, setSessionTime] = useState(0);
  const [calories, setCalories] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const counter = new RepCounter(exerciseType);
    setRepCounter(counter);
    
    if (videoRef.current && canvasRef.current) {
      const detector = new PoseDetector(videoRef.current, (results) => {
        const canvas = canvasRef.current;
        if (canvas && results.poseLandmarks) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawPose(ctx, results, canvas.width, canvas.height, repState.feedback);
          }
          
          // Process pose for rep counting
          const landmarks = results.poseLandmarks.reduce((acc: any, landmark: any, index: number) => {
            const landmarkNames = [
              'NOSE', 'LEFT_EYE_INNER', 'LEFT_EYE', 'LEFT_EYE_OUTER', 'RIGHT_EYE_INNER',
              'RIGHT_EYE', 'RIGHT_EYE_OUTER', 'LEFT_EAR', 'RIGHT_EAR', 'MOUTH_LEFT',
              'MOUTH_RIGHT', 'LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_ELBOW', 'RIGHT_ELBOW',
              'LEFT_WRIST', 'RIGHT_WRIST', 'LEFT_PINKY', 'RIGHT_PINKY', 'LEFT_INDEX',
              'RIGHT_INDEX', 'LEFT_THUMB', 'RIGHT_THUMB', 'LEFT_HIP', 'RIGHT_HIP',
              'LEFT_KNEE', 'RIGHT_KNEE', 'LEFT_ANKLE', 'RIGHT_ANKLE', 'LEFT_HEEL',
              'RIGHT_HEEL', 'LEFT_FOOT_INDEX', 'RIGHT_FOOT_INDEX'
            ];
            
            acc[landmarkNames[index]] = landmark;
            return acc;
          }, {});
          
          let newRepState: RepCounterState;
          
          switch (exerciseType) {
            case 'squats':
              newRepState = counter.processSquat(landmarks);
              break;
            case 'pushups':
              newRepState = counter.processPushup(landmarks);
              break;
            case 'lunges':
              newRepState = counter.processLunge(landmarks);
              break;
            default:
              newRepState = repState;
          }
          
          setRepState(newRepState);
          
          // Show celebration for new rep
          if (newRepState.count > repState.count) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 1000);
          }
        }
      });
      
      setPoseDetector(detector);
    }
    
    return () => {
      if (poseDetector) {
        poseDetector.stop();
      }
    };
  }, [exerciseType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        setCalories(prev => prev + 0.1); // Rough calorie calculation
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleSession = () => {
    if (isActive) {
      setIsActive(false);
      poseDetector?.stop();
    } else {
      setIsActive(true);
      poseDetector?.start();
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setSessionTime(0);
    setCalories(0);
    repCounter?.reset();
    setRepState({
      count: 0,
      stage: 'up',
      formAccuracy: 100,
      feedback: []
    });
    poseDetector?.stop();
  };

  const completeWorkout = () => {
    const workoutData = {
      exerciseType,
      reps: repState.count,
      duration: sessionTime,
      formAccuracy: repState.formAccuracy,
      calories: Math.round(calories),
      feedback: repState.feedback
    };
    onWorkoutComplete(workoutData);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseDisplayName = (type: ExerciseType) => {
    switch (type) {
      case 'squats': return 'Squats';
      case 'pushups': return 'Push-ups';
      case 'lunges': return 'Lunges';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">{getExerciseDisplayName(exerciseType)}</h1>
          <button
            onClick={completeWorkout}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-96 object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                width={640}
                height={480}
              />
              
              {/* Celebration Animation */}
              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-6xl font-bold text-yellow-400 animate-pulse">
                      +1 REP!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                  onClick={toggleSession}
                  className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                >
                  {isActive ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={resetSession}
                  className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            {/* Rep Counter */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-6xl font-bold text-yellow-400 mb-2">
                {repState.count}
              </div>
              <div className="text-lg text-gray-300">Reps</div>
              <div className="mt-2 text-sm text-gray-400">
                Stage: {repState.stage}
              </div>
            </div>

            {/* Form Accuracy */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold">Form Accuracy</span>
                <Target size={20} />
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${repState.formAccuracy}%` }}
                />
              </div>
              <div className="text-right text-sm text-gray-300">
                {repState.formAccuracy.toFixed(0)}%
              </div>
            </div>

            {/* Session Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Time</span>
                  <span className="font-semibold">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Calories</span>
                  <span className="font-semibold">{Math.round(calories)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className={`font-semibold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold">Form Feedback</span>
                <Zap size={20} />
              </div>
              <div className="space-y-2">
                {repState.feedback.length === 0 ? (
                  <div className="text-green-400 text-sm">Great form! Keep it up!</div>
                ) : (
                  repState.feedback.map((feedback, index) => (
                    <div key={index} className="text-yellow-400 text-sm">
                      • {feedback}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSession;