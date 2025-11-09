/**
 * Custom hook for AITutor business logic actions
 * Handles article generation, quiz generation, and results calculation
 */

import { useCallback } from 'react';
import { GeneratedTopic } from '../TopicSelection';
import { QuizQuestion } from '../Quiz';
import { Performance } from '../../../../types';
import { stringToHex } from 'viem';
import { CampaignStateProps } from '../../../../types';

export interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
  readingTime: number;
}

interface UseAITutorActionsProps {
  campaign: CampaignStateProps;
  setArticle: (article: GeneratedArticle | null) => void;
  setQuizzes: (quizzes: QuizQuestion[]) => void;
  setStartTime: (time: number) => void;
  setIsGenerating: (generating: boolean) => void;
  loadQuizState?: () => { quizzes: QuizQuestion[]; userAnswers: number[]; currentQuizIndex: number; quizScore: number; startTime: number; endTime: number } | null;
  clearQuizState?: () => void;
}

export function useAITutorActions({
  campaign,
  setArticle,
  setQuizzes,
  setStartTime,
  setIsGenerating,
  loadQuizState,
  clearQuizState,
}: UseAITutorActionsProps) {
  // Generate article based on selected topic
  const generateArticle = useCallback(async (topic: GeneratedTopic) => {
    setIsGenerating(true);
    setStartTime(Date.now());
    
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic.title,
          campaignName: campaign.name,
          maxWords: 500
        }),
      });
      
      if(response.ok) {
        try {
          const articleData = await response.json();
          if (articleData._fallback) {
            console.warn('Using fallback article due to API error:', articleData._error);
          }
          setArticle(articleData);
        } catch (parseError) {
          console.warn('Failed to parse article response, using fallback');
          setArticle({
            title: topic.title,
            content: `# ${topic.title}\n\nThis is a comprehensive guide to ${topic.title}. ${topic.description}\n\n## Key Concepts\n\nUnderstanding the fundamentals is crucial for mastering this topic.\n\n## Practical Applications\n\nReal-world examples and use cases demonstrate the practical value of this knowledge.\n\n## Advanced Techniques\n\nFor those looking to go beyond the basics, advanced techniques provide deeper insights.\n\n## Conclusion\n\nMastering ${topic.title} opens up numerous opportunities in the field.`,
            wordCount: 500,
            readingTime: 4,
          });
        }
      } else {
        setArticle({
          title: topic.title,
          content: `# ${topic.title}\n\nThis is a comprehensive guide to ${topic.title}. ${topic.description}\n\n## Key Concepts\n\nUnderstanding the fundamentals is crucial for mastering this topic.\n\n## Practical Applications\n\nReal-world examples and use cases demonstrate the practical value of this knowledge.\n\n## Advanced Techniques\n\nFor those looking to go beyond the basics, advanced techniques provide deeper insights.\n\n## Conclusion\n\nMastering ${topic.title} opens up numerous opportunities in the field.`,
          wordCount: 500,
          readingTime: 4,
        });
      }
    } catch (error: unknown) {
      setArticle({
        title: topic.title,
        content: `# ${topic.title}\n\nThis is a comprehensive guide to ${topic.title}. ${topic.description}\n\n## Key Concepts\n\nUnderstanding the fundamentals is crucial for mastering this topic.\n\n## Practical Applications\n\nReal-world examples and use cases demonstrate the practical value of this knowledge.\n\n## Advanced Techniques\n\nFor those looking to go beyond the basics, advanced techniques provide deeper insights.\n\n## Conclusion\n\nMastering ${topic.title} opens up numerous opportunities in the field.`,
        wordCount: 500,
        readingTime: 4,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [campaign.name, setArticle, setStartTime, setIsGenerating]);

  // Generate quiz based on article
  const generateQuiz = useCallback(async (article: GeneratedArticle) => {
    // Check for saved quiz state first
    if(loadQuizState) {
      const savedQuizState = loadQuizState();
      if(savedQuizState) {
        setQuizzes(savedQuizState.quizzes);
        return;
      } else if(clearQuizState) {
        clearQuizState();
      }
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleContent: article.content,
          articleTitle: article.title,
          questionCount: 10
        }),
      });
      
      if(response.ok) {
        const quizData = await response.json();
        setQuizzes(quizData);
      } else {
        // Fallback quiz
        setQuizzes([
          {
            id: '1',
            question: `What is the main focus of ${article.title}?`,
            options: ['Basic concepts', 'Advanced techniques', 'Practical applications', 'All of the above'],
            correctAnswer: 3,
            explanation: 'The article covers all aspects of the topic.'
          },
          {
            id: '2',
            question: 'Which is most important for understanding this topic?',
            options: ['Memorization', 'Practical application', 'Theoretical knowledge', 'Speed'],
            correctAnswer: 1,
            explanation: 'Practical application helps solidify understanding.'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [setQuizzes, setIsGenerating, loadQuizState, clearQuizState]);

  // Calculate quiz results
  const calculateResults = useCallback((
    quizzes: QuizQuestion[],
    userAnswers: number[],
    setQuizScore: (score: number) => void,
    setPerformance: (performance: Performance) => void,
    setEndTime: (time: number) => void,
    setCurrentStep: (step: 'results') => void
  ) => {
    setEndTime(Date.now());
  
    let correctAnswers = 0; 
    const quizSize = quizzes.length;
    userAnswers.forEach((answer, index) => {
      if(answer === quizzes[index].correctAnswer) {
        correctAnswers++;
      }
    });
    const score = quizSize > 0 ? Math.round((correctAnswers / quizSize) * 100) : 0;
    setQuizScore(score);
    
    // Calculate performance rating
    let performanceValue = 0;
    if(score >= 90) performanceValue = 5;
    else if(score >= 80) performanceValue = 4;
    else if(score >= 70) performanceValue = 3;
    else if(score >= 60) performanceValue = 2;
    else performanceValue = 1;
    
    setPerformance({
      value: performanceValue,
      ratedAt: stringToHex(new Date().toISOString())
    });
    
    setCurrentStep('results');
  }, []);

  return {
    generateArticle,
    generateQuiz,
    calculateResults,
  };
}

