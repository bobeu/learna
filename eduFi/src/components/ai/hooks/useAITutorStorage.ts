/**
 * Custom hook for AITutor storage management
 * Handles saving/loading state, progress, and quiz state
 */

import { useCallback, useEffect } from 'react';
import { GeneratedTopic } from '../TopicSelection';
import { QuizQuestion } from '../Quiz';
import { CampaignStateProps } from '../../../../types';
import { formatAddr } from '../../utilities';
import { useAccount } from 'wagmi';
import {
  saveAITutorState,
  saveQuizState,
  type SavedAITutorState
} from '../services/aiTutorStorageService';
import {
  saveUnsavedProgress,
  isProgressAlreadySaved,
  type UnsavedQuizProgress
} from '../quizProgressStorage';
import { zeroAddress } from 'viem';

export interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
  readingTime: number;
}

interface UseAITutorStorageProps {
  campaign: CampaignStateProps;
  generatedTopics: GeneratedTopic[];
  selectedTopic: GeneratedTopic | null;
  article: GeneratedArticle | null;
  quizzes: QuizQuestion[];
  userAnswers: number[];
  currentQuizIndex: number;
  quizScore: number;
  startTime: number;
  endTime: number;
  currentStep: 'topics' | 'article' | 'quiz' | 'results';
  greeting: string | null;
  campaignInfo: string | null;
  transactionSucceeded: boolean;
  savedLearnerData: Array<{ score: number; percentage: number; questionSize: number; timeSpent: number }> | null;
}

export function useAITutorStorage({
  campaign,
  generatedTopics,
  selectedTopic,
  article,
  quizzes,
  userAnswers,
  currentQuizIndex,
  quizScore,
  startTime,
  endTime,
  currentStep,
  greeting,
  campaignInfo,
  transactionSucceeded,
  savedLearnerData,
}: UseAITutorStorageProps) {
  const { address } = useAccount();
  const userAddress = formatAddr(address);
  const isValidAddress = userAddress !== zeroAddress;

  // Save AITutor state to localStorage
  const saveAITutorStateToStorage = useCallback(() => {
    if(!isValidAddress || transactionSucceeded) return;
    
    const campaignId = campaign.__raw.contractInfo.index.toString();
    const state: SavedAITutorState = {
      campaignId,
      campaignAddress: campaign.__raw.contractInfo.address,
      topics: generatedTopics,
      selectedTopic,
      greeting,
      campaignInfo,
      article: article ? {
        title: article.title,
        content: article.content,
        wordCount: article.wordCount,
        readingTime: article.readingTime
      } : null,
      quizzes: [],
      userAnswers: [],
      currentQuizIndex: 0,
      quizScore: 0,
      startTime: 0,
      endTime: 0,
      currentStep,
      savedAt: Date.now()
    };
    
    saveAITutorState(userAddress, state);
  }, [isValidAddress, transactionSucceeded, campaign, generatedTopics, selectedTopic, greeting, campaignInfo, article, currentStep, userAddress]);

  // Save quiz state temporarily (3 minutes)
  const saveQuizStateToStorage = useCallback(() => {
    if(!isValidAddress || quizzes.length === 0) return;
    
    const campaignId = campaign.__raw.contractInfo.index.toString();
    saveQuizState(
      userAddress,
      campaignId,
      quizzes,
      userAnswers,
      currentQuizIndex,
      quizScore,
      startTime,
      endTime
    );
  }, [isValidAddress, campaign, quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, userAddress]);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if(!isValidAddress || transactionSucceeded) return;
    
    if(currentStep === 'results' && selectedTopic && article) {
      const progress: UnsavedQuizProgress = {
        campaignId: campaign.__raw.contractInfo.index.toString(),
        campaignAddress: campaign.__raw.contractInfo.address,
        topic: selectedTopic,
        article: {
          title: article.title,
          content: article.content,
          wordCount: article.wordCount,
          readingTime: article.readingTime
        },
        quizzes: quizzes.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        userAnswers: [...userAnswers],
        currentQuizIndex,
        quizScore,
        performance: {
          value: 0, // Will be set by caller
          ratedAt: ''
        },
        startTime,
        endTime,
        currentStep,
        savedAt: Date.now()
      };
      
      if(!savedLearnerData || !isProgressAlreadySaved(progress, savedLearnerData)) {
        saveUnsavedProgress(userAddress, progress);
      }
    }
  }, [isValidAddress, transactionSucceeded, currentStep, selectedTopic, article, quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, campaign, savedLearnerData, userAddress]);

  // Auto-save AITutor state
  useEffect(() => {
    if(isValidAddress && (generatedTopics.length > 0 || article || currentStep !== 'topics')) {
      saveAITutorStateToStorage();
    }
  }, [generatedTopics, selectedTopic, article, currentStep, greeting, campaignInfo, isValidAddress, saveAITutorStateToStorage]);

  // Auto-save quiz state
  useEffect(() => {
    if(isValidAddress && currentStep === 'quiz' && quizzes.length > 0) {
      saveQuizStateToStorage();
    }
  }, [quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, currentStep, isValidAddress, saveQuizStateToStorage]);

  return {
    saveAITutorStateToStorage,
    saveQuizStateToStorage,
    saveProgress,
  };
}

