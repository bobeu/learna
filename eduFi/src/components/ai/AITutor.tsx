"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAccount, useWriteContract } from 'wagmi';
import { ProofOfAssimilation, Performance, CampaignStateProps, FunctionName, Address } from '../../../types';
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';
import { Hex, stringToHex, zeroAddress } from 'viem';
// import campaignTemplate from "../../../contractsArtifacts/template.json";
import { filterTransactionData, normalizeString, formatAddr } from '../utilities';
import ArticleReading, { Steps } from './ArticleReading';
import Quiz, { QuizQuestion } from './Quiz';
import Results from './Results';
import TopicSelection, { GeneratedTopic } from './TopicSelection';
import QuizProgressConfirmation from './QuizProgressConfirmation';
import UnsavedProgressIndicator from './UnsavedProgressIndicator';
import {
  saveUnsavedProgress,
  loadUnsavedProgress,
  clearUnsavedProgress,
  isProgressAlreadySaved,
  type UnsavedQuizProgress
} from './quizProgressStorage';
import useStorage from '../hooks/useStorage';

interface AITutorProps {
  campaign: CampaignStateProps;
  onClose: () => void;
}

interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
  readingTime: number; // in minutes
}

export default function AITutor({ campaign, onClose }: AITutorProps) {
  const { isPending } = useWriteContract(); 
  const { chainId, address } = useAccount();
  const { campaignsData } = useStorage();
  const userAddress = formatAddr(address);
  
  // State management
  const [currentStep, setCurrentStep] = useState<Steps>('topics');
  const [selectedTopic, setSelectedTopic] = useState<GeneratedTopic | null>(null);
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([]);
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
  const [pendingClose, setPendingClose] = useState(false);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);

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

  // Save current progress to localStorage
  const saveProgress = useCallback(() => {
    if(!address || !userAddress) return;
    
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
      }
    }
  }, [address, userAddress, currentStep, performance, selectedTopic, article, quizzes, userAnswers, currentQuizIndex, quizScore, startTime, endTime, campaign, savedLearnerData]);

  // Restore progress from localStorage on mount
  useEffect(() => {
    if(!address || !userAddress) return;
    
    const saved = loadUnsavedProgress(userAddress, campaign.__raw.contractInfo.index.toString());
    if(!saved) return;
    
    // Check if saved progress is already on blockchain
    if(savedLearnerData && isProgressAlreadySaved(saved, savedLearnerData)) {
      clearUnsavedProgress(userAddress, campaign.__raw.contractInfo.index.toString());
      return;
    }
    
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
  }, [address, userAddress, campaign.__raw.contractInfo.index, savedLearnerData]);

  // Auto-save progress when quiz results are calculated
  // saveProgress already checks if data is on blockchain before saving
  useEffect(() => {
    if(currentStep === 'results' && performance && selectedTopic && article) {
      saveProgress();
    }
  }, [currentStep, performance, selectedTopic, article, saveProgress]);

  // Handle dialog close with confirmation if there's unsaved data
  const handleDialogClose = useCallback((open: boolean) => {
    if(!open && hasUnsavedData && currentStep === 'results') {
      setShowConfirmationDialog(true);
      setPendingClose(true);
    } else if(!open) {
      onClose();
    }
  }, [hasUnsavedData, currentStep, onClose]);

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
        const topics = await response.json();
        setGeneratedTopics(topics);
      } else {
        console.log("response", response)
        // Fallback to mock topics
        setGeneratedTopics([
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
        ]);
      }
    } catch (error) {
      console.error('Failed to generate topics:', error);
      // Use fallback topics
      setGeneratedTopics([
        {
          id: '1',
          title: `${campaign.name} Fundamentals`,
          description: 'Learn the basic concepts and principles',
          difficulty: 'easy'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate article based on selected topic
  const generateArticle = async (topic: GeneratedTopic) => {
    setIsGenerating(true);
    setStartTime(Date.now());
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic.title,
          campaignName: campaign.name,
          maxWords: 700
        }),
      });
      
      if(response.ok) {
        const articleData = await response.json();
        setArticle(articleData);
      } else {
        // Fallback article
        setArticle({
          title: topic.title,
          content: `# ${topic.title}\n\nThis is a comprehensive guide to ${topic.title}. ${topic.description}\n\n## Key Concepts\n\nUnderstanding the fundamentals is crucial for mastering this topic.\n\n## Practical Applications\n\nReal-world examples and use cases demonstrate the practical value of this knowledge.\n\n## Advanced Techniques\n\nFor those looking to go beyond the basics, advanced techniques provide deeper insights.\n\n## Conclusion\n\nMastering ${topic.title} opens up numerous opportunities in the field.`,
          wordCount: 650,
          readingTime: 5
        });
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate quiz based on article
  const generateQuiz = async () => {
    if(!article) return;
    
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
  }, [address, userAddress, campaign, onClose]);

  const handleTransactionError = (error: Error) => {
    console.error('Failed to store proof:', error);
  };

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
      <Dialog open={!pendingClose} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-surface">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Brain className="w-6 h-6 text-primary-500" />
              Learna Tutor - {normalizeString(campaign.name as Hex)}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Learn with our intelligent AI-powered tutor and prove your knowledge of a subject
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
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

      {hasUnsavedData && performance && quizScore > 0 && (
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
            setPendingClose(false);
            setShowConfirmationDialog(false);
          }}
        />
      )}
    </>
  );
}
