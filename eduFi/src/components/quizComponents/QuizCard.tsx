/* eslint-disable */

import React from 'react';
import { Clock, Award, ChevronRight, BookOpen } from 'lucide-react';
import { Quiz } from '../../../types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  onSelect: (quiz: Quiz) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      onClick={() => onSelect(quiz)}
      className="glass-card rounded-2xl p-6 hover:border-white/40 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:scale-105 animate-fade-in"
    >
      {/* Quiz Image */}
      {quiz.imageUrl && (
        <div className="w-full h-32 mb-4 rounded-xl overflow-hidden">
          <img 
            src={quiz.imageUrl} 
            alt={quiz.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize group-hover:text-gradient transition-all duration-300">
            {quiz.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {quiz.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all ml-4 flex-shrink-0" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          {quiz.category}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {quiz.questions.length} Questions
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4" />
            <span>{quiz.totalPoints} pts</span>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.timeLimit}m</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <BookOpen className="w-4 h-4" />
          <span>Quiz</span>
        </div>
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-brand-gradient h-2 rounded-full transition-all duration-700 group-hover:w-full"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
};