"use client";

import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWriteContract } from 'wagmi';
import { ProofOfAssimilation, Performance, CampaignStateProps } from '../../../types';
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';
import { Hex, stringToHex, zeroAddress } from 'viem';
import campaignTemplate from "../../../contractsArtifacts/template.json";
import { normalizeString } from '../utilities';
import ArticleReading, { Steps } from './ArticleReading';
import Quiz, { QuizQuestion } from './Quiz';
import Results from './Results';
import TopicSelection, { GeneratedTopic } from './TopicSelection';

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
      
      if (response.ok) {
        const topics = await response.json();
        setGeneratedTopics(topics);
      } else {
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
      
      if (response.ok) {
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
    if (!article) return;
    
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
      
      if (response.ok) {
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
    // const timeSpent = Math.floor((endTime - startTime) / 1000); // in seconds
    
    let correctAnswers = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quizzes[index].correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / quizzes.length) * 100);
    setQuizScore(score);
    
    // Calculate performance rating
    let performanceValue = 0;
    if (score >= 90) performanceValue = 5;
    else if (score >= 80) performanceValue = 4;
    else if (score >= 70) performanceValue = 3;
    else if (score >= 60) performanceValue = 2;
    else performanceValue = 1;
    
    setPerformance({
      value: performanceValue,
      ratedAt: stringToHex(new Date().toISOString())
    });
    
    setCurrentStep('results');
  };

  // Prepare data for on-chain storage
  const prepareOnChainData = () => {
    if (!performance || !selectedTopic || !article) return null;
    
    const proofOfAssimilation: ProofOfAssimilation = {
      questionSize: quizzes.length,
      score: quizScore,
      totalPoints: quizzes.length * 10, // 10 points per question
      percentage: quizScore,
      timeSpent: Math.floor((endTime - startTime) / 1000),
      completedAt: stringToHex(Date.now().toString())
    };
    
    return { proofOfAssimilation, performance };
  };

  // Create transaction steps for on-chain storage
  const createTransactionSteps = (): TransactionStep[] => {
    const data = prepareOnChainData();
    if (!data) return [{
      id: 'null', 
      title: 'null',
      description: 'Data unavailable', 
      functionName: 'allowance', 
      contractAddress: zeroAddress,
      abi: [],
      args: []
    }];
    
    return [{
      id: 'prove-assimilation',
      title: 'Store Proof of Learning',
      description: 'Storing your quiz results and performance rating on-chain',
      functionName: 'proveAssimilation',
      contractAddress: campaign.__raw.contractAddress,
      abi: campaignTemplate.abi,
      args: [data.proofOfAssimilation, data.performance],
    }];
  };

  const handleStoreOnChain = () => {
    const steps = createTransactionSteps();
    if (steps.length === 0) {
      alert('No data to store');
      return;
    }
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = (txHash: string) => {
    console.log('Proof of assimilation stored:', txHash);
    setShowTransactionModal(false);
  };

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
      <Dialog open={true} onOpenChange={onClose}>
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
                generateQuiz={generateQuiz}
                quizzes={quizzes}
                setCurrentQuizIndex={setCurrentQuizIndex}
                setCurrentStep={setCurrentStep}
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
    </>
  );
}
