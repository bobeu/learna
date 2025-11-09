/**
 * Quiz Section Component
 * Handles quiz generation and taking
 */

"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Quiz, { QuizQuestion } from '../Quiz';

interface QuizSectionProps {
  quizzes: QuizQuestion[];
  currentQuizIndex: number;
  userAnswers: number[];
  isGenerating: boolean;
  onSetCurrentQuizIndex: (index: number) => void;
  onSetUserAnswers: React.Dispatch<React.SetStateAction<number[]>>;
  onCalculateResults: () => void;
}

export default function QuizSection({
  quizzes,
  currentQuizIndex,
  userAnswers,
  isGenerating,
  onSetCurrentQuizIndex,
  onSetUserAnswers,
  onCalculateResults,
}: QuizSectionProps) {
  // Show loading state while generating quiz
  if (isGenerating && quizzes.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Knowledge Test
          </h3>
        </div>
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6 sm:p-8 md:p-12">
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-spin text-primary-500" />
              <div className="text-center space-y-1.5 sm:space-y-2">
                <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                  Generating Quiz Questions
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Our AI tutor is preparing your knowledge test...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show quiz when ready
  if (quizzes.length > 0) {
    return (
      <Quiz
        calculateResults={onCalculateResults}
        currentQuizIndex={currentQuizIndex}
        quizzes={quizzes}
        setCurrentQuizIndex={onSetCurrentQuizIndex}
        setUserAnswers={onSetUserAnswers}
        userAnswers={userAnswers}
      />
    );
  }

  return null;
}

