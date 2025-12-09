/**
 * Campaign Profile Page
 * Displays user's learning progress for a specific campaign
 * Shows scores, completion status, topics, and learning progress from Firebase
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { formatAddr } from '@/components/utilities';
import { CampaignStateProps } from '../../../../../types';
import { normalizeString } from '@/components/utilities';
import { Hex } from 'viem';
import { firebaseService, type CampaignProgress, type LearningTopic } from '@/lib/firebaseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, BookOpen, CheckCircle, Circle, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import AITutor from '@/components/ai/AITutor';
import KnowledgeLevelModal, { KnowledgeLevel } from '@/components/ai/components/KnowledgeLevelModal';
import { generatePersonalizedTopics } from '@/components/ai/services/personalizedTopicGenerationService';
import { GeneratedTopic } from '@/components/ai/TopicSelection';
import useStorage from '@/components/hooks/useStorage';
import { formatEther } from 'viem';
import { toBN } from '@/components/utilities';
import { mockCampaignState } from '../../../../../types';

export default function CampaignProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const userAddress = formatAddr(address);
  const { campaignsData } = useStorage();
  
  const campaignId = params.campaignId as string;
  const [campaign, setCampaign] = useState<CampaignStateProps | null>(null);
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showKnowledgeLevelModal, setShowKnowledgeLevelModal] = useState(false);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<GeneratedTopic | null>(null);
  const [showAITutor, setShowAITutor] = useState(false);

  // Load campaign data from storage
  useEffect(() => {
    if (!campaignsData || campaignsData.length === 0) {
      setIsLoading(false);
      return;
    }

    // Find campaign by index (campaignId is the index)
    const campaignIndex = parseInt(campaignId) - 1;
    const rawCampaign = campaignsData[campaignIndex];
    
    if (rawCampaign) {
      const md = rawCampaign.metadata;
      const latestEpoch = rawCampaign.epochData?.[rawCampaign.epochData.length - 1];
      const learnersCount = latestEpoch?.learners?.length || 0;
      const nativeTotal = latestEpoch ? (latestEpoch.setting.funds.nativeAss + latestEpoch.setting.funds.nativeInt) : 0n;
      const endDateMs = toBN(md.endDate || 0).toNumber() * 1000;
      const isActive = Date.now() < endDateMs || endDateMs === 0;
      const status = isActive ? 'active' : 'completed';
      
      // Normalize campaign name and description (they might be in hex format)
      const normalizedName = normalizeString(md.name as Hex);
      const normalizedDesc = normalizeString(md.description as Hex);
      
      const formattedCampaign: CampaignStateProps = {
        id: campaignIndex + 1,
        name: normalizedName,
        description: normalizedDesc,
        image: md.imageUrl,
        status,
        endDate: md.endDate ? new Date(endDateMs) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        fundingAmount: nativeTotal ? Number(formatEther(nativeTotal)).toFixed(2) : '0',
        participants: learnersCount,
        __raw: rawCampaign,
      };
      
      setCampaign(formattedCampaign);
    } else {
      // Fallback to mock if not found
      setCampaign(mockCampaignState);
    }
    
    setIsLoading(false);
  }, [campaignId, campaignsData]);

  // Load user progress from Firebase
  useEffect(() => {
    if (!userAddress || !campaignId) return;

    const loadProgress = async () => {
      try {
        await firebaseService.waitForInitialization();
        const progress = await firebaseService.getCampaignProgress(userAddress, campaignId);
        
        if (progress) {
          // Ensure campaign name is up-to-date (in case campaign name changed)
          if (campaign && progress.campaignName !== normalizeString(campaign.name as Hex)) {
            const updatedProgress = {
              ...progress,
              campaignName: normalizeString(campaign.name as Hex),
              updatedAt: new Date().toISOString(),
            };
            await firebaseService.saveCampaignProgress(userAddress, updatedProgress);
            setCampaignProgress(updatedProgress);
          } else {
            setCampaignProgress(progress);
          }
          
          // Auto-load last selected topic by default (as per requirements)
          if (progress.lastSelectedTopicId && progress.topics.length > 0) {
            const lastTopic = progress.topics.find(t => t.id === progress.lastSelectedTopicId);
            if (lastTopic && !lastTopic.completed) {
              // Only auto-load if topic is not completed
              const generatedTopic: GeneratedTopic = {
                id: lastTopic.id,
                title: lastTopic.title,
                description: lastTopic.description,
                difficulty: lastTopic.difficulty,
              };
              setSelectedTopic(generatedTopic);
              setShowAITutor(true);
            }
          }
        } else {
          // First time user - show knowledge level modal
          setShowKnowledgeLevelModal(true);
        }
      } catch (error) {
        console.error('Failed to load campaign progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();

    // Subscribe to real-time updates
    const unsubscribe = firebaseService.subscribeToCampaignProgress(
      userAddress,
      campaignId,
      (progress) => {
        setCampaignProgress(progress);
      }
    );

    return () => unsubscribe();
  }, [userAddress, campaignId, campaign]);

  // Handle knowledge level selection
  const handleKnowledgeLevelSelect = useCallback(async (
    level: KnowledgeLevel,
    experienceNotes: string
  ) => {
    if (!userAddress || !campaign) return;

    setIsGeneratingPath(true);
    setShowKnowledgeLevelModal(false);

    try {
      const campaignName = normalizeString(campaign.name as Hex);
      const campaignDesc = normalizeString(campaign.description as Hex);

      // Generate personalized learning path
      const learningPath = await generatePersonalizedTopics(
        campaignName,
        campaignDesc,
        level,
        experienceNotes
      );

      // Create initial progress
      const initialProgress: CampaignProgress = {
        campaignId,
        campaignName,
        knowledgeLevel: level,
        topics: learningPath.topics.map((topic, index) => ({
          id: topic.id || `topic-${index}`,
          title: topic.title,
          description: topic.description,
          difficulty: topic.difficulty as 'easy' | 'medium' | 'hard',
          completed: false,
          articleCompleted: false,
          quizCompleted: false,
          lastAccessedAt: null,
          createdAt: new Date().toISOString(),
          progress: 0,
        })),
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        learningPath: {
          level,
          targetLevel: level === 'beginner' ? 'intermediate' : level === 'intermediate' ? 'advanced' : 'advanced',
          topics: learningPath.topics.map(t => t.id || t.title),
          generatedAt: new Date().toISOString(),
        },
      };

      // Save to Firebase
      await firebaseService.saveCampaignProgress(userAddress, initialProgress);
      setCampaignProgress(initialProgress);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
      alert('Failed to generate learning path. Please try again.');
    } finally {
      setIsGeneratingPath(false);
    }
  }, [userAddress, campaign, campaignId]);

  // Handle topic selection
  const handleTopicSelect = useCallback((topic: LearningTopic) => {
    // Convert LearningTopic to GeneratedTopic for AITutor
    const generatedTopic: GeneratedTopic = {
      id: topic.id,
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty,
    };

    setSelectedTopic(generatedTopic);
    
    // Update last accessed time and last selected topic
    if (userAddress && campaignProgress) {
      firebaseService.updateTopicProgress(
        userAddress,
        campaignId,
        topic.id,
        { lastAccessedAt: new Date().toISOString() }
      );
      
      // Update last selected topic in campaign progress
      const updatedProgress = {
        ...campaignProgress,
        lastSelectedTopicId: topic.id,
        updatedAt: new Date().toISOString(),
      };
      firebaseService.saveCampaignProgress(userAddress, updatedProgress);
    }

    // Open AITutor
    setShowAITutor(true);
  }, [userAddress, campaignId, campaignProgress]);

  // Calculate overall progress
  const overallProgress = campaignProgress
    ? campaignProgress.topics.length > 0
      ? Math.round(
          (campaignProgress.topics.reduce((sum, t) => sum + t.progress, 0) /
            campaignProgress.topics.length)
        )
      : 0
    : 0;

  const completedTopics = campaignProgress
    ? campaignProgress.topics.filter(t => t.completed).length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600 dark:text-gray-300">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (showAITutor && selectedTopic && campaign) {
    return (
      <AITutor
        campaign={campaign}
        onClose={() => {
          setShowAITutor(false);
          setSelectedTopic(null);
        }}
        initialTopic={selectedTopic}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-bold">
              {campaignProgress?.campaignName || (campaign ? normalizeString(campaign.name as Hex) : 'Campaign Profile')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your learning progress and achievements
          </p>
        </div>

        {/* Progress Overview */}
        {campaignProgress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="dark:bg-[#1a1a1a] border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-500 mb-2">
                  {overallProgress}%
                </div>
                <Progress value={overallProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1a1a1a] border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-500 mb-2">
                  {completedTopics} / {campaignProgress.topics.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Topics completed
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1a1a1a] border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Knowledge Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary-500 capitalize mb-2">
                  {campaignProgress.knowledgeLevel}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Current level
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Topics Section */}
        <Card className="dark:bg-[#1a1a1a] border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              Learning Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!campaignProgress || campaignProgress.topics.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No topics available yet
                </p>
                <Button
                  onClick={() => setShowKnowledgeLevelModal(true)}
                  className="bg-primary-500 text-black hover:bg-primary-400"
                >
                  Start Learning Path
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaignProgress.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {topic.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <h3 className="text-lg font-semibold">{topic.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            topic.difficulty === 'easy'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : topic.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {topic.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {topic.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span className={topic.articleCompleted ? 'text-green-500' : ''}>
                            Article: {topic.articleCompleted ? '✓' : '○'}
                          </span>
                          <span className={topic.quizCompleted ? 'text-green-500' : ''}>
                            Quiz: {topic.quizCompleted ? '✓' : '○'}
                          </span>
                        </div>
                        <Progress value={topic.progress} className="h-2 mb-3" />
                      </div>
                      <Button
                        onClick={() => handleTopicSelect(topic)}
                        className="ml-4 bg-primary-500 text-black hover:bg-primary-400"
                        size="sm"
                      >
                        {topic.lastAccessedAt ? 'Continue' : 'Start'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Level Modal */}
      {showKnowledgeLevelModal && campaign && (
        <KnowledgeLevelModal
          isOpen={showKnowledgeLevelModal}
          campaignName={normalizeString(campaign.name as Hex)}
          campaignDescription={normalizeString(campaign.description as Hex)}
          onSelect={handleKnowledgeLevelSelect}
          onClose={() => setShowKnowledgeLevelModal(false)}
          isGenerating={isGeneratingPath}
        />
      )}
    </div>
  );
}

