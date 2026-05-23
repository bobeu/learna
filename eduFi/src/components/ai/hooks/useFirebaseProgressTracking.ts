/**
 * Hook for tracking learning progress in Firebase
 * Integrates with AITutor component to update progress in real-time
 */

import { useCallback } from 'react';
import { firebaseService, type LearningArticle, type LearningQuiz } from '@/lib/firebaseService';
import { GeneratedTopic } from '../TopicSelection';

interface UseFirebaseProgressTrackingProps {
  walletAddress: string;
  campaignId: string;
  topicId: string;
}

export function useFirebaseProgressTracking({
  walletAddress,
  campaignId,
  topicId,
}: UseFirebaseProgressTrackingProps) {
  
  // Track article completion
  const markArticleCompleted = useCallback(async (article: {
    id: string;
    title: string;
    content: string;
  }) => {
    if (!walletAddress || !campaignId || !topicId) return;

    try {
      // Save article to Firebase
      const learningArticle: LearningArticle = {
        id: article.id,
        topicId,
        content: article.content,
        title: article.title,
        completed: true,
        lastReadAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await firebaseService.saveArticle(walletAddress, campaignId, learningArticle);

      // Update topic progress
      await firebaseService.updateTopicProgress(
        walletAddress,
        campaignId,
        topicId,
        {
          articleCompleted: true,
        }
      );
    } catch (error) {
      console.error('Failed to mark article as completed:', error);
    }
  }, [walletAddress, campaignId, topicId]);

  // Track quiz completion
  const markQuizCompleted = useCallback(async (quiz: {
    id: string;
    questions: any[];
    score: number;
  }) => {
    if (!walletAddress || !campaignId || !topicId) return;

    try {
      // Save quiz to Firebase
      const learningQuiz: LearningQuiz = {
        id: quiz.id,
        topicId,
        questions: quiz.questions,
        score: quiz.score,
        completed: true,
        attemptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await firebaseService.saveQuiz(walletAddress, campaignId, learningQuiz);

      // Update topic progress
      await firebaseService.updateTopicProgress(
        walletAddress,
        campaignId,
        topicId,
        {
          quizCompleted: true,
          quizScore: quiz.score,
        }
      );
    } catch (error) {
      console.error('Failed to mark quiz as completed:', error);
    }
  }, [walletAddress, campaignId, topicId]);

  // Track topic access
  const trackTopicAccess = useCallback(async () => {
    if (!walletAddress || !campaignId || !topicId) return;

    try {
      await firebaseService.updateTopicProgress(
        walletAddress,
        campaignId,
        topicId,
        {
          lastAccessedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to track topic access:', error);
    }
  }, [walletAddress, campaignId, topicId]);

  // Load existing article for topic
  const loadExistingArticle = useCallback(async (): Promise<LearningArticle | null> => {
    if (!walletAddress || !campaignId || !topicId) return null;

    try {
      return await firebaseService.getArticle(walletAddress, campaignId, topicId);
    } catch (error) {
      console.error('Failed to load existing article:', error);
      return null;
    }
  }, [walletAddress, campaignId, topicId]);

  return {
    markArticleCompleted,
    markQuizCompleted,
    trackTopicAccess,
    loadExistingArticle,
  };
}

