import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Activity } from 'lucide-react';
import { ExerciseType } from '../types';

interface ExerciseSelectorProps {
  onSelectExercise: (type: ExerciseType) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelectExercise }) => {
  const exercises = [
    {
      type: 'squats' as ExerciseType,
      name: 'Squats',
      description: 'Target your glutes and quadriceps',
      icon: Target,
      color: 'from-blue-500 to-purple-600',
      difficulty: 'Beginner',
      muscles: ['Glutes', 'Quadriceps', 'Hamstrings']
    },
    {
      type: 'pushups' as ExerciseType,
      name: 'Push-ups',
      description: 'Build upper body strength',
      icon: Zap,
      color: 'from-red-500 to-pink-600',
      difficulty: 'Intermediate',
      muscles: ['Chest', 'Shoulders', 'Triceps']
    },
    {
      type: 'lunges' as ExerciseType,
      name: 'Lunges',
      description: 'Improve balance and leg strength',
      icon: Activity,
      color: 'from-green-500 to-teal-600',
      difficulty: 'Beginner',
      muscles: ['Glutes', 'Quadriceps', 'Calves']
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {exercises.map((exercise, index) => (
        <motion.div
          key={exercise.type}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${exercise.color} p-6 cursor-pointer transform hover:scale-105 transition-all duration-300`}
          onClick={() => onSelectExercise(exercise.type)}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <exercise.icon size={32} className="text-white" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                {exercise.difficulty}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{exercise.name}</h3>
            <p className="text-white/80 mb-4">{exercise.description}</p>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">Target Muscles:</h4>
              <div className="flex flex-wrap gap-1">
                {exercise.muscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="text-xs bg-white/20 px-2 py-1 rounded-full text-white"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg py-3 px-4 text-white font-semibold hover:bg-white/30 transition-colors"
            >
              Start Exercise
            </motion.button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-sm" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-sm" />
        </motion.div>
      ))}
    </div>
  );
};

export default ExerciseSelector;