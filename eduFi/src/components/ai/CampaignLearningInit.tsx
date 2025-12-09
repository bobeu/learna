/**
 * Campaign Learning Initialization Component
 * Main entry point when user clicks on a campaign to learn
 * Handles topic generation, validation, and integration with AITutor
 */

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignStateProps } from '../../../types';
import { useAccount } from 'wagmi';
import { formatAddr } from '../utilities';

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
  const router = useRouter();
  const { address } = useAccount();
  const userAddress = formatAddr(address);
  const campaignId = campaign.__raw?.contractInfo?.index?.toString() || campaign.id.toString();

  // Navigate to campaign profile page
  useEffect(() => {
    // Navigate to the campaign profile page
    router.push(`/campaigns/${campaignId}/profile`);
    // Call onClose to clean up parent state
    onClose();
  }, [campaignId, router, onClose]);

  // Show loading state while navigating
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading campaign profile...</p>
      </div>
    </div>
  );
}

