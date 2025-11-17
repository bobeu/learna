/**
 * Enhanced Topic Selection Section Component
 * Includes topic generation, custom topic input, and validation
 * Merged from CampaignLearningInit
 */

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GeneratedTopic } from '../TopicSelection';
import TopicGenerationDisplay from '../components/TopicGenerationDisplay';
import CustomTopicInput from '../components/CustomTopicInput';
import { getDifficultyColor } from '../../utilities';

interface EnhancedTopicSectionProps {
  greeting: string | null;
  campaignInfo: string | null;
  generatedTopics: GeneratedTopic[];
  selectedTopic: GeneratedTopic | null;
  isGenerating: boolean;
  isValidating: boolean;
  isCheckingSavedTopics: boolean;
  onSelectTopic: (topic: GeneratedTopic) => void;
  onValidateCustomTopic: (topic: string) => Promise<void>;
  onStartLearning: () => void;
}

export default function EnhancedTopicSection({
  greeting,
  campaignInfo,
  generatedTopics,
  selectedTopic,
  isGenerating,
  isValidating,
  isCheckingSavedTopics,
  onSelectTopic,
  onValidateCustomTopic,
  onStartLearning,
}: EnhancedTopicSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
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
        <>
          <TopicGenerationDisplay
            greeting={greeting}
            campaignInfo={campaignInfo}
            topics={generatedTopics}
            isGenerating={isGenerating}
            onTopicSelect={onSelectTopic}
            getDifficultyColor={getDifficultyColor}
            selectedTopicId={selectedTopic?.id || null}
          />

          {/* Custom Topic Input */}
          <CustomTopicInput
            onValidate={onValidateCustomTopic}
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
                onClick={onStartLearning}
                className="w-full sm:w-auto bg-primary-500 text-black hover:bg-primary-400 text-sm sm:text-base"
                size="lg"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

