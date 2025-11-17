/**
 * Custom hook for managing AITutor state
 * Handles topics, articles, quizzes, and results state
 */

import { useState } from 'react';
import { GeneratedTopic } from '../TopicSelection';
import { QuizQuestion } from '../Quiz';
import { Performance } from '../../../../types';
import { Steps } from '../ArticleReading';

export interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
  readingTime: number;
}

export interface AITutorState {
  currentStep: Steps;
  selectedTopic: GeneratedTopic | null;
  generatedTopics: GeneratedTopic[];
  article: GeneratedArticle | null;
  quizzes: QuizQuestion[];
  currentQuizIndex: number;
  userAnswers: number[];
  quizScore: number;
  performance: Performance | null;
  isGenerating: boolean;
  startTime: number;
  endTime: number;
}

export interface AITutorStateActions {
  setCurrentStep: (step: Steps) => void;
  setSelectedTopic: (topic: GeneratedTopic | null) => void;
  setGeneratedTopics: (topics: GeneratedTopic[]) => void;
  setArticle: (article: GeneratedArticle | null) => void;
  setQuizzes: (quizzes: QuizQuestion[]) => void;
  setCurrentQuizIndex: (index: number) => void;
  setUserAnswers: (answers: number[]) => void;
  setQuizScore: (score: number) => void;
  setPerformance: (performance: Performance | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
}

export function useAITutorState(initialTopic?: GeneratedTopic): [AITutorState, AITutorStateActions] {
  const [currentStep, setCurrentStep] = useState<Steps>(initialTopic ? 'article' : 'topics');
  const [selectedTopic, setSelectedTopic] = useState<GeneratedTopic | null>(initialTopic || null);
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>(initialTopic ? [initialTopic] : []);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  const state: AITutorState = {
    currentStep,
    selectedTopic,
    generatedTopics,
    article,
    quizzes,
    currentQuizIndex,
    userAnswers,
    quizScore,
    performance,
    isGenerating,
    startTime,
    endTime,
  };

  const actions: AITutorStateActions = {
    setCurrentStep,
    setSelectedTopic,
    setGeneratedTopics,
    setArticle,
    setQuizzes,
    setCurrentQuizIndex,
    setUserAnswers,
    setQuizScore,
    setPerformance,
    setIsGenerating,
    setStartTime,
    setEndTime,
  };

  return [state, actions];
}

