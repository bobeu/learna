/**
 * Campaign Learning Initialization Component
 * Main entry point when user clicks on a campaign to learn
 * Handles topic generation, validation, and integration with AITutor
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight } from 'lucide-react';
import { CampaignStateProps } from '../../../types';
import { normalizeString } from '../utilities';
import { useAccount } from 'wagmi';
import { formatAddr } from '../utilities';
import { motion } from 'framer-motion';
import { Hex } from "viem";

// Services and hooks
import { generateTopicsWithGreeting } from './services/topicGenerationService';
import { validateCustomTopic } from './services/topicValidationService';
import { 
  isTopicCompleted, 
  type CompletedTopic 
} from './services/topicStorageService';
import { useTopicState } from './hooks/useTopicState';
import { GeneratedTopic } from './TopicSelection';

// Components
import TopicGenerationDisplay from './components/TopicGenerationDisplay';
import CustomTopicInput from './components/CustomTopicInput';
import TopicValidationDialog from './components/TopicValidationDialog';
import CompletedTopicDialog from './components/CompletedTopicDialog';
import AITutor from './AITutor';

interface CampaignLearningInitProps {
  campaign: CampaignStateProps;
  onClose: () => void;
}

export default function CampaignLearningInit({ campaign, onClose }: CampaignLearningInitProps) {
  const { address } = useAccount();
  const userAddress = formatAddr(address);
  const campaignId = campaign.__raw?.contractInfo?.index?.toString() || campaign.id.toString();
  
  // Topic state management (in memory)
  const {
    topics,
    selectedTopic,
    greeting,
    campaignInfo,
    setTopics,
    setSelectedTopic,
    setCustomTopic,
    setGreeting,
    setCampaignInfo,
    resetState,
  } = useTopicState();

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [pendingCustomTopic, setPendingCustomTopic] = useState<string>('');
  const [completedTopicData, setCompletedTopicData] = useState<CompletedTopic | null>(null);
  const [showAITutor, setShowAITutor] = useState(false);

  // Check for completed topics when topics are generated
  const checkCompletedTopics = useCallback((generatedTopics: GeneratedTopic[]) => {
    if (!address || !userAddress || generatedTopics.length === 0) return null;

    // Check each generated topic to see if any match completed topics
    for (const topic of generatedTopics) {
      const completed = isTopicCompleted(userAddress, campaignId, topic.title);
      if (completed) {
        return completed;
      }
    }
    return null;
  }, [address, userAddress, campaignId]);

  // Generate topics on mount
  useEffect(() => {
    if (!isDialogOpen) return;

    const initializeTopics = async () => {
      // Only generate if topics haven't been generated yet
      if (topics.length > 0) return;

      setIsGenerating(true);
      try {
        const campaignName = normalizeString(campaign.name as Hex);
        const campaignDesc = normalizeString(campaign.description as Hex);

        const response = await generateTopicsWithGreeting(campaignName, campaignDesc);
        
        setGreeting(response.greeting);
        setCampaignInfo(response.campaignInfo);
        setTopics(response.topics || []);

        // Check for completed topics after generation
        if (response.topics.length > 0) {
          const completed = checkCompletedTopics(response.topics);
          if (completed) {
            setCompletedTopicData(completed);
            setShowCompletedDialog(true);
          }
        }
      } catch (error) {
        console.error('Error initializing topics:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    initializeTopics();
  }, [isDialogOpen, campaign, address, userAddress, campaignId, topics.length, setTopics, setGreeting, setCampaignInfo, checkCompletedTopics]);

  // Handle topic selection from generated topics
  const handleTopicSelect = useCallback((topic: GeneratedTopic) => {
    // Check if topic was already completed
    if (address && userAddress) {
      const completed = isTopicCompleted(userAddress, campaignId, topic.title);
      if (completed) {
        setCompletedTopicData(completed);
        setShowCompletedDialog(true);
        return;
      }
    }

    setSelectedTopic(topic);
    setCustomTopic(null);
  }, [address, userAddress, campaignId, setSelectedTopic, setCustomTopic]);

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

      if (result.isValid) {
        // Check if this custom topic was already completed
        if (address && userAddress) {
          const completed = isTopicCompleted(userAddress, campaignId, topicTitle);
          if (completed) {
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

        setCustomTopic(topicTitle);
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
  }, [campaign, address, userAddress, campaignId, setCustomTopic, setSelectedTopic]);

  // Handle validation dialog confirm
  const handleValidationConfirm = useCallback(() => {
    if (validationResult?.isValid && pendingCustomTopic) {
      const customTopicObj: GeneratedTopic = {
        id: `custom-${Date.now()}`,
        title: pendingCustomTopic,
        description: `Custom topic: ${pendingCustomTopic}`,
        difficulty: 'medium',
      };
      setSelectedTopic(customTopicObj);
      setCustomTopic(pendingCustomTopic);
    }
    setShowValidationDialog(false);
    setValidationResult(null);
    setPendingCustomTopic('');
  }, [validationResult, pendingCustomTopic, setSelectedTopic, setCustomTopic]);

  // Handle continue with completed topic
  const handleContinueWithCompleted = useCallback(() => {
    if (!completedTopicData) return;

    // Create topic object from completed topic
    const topic: GeneratedTopic = {
      id: completedTopicData.topicId,
      title: completedTopicData.topicTitle,
      description: completedTopicData.topicDescription,
      difficulty: completedTopicData.difficulty as 'easy' | 'medium' | 'hard',
    };

    setSelectedTopic(topic);
    setShowCompletedDialog(false);
    // Immediately start learning with this topic
    setShowAITutor(true);
  }, [completedTopicData, setSelectedTopic]);

  // Handle use new topic
  const handleUseNewTopic = useCallback(() => {
    setShowCompletedDialog(false);
    setCompletedTopicData(null);
    // User can now select from generated topics or input custom one
  }, []);

  // Handle start learning
  const handleStartLearning = useCallback(() => {
    if (!selectedTopic) return;
    setShowAITutor(true);
  }, [selectedTopic]);

  // Handle close
  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    resetState();
    onClose();
  }, [onClose, resetState]);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  // Show AITutor if topic is selected and user clicked start
  if (showAITutor && selectedTopic) {
    return (
      <AITutor
        campaign={campaign}
        onClose={() => {
          setShowAITutor(false);
          handleClose();
        }}
        initialTopic={selectedTopic}
      />
    );
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-surface mx-0 left-4 right-4 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] top-[50%] translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 flex-shrink-0" />
              <span className="text-base sm:text-lg font-semibold break-words min-w-0">
                {normalizeString(campaign.name as Hex)}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Choose a topic to start your learning journey
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
            {/* Topic Generation Display */}
            <TopicGenerationDisplay
              greeting={greeting}
              campaignInfo={campaignInfo}
              topics={topics}
              isGenerating={isGenerating}
              onTopicSelect={handleTopicSelect}
              getDifficultyColor={getDifficultyColor}
              selectedTopicId={selectedTopic?.id || null}
            />

            {/* Custom Topic Input - Always visible */}
            <CustomTopicInput
              onValidate={handleCustomTopicValidate}
              isValidating={isValidating}
              isDisabled={isGenerating}
            />

            {/* Start Learning Button */}
            {selectedTopic && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4 border-t border-neutral-200 dark:border-neutral-800"
              >
                <Button
                  onClick={handleStartLearning}
                  className="w-full sm:w-auto bg-primary-500 text-black hover:bg-primary-400 text-sm sm:text-base"
                  size="lg"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}

