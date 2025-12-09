/**
 * Hook for managing Firebase progress tracking in AITutor
 */

import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatAddr } from '../../utilities';
import { firebaseService, type LearningArticle, type LearningQuiz } from '@/lib/firebaseService';
import { GeneratedTopic } from '../TopicSelection';

export function useFirebaseProgress(campaignId: string) {
  const { address } = useAccount();
  const userAddress = formatAddr(address);

  // Load article from Firebase
  const loadArticle = useCallback(async (topicId: string): Promise<LearningArticle | null> => {
    if (!userAddress || !campaignId) return null;
    
    try {
      await firebaseService.waitForInitialization();
      return await firebaseService.getArticle(userAddress, campaignId, topicId);
    } catch (error) {
      console.error('Failed to load article from Firebase:', error);
      return null;
    }
  }, [userAddress, campaignId]);

  // Save article to Firebase
  const saveArticle = useCallback(async (
    topicId: string,
    articleTitle: string,
    articleContent: string
  ): Promise<boolean> => {
    if (!userAddress || !campaignId) return false;

    try {
      await firebaseService.waitForInitialization();
      const article: LearningArticle = {
        id: `article-${topicId}-${Date.now()}`,
        topicId,
        content: articleContent,
        title: articleTitle,
        completed: false,
        lastReadAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const saved = await firebaseService.saveArticle(userAddress, campaignId, article);
      
      // Update topic progress - mark article as completed
      if (saved) {
        await firebaseService.updateTopicProgress(
          userAddress,
          campaignId,
          topicId,
          { articleCompleted: true }
        );
      }
      
      return saved;
    } catch (error) {
      console.error('Failed to save article to Firebase:', error);
      return false;
    }
  }, [userAddress, campaignId]);

  // Mark article as read
  const markArticleRead = useCallback(async (topicId: string): Promise<boolean> => {
    if (!userAddress || !campaignId) return false;

    try {
      await firebaseService.waitForInitialization();
      return await firebaseService.updateTopicProgress(
        userAddress,
        campaignId,
        topicId,
        { articleCompleted: true }
      );
    } catch (error) {
      console.error('Failed to mark article as read:', error);
      return false;
    }
  }, [userAddress, campaignId]);

  // Save quiz attempt (always generate new quiz, but save attempt)
  const saveQuizAttempt = useCallback(async (
    topicId: string,
    quizScore: number,
    questions: any[]
  ): Promise<boolean> => {
    if (!userAddress || !campaignId) return false;

    try {
      await firebaseService.waitForInitialization();
      const quiz: LearningQuiz = {
        id: `quiz-${topicId}-${Date.now()}`, // Always new ID to prevent reuse
        topicId,
        questions,
        score: quizScore,
        completed: true,
        attemptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const saved = await firebaseService.saveQuiz(userAddress, campaignId, quiz);
      
      // Update topic progress - mark quiz as completed
      if (saved) {
        await firebaseService.updateTopicProgress(
          userAddress,
          campaignId,
          topicId,
          { 
            quizCompleted: true,
            quizScore: quizScore
          }
        );
      }
      
      return saved;
    } catch (error) {
      console.error('Failed to save quiz attempt to Firebase:', error);
      return false;
    }
  }, [userAddress, campaignId]);

  return {
    loadArticle,
    saveArticle,
    markArticleRead,
    saveQuizAttempt,
  };
}

