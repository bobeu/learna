/**eslint-disable */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useAccount, useWriteContract } from 'wagmi';
import { ProofOfAssimilation, Performance, CampaignStateProps, FunctionName, Address } from '../../../types';
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';
import { Hex, stringToHex, zeroAddress } from 'viem';
import { filterTransactionData, normalizeString, formatAddr } from '../utilities';
import ArticleReading, { Steps } from './ArticleReading';
import Quiz, { QuizQuestion } from './Quiz';
import Results from './Results';
import TopicSelection, { GeneratedTopic } from './TopicSelection';
import QuizProgressConfirmation from './QuizProgressConfirmation';
import UnsavedProgressIndicator from './UnsavedProgressIndicator';
import SavedProgressDialog from './SavedProgressDialog';
import ContinueOrNewTopicDialog from './components/ContinueOrNewTopicDialog';
import ContinueOrNewArticleDialog from './components/ContinueOrNewArticleDialog';
import QuizExpiryDialog from './components/QuizExpiryDialog';
import {
  saveUnsavedProgress,
  loadUnsavedProgress,
  clearUnsavedProgress,
  isProgressAlreadySaved,
  isProgressOlderThanDays,
  type UnsavedQuizProgress
} from './quizProgressStorage';
import {
  saveAITutorState,
  loadAITutorState,
  clearAITutorState,
  saveQuizState,
  loadQuizState,
  clearQuizState,
  isQuizStateExpired,
  getQuizTimeRemaining,
  type SavedAITutorState
} from './services/aiTutorStorageService';
import { saveCompletedTopic, getCampaignCompletedTopics } from './services/topicStorageService';
import useStorage from '../hooks/useStorage';

interface AITutorProps {
  campaign: CampaignStateProps;
  onClose: () => void;
  initialTopic?: GeneratedTopic;
}

interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
  readingTime: number; // in minutes
}

