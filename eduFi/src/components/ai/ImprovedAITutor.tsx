"use client";

import React, { useState } from 'react';
import { Brain, BookOpen, Play, CheckCircle, Clock, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWriteContract } from 'wagmi';
import { ProofOfAssimilation, Performance, CampaignStateProps } from '../../../types';
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';
import { Hex, stringToHex, zeroAddress } from 'viem';
import campaignTemplate from "../../../contractsArtifacts/template.json";
import { normalizeString } from '../utilities';

interface ImprovedAITutorProps {
  campaign: CampaignStateProps;
  onClose: () => void;
}

interface GeneratedTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
  readingTime: number; // in minutes
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type Steps = 'topics' | 'article' | 'quiz' | 'results';

export default function ImprovedAITutor({ campaign, onClose }: ImprovedAITutorProps) {
  const { writeContractAsync, isPending } = useWriteContract();
  
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
      functionName: 'proveAssimilation' as any,
      contractAddress: campaign.__raw.contractAddress,
      abi: campaignTemplate.abi as any,
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
              Learn with our intelligent AI-powered tutor and prove your knowledge
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Topic Selection */}
            {currentStep === 'topics' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Choose Your Learning Topic
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Select a topic to start your learning journey
                  </p>
                </div>

                {generatedTopics.length === 0 && (
                  <div className="text-center">
                    <Button 
                      onClick={generateTopics} 
                      disabled={isGenerating}
                      className="bg-primary-500 text-black hover:bg-primary-400"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Topics...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {generatedTopics.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedTopics.map((topic) => (
                      <Card 
                        key={topic.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow border-neutral-200 dark:border-neutral-800"
                        onClick={() => {
                          setSelectedTopic(topic);
                          generateArticle(topic);
                          setCurrentStep('article');
                        }}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg text-gray-900 dark:text-white">
                            {topic.title}
                          </CardTitle>
                          <Badge className={getDifficultyColor(topic.difficulty)}>
                            {topic.difficulty}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-300">
                            {topic.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Article Reading */}
            {currentStep === 'article' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTopic?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    {article?.readingTime} min read
                  </div>
                </div>

                {isGenerating && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="text-gray-600 dark:text-gray-300">Generating content...</p>
                  </div>
                )}

                {article && (
                  <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-6">
                      <div className="prose max-w-none text-gray-900 dark:text-white">
                        <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {article.content}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {article && (
                  <div className="text-center">
                    <Button 
                      onClick={() => {
                        generateQuiz();
                        setCurrentStep('quiz');
                      }}
                      disabled={isGenerating}
                      className="bg-primary-500 text-black hover:bg-primary-400"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Quiz */}
            {currentStep === 'quiz' && quizzes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Knowledge Test
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {currentQuizIndex + 1} of {quizzes.length}
                  </span>
                </div>

                <Progress 
                  value={((currentQuizIndex + 1) / quizzes.length) * 100} 
                  className="w-full"
                />

                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      {quizzes[currentQuizIndex].question}
                    </h4>
                    
                    <div className="space-y-2">
                      {quizzes[currentQuizIndex].options.map((option, index) => (
                        <Button
                          key={index}
                          variant={userAnswers[currentQuizIndex] === index ? "default" : "outline"}
                          onClick={() => {
                            const newAnswers = [...userAnswers];
                            newAnswers[currentQuizIndex] = index;
                            setUserAnswers(newAnswers);
                          }}
                          className="w-full justify-start text-left"
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuizIndex(Math.max(0, currentQuizIndex - 1))}
                    disabled={currentQuizIndex === 0}
                    className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600"
                  >
                    Previous
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (currentQuizIndex < quizzes.length - 1) {
                        setCurrentQuizIndex(currentQuizIndex + 1);
                      } else {
                        calculateResults();
                      }
                    }}
                    disabled={userAnswers[currentQuizIndex] === undefined}
                    className="bg-primary-500 text-black hover:bg-primary-400"
                  >
                    {currentQuizIndex < quizzes.length - 1 ? 'Next' : 'Finish Quiz'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {currentStep === 'results' && performance && (
              <div className="space-y-6">
                <div className="text-center">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Quiz Complete!
                  </h3>
                  <div className="text-4xl font-bold text-primary-500 mb-2">
                    {quizScore}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    You answered {Math.round((quizScore / 100) * quizzes.length)} out of {quizzes.length} questions correctly
                  </p>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Performance Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {getPerformanceRating(performance.value).text}
                      </span>
                      <Badge className="bg-primary-100 text-primary-800 border-primary-200">
                        {performance.value}/5
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleStoreOnChain}
                    disabled={isPending}
                    className="bg-primary-500 text-black hover:bg-primary-400"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Storing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Store Proof on Chain
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600"
                  >
                    Close
                  </Button>
                </div>
              </div>
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
