/**eslint-disable */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAccount, useWriteContract } from 'wagmi';
import { ProofOfAssimilation, Performance, CampaignStateProps, FunctionName, Address } from '../../../types';
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';
import { Hex, stringToHex, zeroAddress } from 'viem';
import { filterTransactionData, normalizeString, formatAddr } from '../utilities';
import { Steps } from './ArticleReading';
import { QuizQuestion } from './Quiz';
import { GeneratedTopic } from './TopicSelection';
import EnhancedTopicSection from './sections/EnhancedTopicSection';
import ArticleSection from './sections/ArticleSection';
import QuizSection from './sections/QuizSection';
import ResultsSection from './sections/ResultsSection';
import QuizProgressConfirmation from './QuizProgressConfirmation';
import UnsavedProgressIndicator from './UnsavedProgressIndicator';
import SavedProgressDialog from './SavedProgressDialog';
import ContinueOrNewTopicDialog from './components/ContinueOrNewTopicDialog';
import ContinueOrNewArticleDialog from './components/ContinueOrNewArticleDialog';
import QuizExpiryDialog from './components/QuizExpiryDialog';
import TopicValidationDialog from './components/TopicValidationDialog';
import CompletedTopicDialog from './components/CompletedTopicDialog';
import { generateTopicsWithGreeting } from './services/topicGenerationService';
import { validateCustomTopic } from './services/topicValidationService';
import { isTopicCompleted, type CompletedTopic } from './services/topicStorageService';
import { firebaseService } from '@/lib/firebaseService';
import { useFirebaseProgressTracking } from './hooks/useFirebaseProgressTracking';
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
  const isValidAddress = userAddress !== zeroAddress;
  
  // State management
  const [currentStep, setCurrentStep] = useState<Steps>(initialTopic ? 'article' : 'topics');
  const [selectedTopic, setSelectedTopic] = useState<GeneratedTopic | null>(initialTopic || null);
  
  // Firebase progress tracking (initialized after selectedTopic state)
  const campaignId = campaign.__raw?.contractInfo?.index?.toString() || '';
  const { 
    markArticleCompleted, 
    markQuizCompleted, 
    trackTopicAccess 
  } = useFirebaseProgressTracking({
    walletAddress: userAddress,
    campaignId,
    topicId: selectedTopic?.id || '',
  });
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
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [savedState, setSavedState] = useState<SavedAITutorState | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [campaignInfo, setCampaignInfo] = useState<string | null>(null);
  const [isCheckingSavedTopics, setIsCheckingSavedTopics] = useState(true); // Show loading while checking
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [pendingCustomTopic, setPendingCustomTopic] = useState<string>('');
  const [completedTopicData, setCompletedTopicData] = useState<CompletedTopic | null>(null);

  // Get saved learner data from blockchain to filter out already saved progress
  const savedLearnerData = useMemo(() => {
    if(!isValidAddress || !campaignsData) return null;
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
  }, [isValidAddress, campaignsData, campaign, userAddress]);

  // Save AITutor state to localStorage (topics, articles, etc.)
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
  }, [isValidAddress, userAddress, campaign, generatedTopics, selectedTopic, greeting, campaignInfo, article, currentStep, transactionSucceeded]);

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
  }, [isValidAddress, userAddress, campaign, quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime]);

  // Save current progress to localStorage (for results page)
  const saveProgress = useCallback(() => {
    if(!isValidAddress) return;
    
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
  }, [isValidAddress, userAddress, currentStep, performance, selectedTopic, article, quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, campaign, savedLearnerData, transactionSucceeded]);

  // Auto-save AITutor state IMMEDIATELY when topics, article, or step changes - even if dialog closes
  useEffect(() => {
    if(isValidAddress && (generatedTopics.length > 0 || article || currentStep !== 'topics')) {
      saveAITutorStateToStorage();
    }
  }, [generatedTopics, selectedTopic, article, currentStep, greeting, campaignInfo, isValidAddress, saveAITutorStateToStorage]);
  
  // Auto-save quiz state IMMEDIATELY when quiz data changes - even if dialog closes
  useEffect(() => {
    if(isValidAddress && currentStep === 'quiz' && quizzes.length > 0) {
      saveQuizStateToStorage();
    }
  }, [quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, currentStep, isValidAddress, saveQuizStateToStorage]);
  
  // Check for completed topics when topics are generated - defined early for use in generateTopics
  const checkCompletedTopics = useCallback((generatedTopics: GeneratedTopic[]) => {
    if(!address || !userAddress || generatedTopics.length === 0) return null;
    const campaignId = campaign.__raw.contractInfo.index.toString();
    for (const topic of generatedTopics) {
      const completed = isTopicCompleted(userAddress, campaignId, topic.title);
      if(completed) {
        return completed;
      }
    }
    return null;
  }, [address, userAddress, campaign]);

  // Generate topics based on campaign (with greeting) - defined early for use in useEffect
  const generateTopics = useCallback(async () => {
    setIsGenerating(true);
    try {
      const campaignName = normalizeString(campaign.name as Hex);
      const campaignDesc = normalizeString(campaign.description as Hex);

      const response = await generateTopicsWithGreeting(campaignName, campaignDesc);
      
      setGreeting(response.greeting);
      setCampaignInfo(response.campaignInfo);
      
      // Merge with existing topics
      const existingTopicTitles = new Set(generatedTopics.map(t => t.title.toLowerCase()));
      const newTopics = response.topics.filter(t => !existingTopicTitles.has(t.title.toLowerCase()));
      
      if(newTopics.length > 0) {
        const mergedTopics = [...generatedTopics, ...newTopics];
        setGeneratedTopics(mergedTopics);
        
        // Check for completed topics after generation
        const completed = checkCompletedTopics(mergedTopics);
        if(completed) {
          setCompletedTopicData(completed);
          setShowCompletedDialog(true);
        }
      } else if(response.topics.length > 0) {
        // If all topics already exist, still check for completed
        const completed = checkCompletedTopics(response.topics);
        if(completed) {
          setCompletedTopicData(completed);
          setShowCompletedDialog(true);
        }
      }
    } catch (error) {
      console.error('Error generating topics:', error);
      // Error is handled, topics will remain empty and user can retry
    } finally {
      setIsGenerating(false);
    }
  }, [campaign, generatedTopics, checkCompletedTopics]);
  
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

  // Check for saved AITutor state when component mounts - MUST happen BEFORE topic generation
  useEffect(() => {
    // Start with checking state
    setIsCheckingSavedTopics(true);
    
    // Small delay to show "searching" state
    const checkSavedState = async () => {
      await new Promise(resolve => setTimeout(resolve, 300)); // Show loading for 300ms
      
      if(!isValidAddress) {
        setIsCheckingSavedTopics(false);
      setIsDialogOpen(true);
      return;
    }
    
      const campaignId = campaign.__raw.contractInfo.index.toString();
      const saved = loadAITutorState(userAddress, campaignId);
      
      if(saved) {
        setSavedState(saved);
        
        // PRIORITY 1: Check if we have saved topics - load them FIRST, skip generation
        if(saved.topics && saved.topics.length > 0) {
          // Check if any topics are completed (should be removed)
          const completedTopics = getCampaignCompletedTopics(userAddress, campaignId);
          const completedTopicIds = new Set(completedTopics.map(t => t.topicId));
          const filteredTopics = saved.topics.filter(t => !completedTopicIds.has(t.id));
          
          if(filteredTopics.length > 0) {
            // Load saved topics immediately - user will see them after dialog choice
            setGeneratedTopics(filteredTopics);
            if(saved.greeting) setGreeting(saved.greeting);
            if(saved.campaignInfo) setCampaignInfo(saved.campaignInfo);
            
            setIsCheckingSavedTopics(false);
            // Show dialog to continue with saved topics or generate new ones
            setShowContinueTopicDialog(true);
            return; // CRITICAL: Don't open main dialog yet, wait for user choice
          }
        }
        
        // PRIORITY 2: Check if we have saved article
        if(saved.article && saved.selectedTopic) {
          // Load saved article immediately
          setArticle(saved.article);
          setSelectedTopic(saved.selectedTopic);
          if(saved.topics && saved.topics.length > 0) {
            setGeneratedTopics(saved.topics);
          }
          if(saved.greeting) setGreeting(saved.greeting);
          if(saved.campaignInfo) setCampaignInfo(saved.campaignInfo);
          if(saved.currentStep) setCurrentStep(saved.currentStep);
          
          setIsCheckingSavedTopics(false);
          // Show dialog to continue reading or choose different topic
          setShowContinueArticleDialog(true);
          return; // CRITICAL: Don't open main dialog yet, wait for user choice
        }
      }
      
      // PRIORITY 3: Check for quiz state (temporary - 3 minutes)
      const quizState = loadQuizState(userAddress, campaignId);
      if(quizState && !quizState.isValid) {
        // Quiz expired - clear it and ask user what to do
        clearQuizState(userAddress, campaignId);
        setIsCheckingSavedTopics(false);
        setShowQuizExpiryDialog(true);
        return; // Don't open main dialog yet
      } else if(quizState && quizState.isValid) {
        // Quiz still valid - restore it
        setQuizzes(quizState.quizzes);
        setUserAnswers(quizState.userAnswers);
        setCurrentQuizIndex(quizState.currentQuizIndex);
        setQuizScore(quizState.quizScore);
        setStartTime(quizState.startTime);
        setEndTime(quizState.endTime);
        setCurrentStep('quiz');
        
        setIsCheckingSavedTopics(false);
        setIsDialogOpen(true); // Open dialog with restored quiz
        
        // Show expiry warning if less than 1 minute remaining
        const timeRemaining = getQuizTimeRemaining(userAddress, campaignId);
        if(timeRemaining > 0 && timeRemaining <= 1) {
          setShowQuizExpiryDialog(true);
          return;
        }
      return;
    }
    
      // PRIORITY 4: Check for old unsaved progress (results page)
      const oldProgress = loadUnsavedProgress(userAddress, campaignId);
      if(oldProgress) {
        if(isProgressOlderThanDays(oldProgress, 7)) {
          clearUnsavedProgress(userAddress, campaignId);
        } else if(savedLearnerData && isProgressAlreadySaved(oldProgress, savedLearnerData)) {
          clearUnsavedProgress(userAddress, campaignId);
          setTransactionSucceeded(true);
        } else {
          setIsCheckingSavedTopics(false);
          setPendingSavedProgress(oldProgress);
          setShowSavedProgressDialog(true);
          return; // Don't open main dialog yet
        }
      }
      
      // No saved state, open dialog normally
      setIsCheckingSavedTopics(false);
      setIsDialogOpen(true);
    };
    
    checkSavedState();
  }, [isValidAddress, userAddress, campaign.__raw.contractInfo.index, savedLearnerData, initialTopic]);
  
  // Handle continue with saved topics
  const handleContinueWithSavedTopics = useCallback(() => {
    if(!savedState) return;
    
    // Topics are already loaded in the useEffect, just open the dialog
    setShowContinueTopicDialog(false);
    setIsDialogOpen(true);
    setIsCheckingSavedTopics(false);
  }, [savedState]);
  
  // Handle generate new topics - user wants to generate new topics instead of using saved ones
  const handleGenerateNewTopics = useCallback(async () => {
    setShowContinueTopicDialog(false);
    setIsDialogOpen(true);
    setIsCheckingSavedTopics(false);
    // Generate new topics (will merge with saved ones)
    await generateTopics();
  }, [generateTopics]);
  
  // Handle continue with saved article
  const handleContinueWithSavedArticle = useCallback(() => {
    if(!savedState || !savedState.article) return;
    
    // Article is already loaded in the useEffect, just open the dialog
    setShowContinueArticleDialog(false);
    setIsDialogOpen(true);
    setIsCheckingSavedTopics(false);
  }, [savedState]);
  
  // Handle choose different topic
  const handleChooseDifferentTopic = useCallback(() => {
    if(!savedState || !isValidAddress) {
      setShowContinueArticleDialog(false);
      setCurrentStep('topics');
      setIsDialogOpen(true);
      setIsCheckingSavedTopics(false);
      return;
    }
    
    // Topics are already loaded in the useEffect if available
    setShowContinueArticleDialog(false);
    setCurrentStep('topics');
    setIsDialogOpen(true);
    setIsCheckingSavedTopics(false);
  }, [savedState, isValidAddress]);
  
  // Handle quiz expiry dialog
  const handleRegenerateSameTopic = useCallback(() => {
    if(!selectedTopic || !article) return;
    
    clearQuizState(userAddress, campaign.__raw.contractInfo.index.toString());
    setShowQuizExpiryDialog(false);
    setCurrentStep('quiz');
    setIsDialogOpen(true);
    setIsCheckingSavedTopics(false);
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
    setIsCheckingSavedTopics(false);
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
    setIsCheckingSavedTopics(false);
  }, [pendingSavedProgress]);

  // Handle user's decision to discard saved progress
  const handleDiscardSavedProgress = useCallback(() => {
    if(!isValidAddress || !pendingSavedProgress) return;
    
    clearUnsavedProgress(userAddress, campaign.__raw.contractInfo.index.toString());
    setPendingSavedProgress(null);
    setShowSavedProgressDialog(false);
    setIsDialogOpen(true); // Open main dialog after discarding
    setIsCheckingSavedTopics(false);
  }, [isValidAddress, userAddress, pendingSavedProgress, campaign.__raw.contractInfo.index]);

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


  // Handle custom topic validation
  const handleCustomTopicValidate = useCallback(async (topicTitle: string) => {
    setIsValidating(true);
    setPendingCustomTopic(topicTitle);

    try {
      const campaignName = normalizeString(campaign.name as Hex);
      const campaignDesc = normalizeString(campaign.description as Hex);

      const result = await validateCustomTopic(topicTitle, campaignName, campaignDesc);
      
      setValidationResult(result);
      setShowValidationDialog(true);

      if(result.isValid) {
        // Check if this custom topic was already completed
        if(address && userAddress) {
          const campaignId = campaign.__raw.contractInfo.index.toString();
          const completed = isTopicCompleted(userAddress, campaignId, topicTitle);
          if(completed) {
            setValidationResult(null);
            setShowValidationDialog(false);
            setCompletedTopicData(completed);
            setShowCompletedDialog(true);
            return;
          }
        }

        // Create a GeneratedTopic from custom topic
        const customTopicObj: GeneratedTopic = {
          id: `custom-${Date.now()}`,
          title: topicTitle,
          description: `Custom topic: ${topicTitle}`,
          difficulty: 'medium',
        };

        setSelectedTopic(customTopicObj);
      }
    } catch (error) {
      console.error('Error validating custom topic:', error);
      setValidationResult({
        isValid: false,
        message: 'Failed to validate topic. Please try again.',
      });
      setShowValidationDialog(true);
    } finally {
      setIsValidating(false);
    }
  }, [campaign, address, userAddress, setSelectedTopic]);

  // Handle validation dialog confirm
  const handleValidationConfirm = useCallback(() => {
    if(validationResult?.isValid && pendingCustomTopic) {
      const customTopicObj: GeneratedTopic = {
        id: `custom-${Date.now()}`,
        title: pendingCustomTopic,
        description: `Custom topic: ${pendingCustomTopic}`,
        difficulty: 'medium',
      };
      setSelectedTopic(customTopicObj);
    }
    setShowValidationDialog(false);
    setValidationResult(null);
    setPendingCustomTopic('');
  }, [validationResult, pendingCustomTopic, setSelectedTopic]);

  // Generate article based on selected topic - defined early for use in callbacks
  const generateArticle = useCallback(async (topic: GeneratedTopic) => {
    setIsGenerating(true);
    setStartTime(Date.now());
    
    // First, try to load article from Firebase
    if (address && userAddress) {
      try {
        await firebaseService.waitForInitialization();
        const campaignId = campaign.__raw.contractInfo.index.toString();
        const savedArticle = await firebaseService.getArticle(userAddress, campaignId, topic.id);
        
        if (savedArticle && savedArticle.content) {
          // Load existing article from Firebase
          setArticle({
            title: savedArticle.title,
            content: savedArticle.content,
            wordCount: savedArticle.content.split(/\s+/).length,
            readingTime: Math.ceil(savedArticle.content.split(/\s+/).length / 200),
          });
          setIsGenerating(false);
          return;
        }
      } catch (error) {
        console.warn('Failed to load article from Firebase, generating new one:', error);
      }
    }
    
    // If no article found in Firebase, generate new one
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
        
        // Save article to Firebase after generation
        if (address && userAddress && articleData.content) {
          try {
            await firebaseService.waitForInitialization();
            const campaignId = campaign.__raw.contractInfo.index.toString();
            await firebaseService.saveArticle(
              userAddress,
              campaignId,
              {
                id: `article-${topic.id}-${Date.now()}`,
                topicId: topic.id,
                content: articleData.content,
                title: articleData.title || topic.title,
                completed: false,
                lastReadAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              }
            );
            
            // Track topic access
            await trackTopicAccess();
          } catch (error) {
            console.warn('Failed to save article to Firebase:', error);
          }
        }
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
  }, [campaign.name, address, userAddress, trackTopicAccess]);

  // Handle continue with completed topic
  const handleContinueWithCompleted = useCallback(() => {
    if(!completedTopicData) return;

    const topic: GeneratedTopic = {
      id: completedTopicData.topicId,
      title: completedTopicData.topicTitle,
      description: completedTopicData.topicDescription,
      difficulty: completedTopicData.difficulty as 'easy' | 'medium' | 'hard',
    };

    setSelectedTopic(topic);
    setShowCompletedDialog(false);
    // Start learning with this topic
    generateArticle(topic);
    setCurrentStep('article');
  }, [completedTopicData, generateArticle]);

  // Handle use new topic
  const handleUseNewTopic = useCallback(() => {
    setShowCompletedDialog(false);
    setCompletedTopicData(null);
  }, []);

  // Handle topic selection from generated topics
  const handleTopicSelect = useCallback((topic: GeneratedTopic) => {
    // Check if topic was already completed
    if(address && userAddress) {
      const campaignId = campaign.__raw.contractInfo.index.toString();
      const completed = isTopicCompleted(userAddress, campaignId, topic.title);
      if(completed) {
        setCompletedTopicData(completed);
        setShowCompletedDialog(true);
        return;
      }
    }

    setSelectedTopic(topic);
  }, [address, userAddress, campaign]);

  // Handle start learning
  const handleStartLearning = useCallback(() => {
    if(!selectedTopic) return;
    generateArticle(selectedTopic);
    setCurrentStep('article');
  }, [selectedTopic, generateArticle, markArticleCompleted]);

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

  // Auto-generate article if initialTopic is provided
  useEffect(() => {
    if(initialTopic && !article && currentStep === 'article' && selectedTopic) {
      generateArticle(selectedTopic);
    }
  }, [initialTopic, article, currentStep, selectedTopic, generateArticle]);

  // Generate quiz based on article
  const generateQuiz = async () => {
    if(!article) return;
    
    // Mark article as completed when user moves to quiz (they've finished reading)
    if (selectedTopic && article) {
      try {
        await markArticleCompleted({
          id: `article-${selectedTopic.id}`,
          title: article.title,
          content: article.content,
        });
      } catch (error) {
        console.warn('Failed to mark article as completed:', error);
      }
    }
    
    // Always generate new quiz - don't reuse previous attempts
    // Check Firebase for completed quizzes to ensure we never reuse them
    if(address && userAddress && selectedTopic) {
      try {
        await firebaseService.waitForInitialization();
        const campaignId = campaign.__raw.contractInfo.index.toString();
        
        // Check if there's a completed quiz for this topic (prevent reuse)
        const progress = await firebaseService.getCampaignProgress(userAddress, campaignId);
        if (progress) {
          const topic = progress.topics.find(t => t.id === selectedTopic.id);
          if (topic && topic.quizCompleted) {
            // Topic already has a completed quiz - always generate new one
            // Don't restore any saved state for completed topics
          } else {
            // Check for saved quiz state only for temporary restoration (within 3 minutes)
            const savedQuizState = loadQuizState(userAddress, campaignId);
            if(savedQuizState && savedQuizState.isValid) {
              // Restore saved quiz state only if within time limit (temporary state)
              setQuizzes(savedQuizState.quizzes);
              setUserAnswers(savedQuizState.userAnswers);
              setCurrentQuizIndex(savedQuizState.currentQuizIndex);
              setQuizScore(savedQuizState.quizScore);
              setStartTime(savedQuizState.startTime);
              setEndTime(savedQuizState.endTime);
              setCurrentStep('quiz');
              return;
            } else if(savedQuizState && !savedQuizState.isValid) {
              // Quiz expired, clear it and generate new one
              clearQuizState(userAddress, campaignId);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to check quiz completion status:', error);
      }
    }
    
    // Always generate new quiz (never reuse completed quizzes)
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
  const calculateResults = async () => {
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
    
    // Mark quiz as completed using hook (saves to Firebase and updates progress)
    if (address && userAddress && selectedTopic) {
      try {
        await markQuizCompleted({
          id: `quiz-${selectedTopic.id}-${Date.now()}`, // Always new ID to prevent reuse
          questions: quizzes,
          score: score,
        });
      } catch (error) {
        console.warn('Failed to save quiz to Firebase:', error);
      }
    }
    
    setCurrentStep('results');
  };
  
  // Track topic access when article is loaded
  useEffect(() => {
    if (article && selectedTopic && userAddress) {
      trackTopicAccess();
    }
  }, [article, selectedTopic, userAddress, trackTopicAccess]);

  // Track progress when user answers quiz questions (updates on every action)
  useEffect(() => {
    if (currentStep === 'quiz' && userAnswers.length > 0 && selectedTopic && userAddress) {
      // Update progress in Firebase whenever user answers a question
      const updateProgress = async () => {
        try {
          await firebaseService.waitForInitialization();
          const campaignId = campaign.__raw?.contractInfo?.index?.toString() || '';
          await firebaseService.updateTopicProgress(
            userAddress,
            campaignId,
            selectedTopic.id,
            {
              lastAccessedAt: new Date().toISOString(),
            }
          );
        } catch (error) {
          console.warn('Failed to update progress on quiz answer:', error);
        }
      };
      updateProgress();
    }
  }, [userAnswers.length, currentStep, selectedTopic, userAddress, campaign]);

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

  return (
    <React.Fragment>
      <Dialog 
        open={(isDialogOpen || isCheckingSavedTopics) && !pendingClose} 
        onOpenChange={handleDialogClose} 
        modal={true}
      >
        <DialogContent 
          className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-surface left-4 right-4 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] top-[50%] translate-y-[-50%] mx-0"
          hideCloseButton={true}
          preventOutsideClose={true}
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
              <EnhancedTopicSection
                greeting={greeting}
                campaignInfo={campaignInfo}
                generatedTopics={generatedTopics}
                selectedTopic={selectedTopic}
                isGenerating={isGenerating}
                isValidating={isValidating}
                isCheckingSavedTopics={isCheckingSavedTopics}
                onSelectTopic={handleTopicSelect}
                onValidateCustomTopic={handleCustomTopicValidate}
                onStartLearning={handleStartLearning}
              />
            )}

            {/* Step 2: Article Reading */}
            {currentStep === 'article' && (
              <ArticleSection
                article={article}
                  selectedTopicTitle={selectedTopic?.title}
                isGenerating={isGenerating}
                onGenerateQuiz={generateQuiz}
                onSetCurrentStep={setCurrentStep}
                />
            )}

            {/* Step 3: Quiz */}
            {currentStep === 'quiz' && (
              <QuizSection
                quizzes={quizzes}
                currentQuizIndex={currentQuizIndex}
                userAnswers={userAnswers}
                isGenerating={isGenerating}
                onSetCurrentQuizIndex={setCurrentQuizIndex}
                onSetUserAnswers={setUserAnswers}
                onCalculateResults={calculateResults}
              />
            )}

            {/* Step 4: Results */}
            {currentStep === 'results' && performance && (
              <ResultsSection
                quizScore={quizScore}
                quizSize={quizzes.length}
                performance={performance}
                isPending={isPending}
                onStoreOnChain={handleStoreOnChain}
                onClose={onClose}
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
        onGenerateNew={handleGenerateNewTopics}
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

      {/* Validation Dialog */}
      {validationResult && (
        <TopicValidationDialog
          isOpen={showValidationDialog}
          onClose={() => {
            setShowValidationDialog(false);
            setValidationResult(null);
            setPendingCustomTopic('');
          }}
          isValid={validationResult.isValid}
          message={validationResult.message}
          topicTitle={pendingCustomTopic}
          onConfirm={handleValidationConfirm}
        />
      )}

      {/* Completed Topic Dialog */}
      {completedTopicData && (
        <CompletedTopicDialog
          isOpen={showCompletedDialog}
          onClose={() => {
            setShowCompletedDialog(false);
            setCompletedTopicData(null);
          }}
          completedTopic={completedTopicData}
          onContinue={handleContinueWithCompleted}
          onUseNew={handleUseNewTopic}
        />
      )}
    </React.Fragment>
  );
}