export default function AITutor({ campaign, onClose, initialTopic }: AITutorProps) {
  const { isPending } = useWriteContract(); 
  const { chainId, address } = useAccount();
  const { campaignsData } = useStorage();
  const userAddress = formatAddr(address);
  
  // State management
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
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  
  // Progress retention state
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSavedProgressDialog, setShowSavedProgressDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [transactionSucceeded, setTransactionSucceeded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Start closed until saved progress is checked
  const [pendingSavedProgress, setPendingSavedProgress] = useState<UnsavedQuizProgress | null>(null);
  
  // New dialog states for user choices
  const [showContinueTopicDialog, setShowContinueTopicDialog] = useState(false);
  const [showContinueArticleDialog, setShowContinueArticleDialog] = useState(false);
  const [showQuizExpiryDialog, setShowQuizExpiryDialog] = useState(false);
  const [savedState, setSavedState] = useState<SavedAITutorState | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [campaignInfo, setCampaignInfo] = useState<string | null>(null);

  // Get saved learner data from blockchain to filter out already saved progress
  const savedLearnerData = useMemo(() => {
    if(!address || !campaignsData) return null;
    const userAddr = userAddress.toLowerCase();
    const campaignData = campaignsData.find(c => 
      c.contractInfo.address.toLowerCase() === campaign.__raw.contractInfo.address.toLowerCase()
    );
    
    if(!campaignData) return null;
    
    // Get learner data from all epochs
    const allPoass: Array<{ score: number; percentage: number; questionSize: number; timeSpent: number }> = [];
    campaignData.epochData.forEach(epoch => {
      const learner = epoch.learners.find(l => l.id.toLowerCase() === userAddr);
      if(learner) {
        learner.poass.forEach(poa => {
          allPoass.push({
            score: poa.score,
            percentage: poa.percentage,
            questionSize: poa.questionSize,
            timeSpent: poa.timeSpent
          });
        });
      }
    });
    
    return allPoass;
  }, [address, campaignsData, campaign, userAddress]);

  // Save AITutor state to localStorage (topics, articles, etc.)
  const saveAITutorStateToStorage = useCallback(() => {
    if(!address || !userAddress || transactionSucceeded) return;
    
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
  }, [address, userAddress, campaign, generatedTopics, selectedTopic, greeting, campaignInfo, article, currentStep, transactionSucceeded]);

  // Save quiz state temporarily (3 minutes)
  const saveQuizStateToStorage = useCallback(() => {
    if(!address || !userAddress || quizzes.length === 0) return;
    
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
  }, [address, userAddress, campaign, quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime]);

  // Save current progress to localStorage (for results page)
  const saveProgress = useCallback(() => {
    if(!address || !userAddress) return;
    
    // Don't save if transaction already succeeded
    if(transactionSucceeded) {
      console.log('Transaction already succeeded, preventing local save');
      return;
    }
    
    // Only save if we're on results page with valid data
    if(currentStep === 'results' && performance && selectedTopic && article) {
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
          value: performance.value,
          ratedAt: typeof performance.ratedAt === 'string' ? performance.ratedAt : ''
        },
        startTime,
        endTime,
        currentStep,
        savedAt: Date.now()
      };
      
      // Check if this progress is already saved on blockchain
      if(!savedLearnerData || !isProgressAlreadySaved(progress, savedLearnerData)) {
        saveUnsavedProgress(userAddress, progress);
        setHasUnsavedData(true);
        // console.log('Progress saved locally');
      } else {
        console.log('Progress already saved on blockchain, skipping local save');
      }
    }
  }, [address, userAddress, currentStep, performance, selectedTopic, article, quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, campaign, savedLearnerData, transactionSucceeded]);
  
  // Auto-save AITutor state when topics, article, or step changes
  useEffect(() => {
    if(isDialogOpen && address && userAddress && (generatedTopics.length > 0 || article || currentStep !== 'topics')) {
      saveAITutorStateToStorage();
    }
  }, [generatedTopics, selectedTopic, article, currentStep, greeting, campaignInfo, isDialogOpen, address, userAddress, saveAITutorStateToStorage]);
  
  // Auto-save quiz state when quiz data changes
  useEffect(() => {
    if(isDialogOpen && address && userAddress && currentStep === 'quiz' && quizzes.length > 0) {
      saveQuizStateToStorage();
    }
  }, [quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, currentStep, isDialogOpen, address, userAddress, saveQuizStateToStorage]);
  
  // Prevent ESC key from closing modal globally
  useEffect(() => {
    if(isDialogOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if(e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      };
      
      // Use capture phase to catch ESC before it reaches Dialog
      document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown, { capture: true });
      };
    }
  }, [isDialogOpen]);

  // Check for saved AITutor state when component mounts
  useEffect(() => {
    if(!address || !userAddress) {
      setIsDialogOpen(true);
      return;
    }
    
    const campaignId = campaign.__raw.contractInfo.index.toString();
    const saved = loadAITutorState(userAddress, campaignId);
    
    if(saved) {
      setSavedState(saved);
      
      // Check if we have saved topics
      if(saved.topics && saved.topics.length > 0) {
        // Check if any topics are completed (should be removed)
        const completedTopics = getCampaignCompletedTopics(userAddress, campaignId);
        const completedTopicIds = new Set(completedTopics.map(t => t.topicId));
        const filteredTopics = saved.topics.filter(t => !completedTopicIds.has(t.id));
        
        if(filteredTopics.length > 0) {
          // Show dialog to continue with saved topics or generate new ones
          setShowContinueTopicDialog(true);
          return;
        }
      }
      
      // Check if we have saved article
      if(saved.article && saved.selectedTopic) {
        // Show dialog to continue reading or choose different topic
        setShowContinueArticleDialog(true);
        return;
      }
    }
    
    // Check for quiz state (temporary - 3 minutes)
    const quizState = loadQuizState(userAddress, campaignId);
    if(quizState && !quizState.isValid) {
      // Quiz expired
      clearQuizState(userAddress, campaignId);
      setShowQuizExpiryDialog(true);
      return;
    } else if(quizState && quizState.isValid) {
      // Quiz still valid, show expiry warning if less than 1 minute remaining
      const timeRemaining = getQuizTimeRemaining(userAddress, campaignId);
      if(timeRemaining > 0 && timeRemaining <= 1) {
        setShowQuizExpiryDialog(true);
        return;
      }
    }
    
    // Check for old unsaved progress (results page)
    const oldProgress = loadUnsavedProgress(userAddress, campaignId);
    if(oldProgress) {
      if(isProgressOlderThanDays(oldProgress, 7)) {
        clearUnsavedProgress(userAddress, campaignId);
      } else if(savedLearnerData && isProgressAlreadySaved(oldProgress, savedLearnerData)) {
        clearUnsavedProgress(userAddress, campaignId);
        setTransactionSucceeded(true);
      } else {
        setPendingSavedProgress(oldProgress);
        setShowSavedProgressDialog(true);
        return;
      }
    }
    
    // No saved state, open dialog normally
    setIsDialogOpen(true);
  }, [address, userAddress, campaign.__raw.contractInfo.index, savedLearnerData]);
  
  // Handle continue with saved topics
  const handleContinueWithSavedTopics = useCallback(() => {
    if(!savedState) return;
    
    setGeneratedTopics(savedState.topics || []);
    if(savedState.selectedTopic) {
      setSelectedTopic(savedState.selectedTopic);
    }
    if(savedState.greeting) {
      setGreeting(savedState.greeting);
    }
    if(savedState.campaignInfo) {
      setCampaignInfo(savedState.campaignInfo);
    }
    if(savedState.currentStep) {
      setCurrentStep(savedState.currentStep);
    }
    
    setShowContinueTopicDialog(false);
    setIsDialogOpen(true);
  }, [savedState]);
  
  // Handle generate new topics
  const handleGenerateNewTopics = useCallback(() => {
    if(!savedState || !address || !userAddress) {
      setShowContinueTopicDialog(false);
      setIsDialogOpen(true);
      return;
    }
    
    // Merge new topics with saved ones (avoid duplicates)
    const campaignId = campaign.__raw.contractInfo.index.toString();
    const existingTopicIds = new Set((savedState.topics || []).map(t => t.id));
    
    // Generate new topics will be added to state, and we'll merge them
    setShowContinueTopicDialog(false);
    setIsDialogOpen(true);
    // Topics will be generated by user action
  }, [savedState, address, userAddress, campaign]);
  
  // Handle continue with saved article
  const handleContinueWithSavedArticle = useCallback(() => {
    if(!savedState || !savedState.article) return;
    
    setArticle(savedState.article);
    if(savedState.selectedTopic) {
      setSelectedTopic(savedState.selectedTopic);
    }
    if(savedState.currentStep) {
      setCurrentStep(savedState.currentStep);
    }
    
    setShowContinueArticleDialog(false);
    setIsDialogOpen(true);
  }, [savedState]);
  
  // Handle choose different topic
  const handleChooseDifferentTopic = useCallback(() => {
    if(!savedState || !address || !userAddress) {
      setShowContinueArticleDialog(false);
      setCurrentStep('topics');
      setIsDialogOpen(true);
      return;
    }
    
    // Load saved topics if available
    if(savedState.topics && savedState.topics.length > 0) {
      setGeneratedTopics(savedState.topics);
      if(savedState.greeting) {
        setGreeting(savedState.greeting);
      }
      if(savedState.campaignInfo) {
        setCampaignInfo(savedState.campaignInfo);
      }
    }
    
    setShowContinueArticleDialog(false);
    setCurrentStep('topics');
    setIsDialogOpen(true);
  }, [savedState, address, userAddress]);
  
  // Handle quiz expiry dialog
  const handleRegenerateSameTopic = useCallback(() => {
    if(!selectedTopic || !article) return;
    
    clearQuizState(userAddress, campaign.__raw.contractInfo.index.toString());
    setShowQuizExpiryDialog(false);
    setCurrentStep('quiz');
    setIsDialogOpen(true);
    // Regenerate quiz will be triggered
  }, [selectedTopic, article, userAddress, campaign]);
  
  const handleChooseDifferentTopicForQuiz = useCallback(() => {
    clearQuizState(userAddress, campaign.__raw.contractInfo.index.toString());
    setShowQuizExpiryDialog(false);
    setCurrentStep('topics');
    setQuizzes([]);
    setUserAnswers([]);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setIsDialogOpen(true);
  }, [userAddress, campaign]);

  // Handle user's decision to continue with saved progress
  const handleContinueWithSavedProgress = useCallback(() => {
    if(!pendingSavedProgress) return;
    
    const saved = pendingSavedProgress;
    
    // Restore the saved progress
    if(saved.topic) {
      setSelectedTopic(saved.topic as GeneratedTopic);
    }
    if(saved.article) {
      setArticle(saved.article);
    }
    if(saved.quizzes.length > 0) {
      setQuizzes(saved.quizzes);
    }
    if(saved.userAnswers.length > 0) {
      setUserAnswers(saved.userAnswers);
      setCurrentQuizIndex(saved.currentQuizIndex);
    }
    if(saved.quizScore > 0) {
      setQuizScore(saved.quizScore);
    }
    if(saved.performance) {
      setPerformance({
        value: saved.performance.value,
        ratedAt: stringToHex(saved.performance.ratedAt || new Date().toISOString())
      });
    }
    if(saved.startTime) {
      setStartTime(saved.startTime);
    }
    if(saved.endTime) {
      setEndTime(saved.endTime);
    }
    if(saved.currentStep) {
      setCurrentStep(saved.currentStep);
    }
    
    setHasUnsavedData(true);
    setPendingSavedProgress(null);
    setShowSavedProgressDialog(false);
    setIsDialogOpen(true); // Open main dialog after restoring progress
  }, [pendingSavedProgress]);

  // Handle user's decision to discard saved progress
  const handleDiscardSavedProgress = useCallback(() => {
    if(!address || !userAddress || !pendingSavedProgress) return;
    
    clearUnsavedProgress(userAddress, campaign.__raw.contractInfo.index.toString());
    setPendingSavedProgress(null);
    setShowSavedProgressDialog(false);
    setIsDialogOpen(true); // Open main dialog after discarding
  }, [address, userAddress, pendingSavedProgress, campaign.__raw.contractInfo.index]);

  // Auto-save progress when quiz results are calculated
  // saveProgress already checks if data is on blockchain before saving
  useEffect(() => {
    if(currentStep === 'results' && performance && selectedTopic && article) {
      saveProgress();
    }
  }, [currentStep, performance, selectedTopic, article, saveProgress]);

  // Handle explicit close button click (only way to close modal)
  const handleExplicitClose = useCallback(() => {
    // ALWAYS save current state before closing
    if(address && userAddress) {
      // Save AITutor state (topics, articles, etc.)
      if(generatedTopics.length > 0 || article || currentStep !== 'topics') {
        saveAITutorStateToStorage();
      }
      
      // If on quiz step, save quiz state (temporary - 3 minutes)
      if(currentStep === 'quiz' && quizzes.length > 0) {
        saveQuizStateToStorage();
      }
      
      // If on results page, save progress
      if(currentStep === 'results' && performance && selectedTopic && article && !transactionSucceeded) {
        saveProgress();
      }
    }
    
    // If on results page with unsaved data, show confirmation
    if(currentStep === 'results' && performance && selectedTopic && article && !transactionSucceeded && hasUnsavedData) {
      setShowConfirmationDialog(true);
      setPendingClose(true);
      return;
    }
    
    // Close the modal
    onClose();
  }, [address, userAddress, hasUnsavedData, currentStep, onClose, performance, selectedTopic, article, transactionSucceeded, saveProgress, generatedTopics, saveAITutorStateToStorage, quizzes, saveQuizStateToStorage]);
  
  // Prevent accidental closing - only allow explicit close button
  const handleDialogClose = useCallback((open: boolean) => {
    // ALWAYS prevent closing on outside click or ESC - only allow explicit close button
    if(!open) {
      // Prevent closing - user must use explicit close button
      // Force dialog to stay open
      setIsDialogOpen(true);
      return;
    }
    // Only allow opening, not closing
    setIsDialogOpen(open);
    setPendingClose(false);
  }, []);

  // Handle save and close
  const handleSaveAndClose = useCallback(() => {
    saveProgress();
    setShowConfirmationDialog(false);
    setPendingClose(false);
    setHasUnsavedData(false);
    onClose();
  }, [saveProgress, onClose]);

  // Handle discard
  const handleDiscard = useCallback(() => {
    if(address && userAddress) {
      clearUnsavedProgress(userAddress, campaign.__raw.contractInfo.index.toString());
    }
    setShowConfirmationDialog(false);
    setPendingClose(false);
    setHasUnsavedData(false);
    onClose();
  }, [address, userAddress, campaign.__raw.contractInfo.index, onClose]);

  // Generate topics based on campaign
  const generateTopics = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaignName: campaign.name,
          campaignDescription: campaign.description 
        }),
      });
      
      if(response.ok) {
        const newTopics = await response.json();
        
        // Merge with saved topics (avoid duplicates)
        if(savedState && savedState.topics && savedState.topics.length > 0) {
          const existingTopicIds = new Set(savedState.topics.map(t => t.id));
          const uniqueNewTopics = newTopics.filter((t: GeneratedTopic) => !existingTopicIds.has(t.id));
          setGeneratedTopics([...savedState.topics, ...uniqueNewTopics]);
        } else {
          setGeneratedTopics(newTopics);
        }
      } else {
        console.log("response", response)
        // Fallback to mock topics
        const mockTopics = [
          {
            id: '1',
            title: `${campaign.name} Fundamentals`,
            description: 'Learn the basic concepts and principles',
            difficulty: 'easy'
          },
          {
            id: '2',
            title: `Advanced ${campaign.name} Concepts`,
            description: 'Dive deeper into complex implementations',
            difficulty: 'medium'
          },
          {
            id: '3',
            title: `${campaign.name} Best Practices`,
            description: 'Industry standards and optimization techniques',
            difficulty: 'hard'
          }
        ];
        
        // Merge with saved topics
        if(savedState && savedState.topics && savedState.topics.length > 0) {
          const existingTopicIds = new Set(savedState.topics.map(t => t.id));
          const uniqueMockTopics = mockTopics.filter((t: GeneratedTopic) => !existingTopicIds.has(t.id));
          setGeneratedTopics([...savedState.topics, ...uniqueMockTopics]);
        } else {
          setGeneratedTopics(mockTopics);
        }
      }
    } catch (error) {
      console.error('Failed to generate topics:', error);
      // Use fallback topics
      const mockTopics = [
        {
          id: '1',
          title: `${campaign.name} Fundamentals`,
          description: 'Learn the basic concepts and principles',
          difficulty: 'easy'
        }
      ];
      
      // Merge with saved topics
      if(savedState && savedState.topics && savedState.topics.length > 0) {
        const existingTopicIds = new Set(savedState.topics.map(t => t.id));
        const uniqueMockTopics = mockTopics.filter((t: GeneratedTopic) => !existingTopicIds.has(t.id));
        setGeneratedTopics([...savedState.topics, ...uniqueMockTopics]);
      } else {
        setGeneratedTopics(mockTopics);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate article based on selected topic
  const generateArticle = useCallback(async (topic: GeneratedTopic) => {
    setIsGenerating(true);
    setStartTime(Date.now());
    
    // Timeout is handled at API route level (90s) and service level (60s for articles)
    // No need for client-side timeout that could cause app malfunctions
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic.title,
          campaignName: campaign.name,
          maxWords: 500 // Reduced from 700 for faster generation
        }),
      });
      
      if(response.ok) {
        try {
          const articleData = await response.json();
          // Check if it's a fallback article
          if (articleData._fallback) {
            console.warn('Using fallback article due to API error:', articleData._error);
          }
          setArticle(articleData);
        } catch (parseError) {
          // Silently handle JSON parse errors
          console.warn('Failed to parse article response, using fallback');
          setArticle({
            title: topic.title,
            content: `# ${topic.title}\n\nThis is a comprehensive guide to ${topic.title}. ${topic.description}\n\n## Key Concepts\n\nUnderstanding the fundamentals is crucial for mastering this topic.\n\n## Practical Applications\n\nReal-world examples and use cases demonstrate the practical value of this knowledge.\n\n## Advanced Techniques\n\nFor those looking to go beyond the basics, advanced techniques provide deeper insights.\n\n## Conclusion\n\nMastering ${topic.title} opens up numerous opportunities in the field.`,
            wordCount: 500,
            readingTime: 4,
          });
        }
      } else {
        // Silently handle non-OK responses with fallback
        try {
          await response.json().catch(() => ({}));
        } catch {
          // Ignore error parsing error response
        }
        setArticle({
          title: topic.title,
          content: `# ${topic.title}\n\nThis is a comprehensive guide to ${topic.title}. ${topic.description}\n\n## Key Concepts\n\nUnderstanding the fundamentals is crucial for mastering this topic.\n\n## Practical Applications\n\nReal-world examples and use cases demonstrate the practical value of this knowledge.\n\n## Advanced Techniques\n\nFor those looking to go beyond the basics, advanced techniques provide deeper insights.\n\n## Conclusion\n\nMastering ${topic.title} opens up numerous opportunities in the field.`,
          wordCount: 500,
          readingTime: 4,
        });
      }
    } catch (error: unknown) {
      // Silently handle all errors with fallback - don't let errors break the app
      // Errors are already logged at API/service level, no need to log here
      setArticle({
        title: topic.title,
        content: `# ${topic.title}\n\nThis is a comprehensive guide to ${topic.title}. ${topic.description}\n\n## Key Concepts\n\nUnderstanding the fundamentals is crucial for mastering this topic.\n\n## Practical Applications\n\nReal-world examples and use cases demonstrate the practical value of this knowledge.\n\n## Advanced Techniques\n\nFor those looking to go beyond the basics, advanced techniques provide deeper insights.\n\n## Conclusion\n\nMastering ${topic.title} opens up numerous opportunities in the field.`,
        wordCount: 500,
        readingTime: 4,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [campaign.name]);

  // Auto-generate article if initialTopic is provided
  useEffect(() => {
    if (initialTopic && !article && currentStep === 'article' && selectedTopic) {
      generateArticle(selectedTopic);
    }
  }, [initialTopic, article, currentStep, selectedTopic, generateArticle]);

  // Generate quiz based on article
  const generateQuiz = async () => {
    if(!article) return;
    
    // Check for saved quiz state first (if within 3 minutes)
    if(address && userAddress) {
      const campaignId = campaign.__raw.contractInfo.index.toString();
      const savedQuizState = loadQuizState(userAddress, campaignId);
      
      if(savedQuizState && savedQuizState.isValid) {
        // Restore saved quiz state
        setQuizzes(savedQuizState.quizzes);
        setUserAnswers(savedQuizState.userAnswers);
        setCurrentQuizIndex(savedQuizState.currentQuizIndex);
        setQuizScore(savedQuizState.quizScore);
        setStartTime(savedQuizState.startTime);
        setEndTime(savedQuizState.endTime);
        setCurrentStep('quiz');
        return;
      } else if(savedQuizState && !savedQuizState.isValid) {
        // Quiz expired, clear it
        clearQuizState(userAddress, campaignId);
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
        console.log("response", response);
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
  };

  // Calculate quiz score and performance
  const calculateResults = () => {
    setEndTime(Date.now());
  
    let correctAnswers = 0; 
    const quizSize = quizzes.length;
    userAnswers.forEach((answer, index) => {
      if(answer === quizzes[index].correctAnswer) {
        correctAnswers++;
      }
    });
    const score = quizSize > 0? Math.round((correctAnswers / quizSize) * 100) : 0;
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
  };

  // Prepare data for on-chain storage
  const prepareOnChainData = () => {
    if(!performance || !selectedTopic || !article) return null;
    let timeSpent = 0;
    const timeDiff = endTime - startTime;
    if(timeDiff > 0) {
      timeSpent = Math.floor(timeDiff / 1000); // in seconds
    }
    
    const proofOfAssimilation: ProofOfAssimilation = {
      questionSize: quizzes.length,
      score: quizScore,
      totalPoints: quizzes.length * 10, // 10 points per question
      percentage: quizScore,
      timeSpent,
      completedAt: stringToHex(Date.now().toString())
    };
    
    return { proofOfAssimilation, performance };
  };

  // Create transaction steps for on-chain storage
  const createTransactionSteps = (): TransactionStep[] => {
    const data = prepareOnChainData();
    if(!data) return [{
      id: 'null', 
      title: 'null',
      description: 'Data unavailable', 
      functionName: 'allowance', 
      contractAddress: zeroAddress,
      abi: [],
      args: []
    }];
    const { transactionData: td } = filterTransactionData({chainId, filter: true, functionNames: ['proveAssimilation']})
    
    return [{
      id: 'prove-assimilation',
      title: 'Store Proof of Learning',
      description: 'Storing your quiz results and performance rating on-chain',
      functionName: td[0].functionName as FunctionName,
      contractAddress: td[0].contractAddress as Address,
      abi: td[0].abi,
      args: [data.proofOfAssimilation, data.performance, campaign.__raw.contractInfo.index],
    }];
  };

  const handleStoreOnChain = () => {
    const steps = createTransactionSteps();
    if(steps.length === 0) {
      alert('No data to store');
      return;
    }
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = useCallback((txHash: string) => {
    console.log('Proof of assimilation stored:', txHash);
    setShowTransactionModal(false);
    
    // Mark transaction as succeeded to prevent future saves
    setTransactionSucceeded(true);
    
    // Save completed topic to localStorage after successful quiz completion
    if(address && userAddress && selectedTopic && performance) {
      const campaignId = campaign.__raw.contractInfo.index.toString();
      const campaignAddress = campaign.__raw.contractInfo.address;
      
      saveCompletedTopic(userAddress, {
        campaignId,
        campaignAddress,
        topicId: selectedTopic.id,
        topicTitle: selectedTopic.title,
        topicDescription: selectedTopic.description,
        difficulty: selectedTopic.difficulty,
        completedAt: Date.now(),
      });
      
      // Remove completed topic from saved AITutor state
      const saved = loadAITutorState(userAddress, campaignId);
      if(saved && saved.topics) {
        const filteredTopics = saved.topics.filter(t => t.id !== selectedTopic.id);
        if(filteredTopics.length !== saved.topics.length) {
          const updatedState: SavedAITutorState = {
            ...saved,
            topics: filteredTopics,
            selectedTopic: saved.selectedTopic?.id === selectedTopic.id ? null : saved.selectedTopic
          };
          saveAITutorState(userAddress, updatedState);
        }
      }
    }
    
    // Clear saved progress from localStorage since it's now on blockchain
    // This should only happen on successful transaction completion
    if(address && userAddress) {
      const campaignId = campaign.__raw.contractInfo.index.toString();
      clearUnsavedProgress(userAddress, campaignId);
      setHasUnsavedData(false);
      
      // Verify the data was actually cleared
      const remainingData = loadUnsavedProgress(userAddress, campaignId);
      if(remainingData) {
        console.warn('Failed to clear unsaved progress, attempting again...');
        clearUnsavedProgress(userAddress, campaignId);
      }
      
      console.log('Successfully cleared unsaved progress after on-chain storage');
    }
    
    // Reset any pending close states
    setPendingClose(false);
    setShowConfirmationDialog(false);
    
    // Close the AITutor modal immediately after successful transaction
    // Use a small delay to ensure transaction modal closes smoothly first
    setTimeout(() => {
      onClose();
    }, 500);
  }, [address, userAddress, campaign, selectedTopic, performance, onClose]);

  const handleTransactionError = useCallback((error: Error) => {
    console.error('Failed to store proof:', error);
    
    // Transaction failed, so save progress locally to prevent data loss
    // This ensures user can retry later without losing their progress
    if(address && userAddress && currentStep === 'results' && performance && selectedTopic && article) {
      console.log('Transaction failed, saving progress locally for retry...');
      saveProgress();
      
      // Show confirmation that progress was saved
      setHasUnsavedData(true);
    }
    
    // Don't close the modal on error, let user retry
    setShowTransactionModal(false);
  }, [address, userAddress, currentStep, performance, selectedTopic, article, saveProgress]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceRating = (value: number) => {
    switch (value) {
      case 5: return { text: 'Excellent', color: 'text-green-600' };
      case 4: return { text: 'Very Good', color: 'text-blue-600' };
      case 3: return { text: 'Good', color: 'text-yellow-600' };
      case 2: return { text: 'Fair', color: 'text-orange-600' };
      case 1: return { text: 'Needs Improvement', color: 'text-red-600' };
      default: return { text: 'Not Rated', color: 'text-gray-600' };
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen && !pendingClose} onOpenChange={handleDialogClose} modal={true}>
        <DialogContent 
          className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-surface left-4 right-4 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] top-[50%] translate-y-[-50%] mx-0"
          hideCloseButton={true}
          onInteractOutside={(e) => {
            // Prevent closing on outside click - CRITICAL: never allow outside click to close
            e.preventDefault();
            e.stopPropagation();
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing on ESC key - CRITICAL: never allow ESC to close
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-gray-900 dark:text-white">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 flex-shrink-0" />
                <span className="text-base sm:text-lg font-semibold break-words min-w-0">
                  Learna Tutor - {normalizeString(campaign.name as Hex)}
                </span>
              </div>
              <button
                onClick={handleExplicitClose}
                className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-500 dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[state=open]:bg-neutral-800 dark:data-[state=open]:text-neutral-400 p-1 z-50"
                aria-label="Close"
                type="button"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Learn with our intelligent AI-powered tutor and prove your knowledge of a subject
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
            {/* Step 1: Topic Selection */}
            {currentStep === 'topics' && (
              <TopicSelection 
                generateArticle={generateArticle}
                generateTopics={generateTopics}
                generatedTopics={generatedTopics}
                getDifficultyColor={getDifficultyColor}
                isGenerating={isGenerating}
                setCurrentStep={setCurrentStep}
                setSelectedTopic={setSelectedTopic}
              />
            )}

            {/* Step 2: Article Reading */}
            {
              currentStep === 'article' && (
                <ArticleReading 
                  articleContent={article?.content}
                  articleTitle={article?.title}
                  generateQuiz={generateQuiz}
                  isArticleReady={article !== null}
                  isGenerating={isGenerating}
                  readingTime={article?.readingTime}
                  setCurrentStep={setCurrentStep}
                  selectedTopicTitle={selectedTopic?.title}
                />
            )}

            {/* Step 3: Quiz */}
            {currentStep === 'quiz' && isGenerating && quizzes.length === 0 && (
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
            )}
            
            {currentStep === 'quiz' && quizzes.length > 0 && (
              <Quiz 
                calculateResults={calculateResults}
                currentQuizIndex={currentQuizIndex}
                quizzes={quizzes}
                setCurrentQuizIndex={setCurrentQuizIndex}
                setUserAnswers={setUserAnswers}
                userAnswers={userAnswers}
              />
            )}

            {/* Step 4: Results */}
            {currentStep === 'results' && performance && (
              <Results 
                handleStoreOnChain={handleStoreOnChain}
                isPending={isPending}
                onClose={onClose}
                performanceRating={getPerformanceRating(performance.value).text}
                performanceValue={performance.value}
                quizScore={quizScore}
                quizSize={quizzes.length}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Store Proof of Learning"
        description="Storing your quiz results and performance rating on the blockchain"
        getSteps={createTransactionSteps}
        onSuccess={handleTransactionSuccess}
        onError={handleTransactionError}
      />

      <QuizProgressConfirmation
        isOpen={showConfirmationDialog}
        onClose={() => {
          setShowConfirmationDialog(false);
          setPendingClose(false);
        }}
        onSaveAndClose={handleSaveAndClose}
        onDiscard={handleDiscard}
      />

      <SavedProgressDialog
        isOpen={showSavedProgressDialog}
        onContinue={handleContinueWithSavedProgress}
        onDiscard={handleDiscardSavedProgress}
        quizScore={pendingSavedProgress?.quizScore || 0}
        performanceValue={pendingSavedProgress?.performance?.value || 0}
        savedAt={pendingSavedProgress?.savedAt || Date.now()}
      />

      <ContinueOrNewTopicDialog
        isOpen={showContinueTopicDialog}
        savedTopics={savedState?.topics || []}
        onContinue={handleContinueWithSavedTopics}
        onNewTopics={handleGenerateNewTopics}
      />

      <ContinueOrNewArticleDialog
        isOpen={showContinueArticleDialog}
        articleTitle={savedState?.article?.title || ''}
        onContinue={handleContinueWithSavedArticle}
        onDifferentTopic={handleChooseDifferentTopic}
      />

      <QuizExpiryDialog
        isOpen={showQuizExpiryDialog}
        timeRemaining={address && userAddress ? getQuizTimeRemaining(userAddress, campaign.__raw.contractInfo.index.toString()) : 0}
        isExpired={address && userAddress ? isQuizStateExpired(userAddress, campaign.__raw.contractInfo.index.toString()) : false}
        onRegenerateSame={handleRegenerateSameTopic}
        onDifferentTopic={handleChooseDifferentTopicForQuiz}
      />

      {hasUnsavedData && performance && quizScore > 0 && !transactionSucceeded && (
        <UnsavedProgressIndicator
          campaignName={normalizeString(campaign.name as Hex)}
          quizScore={quizScore}
          performanceValue={performance.value}
          onDismiss={() => {
            if(address && userAddress) {
              clearUnsavedProgress(userAddress, campaign.__raw.contractInfo.index.toString());
            }
            setHasUnsavedData(false);
          }}
          onClick={() => {
            // Reopen the dialog by setting pendingClose to false and ensuring dialog is open
            setPendingClose(false);
            setShowConfirmationDialog(false);
            setIsDialogOpen(true);
            // Ensure we're on the results page when reopening
            if(currentStep !== 'results') {
              setCurrentStep('results');
            }
          }}
        />
      )}
    </>
  );
}
