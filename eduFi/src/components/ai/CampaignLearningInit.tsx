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
import { normalizeString, getDifficultyColor } from '../utilities';
import { useAccount } from 'wagmi';
import { formatAddr } from '../utilities';
import { motion } from 'framer-motion';
import { Hex } from "viem";

// Services and hooks
import { generateTopicsWithGreeting } from './services/topicGenerationService';
import { validateCustomTopic } from './services/topicValidationService';
import { isTopicCompleted, type CompletedTopic, getCampaignCompletedTopics } from './services/topicStorageService';
import { loadAITutorState, type SavedAITutorState } from './services/aiTutorStorageService';
import { useTopicState } from './hooks/useTopicState';
import { GeneratedTopic } from './TopicSelection';

// Components
import TopicGenerationDisplay from './components/TopicGenerationDisplay';
import CustomTopicInput from './components/CustomTopicInput';
import TopicValidationDialog from './components/TopicValidationDialog';
import CompletedTopicDialog from './components/CompletedTopicDialog';
import ContinueOrNewTopicDialog from './components/ContinueOrNewTopicDialog';
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
  const [isCheckingSavedTopics, setIsCheckingSavedTopics] = useState(true);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [showContinueTopicDialog, setShowContinueTopicDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [pendingCustomTopic, setPendingCustomTopic] = useState<string>('');
  const [completedTopicData, setCompletedTopicData] = useState<CompletedTopic | null>(null);
  const [savedState, setSavedState] = useState<SavedAITutorState | null>(null);
  const [showAITutor, setShowAITutor] = useState(false);

  // Check for completed topics when topics are generated
  const checkCompletedTopics = useCallback((generatedTopics: GeneratedTopic[]) => {
    if(!address || !userAddress || generatedTopics.length === 0) return null;

    // Check each generated topic to see if any match completed topics
    for (const topic of generatedTopics) {
      const completed = isTopicCompleted(userAddress, campaignId, topic.title);
      if(completed) {
        return completed;
      }
    }
    return null;
  }, [address, userAddress, campaignId]);

  // Load saved topics first, then generate if needed
  useEffect(() => {
    if(!isDialogOpen) return;

    const initializeTopics = async () => {
      // Start with checking saved topics
      setIsCheckingSavedTopics(true);
      
      // Small delay to show "searching" state
      await new Promise(resolve => setTimeout(resolve, 300));

      if(!address || !userAddress) {
        setIsCheckingSavedTopics(false);
        return;
      }

      // PRIORITY 1: Check for saved AITutor state (topics, articles, etc.)
      const saved = loadAITutorState(userAddress, campaignId);
      
      if(saved && saved.topics && saved.topics.length > 0) {
        // Filter out completed topics
        const completedTopics = getCampaignCompletedTopics(userAddress, campaignId);
        const completedTopicIds = new Set(completedTopics.map(t => t.topicId));
        const filteredTopics = saved.topics.filter(t => !completedTopicIds.has(t.id));
        
        if(filteredTopics.length > 0) {
          // Load saved topics
          setTopics(filteredTopics);
          if(saved.greeting) setGreeting(saved.greeting);
          if(saved.campaignInfo) setCampaignInfo(saved.campaignInfo);
          setSavedState(saved);
          
          setIsCheckingSavedTopics(false);
          // Show dialog to continue with saved topics or generate new ones
          setShowContinueTopicDialog(true);
          return; // Don't generate new topics
        }
      }

      // PRIORITY 2: Only generate if no saved topics and topics haven't been generated yet
      if(topics.length > 0) {
        setIsCheckingSavedTopics(false);
        return;
      }

      // Generate new topics
      setIsGenerating(true);
      setIsCheckingSavedTopics(false);
      
      try {
        const campaignName = normalizeString(campaign.name as Hex);
        const campaignDesc = normalizeString(campaign.description as Hex);

        const response = await generateTopicsWithGreeting(campaignName, campaignDesc);
        
        setGreeting(response.greeting);
        setCampaignInfo(response.campaignInfo);
        setTopics(response.topics || []);

        // Check for completed topics after generation
        if(response.topics.length > 0) {
          const completed = checkCompletedTopics(response.topics);
          if(completed) {
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
    if(address && userAddress) {
      const completed = isTopicCompleted(userAddress, campaignId, topic.title);
      if(completed) {
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

      if(result.isValid) {
        // Check if this custom topic was already completed
        if(address && userAddress) {
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
    if(validationResult?.isValid && pendingCustomTopic) {
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
    if(!completedTopicData) return;

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

  // Handle continue with saved topics
  const handleContinueWithSavedTopics = useCallback(() => {
    setShowContinueTopicDialog(false);
    // Topics are already loaded, user can now select one
  }, []);

  // Handle generate new topics (user wants new ones instead of saved)
  const handleGenerateNewTopics = useCallback(async () => {
    setShowContinueTopicDialog(false);
    
    // Generate new topics
    setIsGenerating(true);
    try {
      const campaignName = normalizeString(campaign.name as Hex);
      const campaignDesc = normalizeString(campaign.description as Hex);

      const response = await generateTopicsWithGreeting(campaignName, campaignDesc);
      
      // Merge with existing saved topics (add new ones that don't exist)
      const existingTopicTitles = new Set(topics.map(t => t.title.toLowerCase()));
      const newTopics = response.topics.filter(t => !existingTopicTitles.has(t.title.toLowerCase()));
      
      if(newTopics.length > 0) {
        setTopics([...topics, ...newTopics]);
      }
      
      if(response.greeting && !greeting) setGreeting(response.greeting);
      if(response.campaignInfo && !campaignInfo) setCampaignInfo(response.campaignInfo);
    } catch (error) {
      console.error('Error generating new topics:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [campaign, topics, greeting, campaignInfo, setTopics, setGreeting, setCampaignInfo]);

  // Handle start learning
  const handleStartLearning = useCallback(() => {
    if(!selectedTopic) return;
    setShowAITutor(true);
  }, [selectedTopic]);

  // Handle close
  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    resetState();
    onClose();
  }, [onClose, resetState]);

  // Show AITutor if topic is selected and user clicked start
  if(showAITutor && selectedTopic) {
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
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={handleClose}
        modal={true}
      >
        <DialogContent 
          className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-surface mx-0 left-4 right-4 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] top-[50%] translate-y-[-50%]"
          hideCloseButton={true}
          preventOutsideClose={true}  
        >
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-gray-900 dark:text-white">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 flex-shrink-0" />
                <span className="text-base sm:text-lg font-semibold break-words min-w-0">
                  {normalizeString(campaign.name as Hex)}
                </span>
              </div>
              <button
                onClick={handleClose}
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
              Choose a topic to start your learning journey
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
            {/* Show loading state while checking for saved topics */}
            {isCheckingSavedTopics && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Searching for available topics...
                </p>
              </div>
            )}

            {/* Topic Generation Display */}
            {!isCheckingSavedTopics && (
              <TopicGenerationDisplay
                greeting={greeting}
                campaignInfo={campaignInfo}
                topics={topics}
                isGenerating={isGenerating}
                onTopicSelect={handleTopicSelect}
                getDifficultyColor={getDifficultyColor}
                selectedTopicId={selectedTopic?.id || null}
              />
            )}

            {/* Custom Topic Input - Always visible (when not checking) */}
            {!isCheckingSavedTopics && (
              <CustomTopicInput
                onValidate={handleCustomTopicValidate}
                isValidating={isValidating}
                isDisabled={isGenerating}
              />
            )}

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

      {/* Continue with Saved Topics Dialog */}
      {savedState && savedState.topics && savedState.topics.length > 0 && (
        <ContinueOrNewTopicDialog
          isOpen={showContinueTopicDialog}
          savedTopics={savedState.topics}
          onContinue={handleContinueWithSavedTopics}
          onGenerateNew={handleGenerateNewTopics}
        />
      )}
    </>
  );
}

