/**
 * Topic Selection Section Component
 * Handles topic generation and selection within AITutor
 */

"use client";

import React from 'react';
import TopicSelection, { GeneratedTopic } from '../TopicSelection';
import { Steps } from '../ArticleReading';
import { getDifficultyColor } from '../../utilities';

interface TopicSectionProps {
  generatedTopics: GeneratedTopic[];
  isGenerating: boolean;
  isCheckingSavedTopics: boolean;
  onGenerateTopics: () => Promise<void>;
  onSelectTopic: (topic: GeneratedTopic) => void;
  onGenerateArticle: (topic: GeneratedTopic) => Promise<void>;
  onSetCurrentStep: (step: Steps) => void;
}

export default function TopicSection({
  generatedTopics,
  isGenerating,
  isCheckingSavedTopics,
  onGenerateTopics,
  onSelectTopic,
  onGenerateArticle,
  onSetCurrentStep,
}: TopicSectionProps) {
  const handleTopicSelect = (topic: GeneratedTopic) => {
    onSelectTopic(topic);
    onGenerateArticle(topic);
    onSetCurrentStep('article');
  };

  return (
    <TopicSelection
      generateArticle={handleTopicSelect}
      generateTopics={onGenerateTopics}
      generatedTopics={generatedTopics}
      getDifficultyColor={getDifficultyColor}
      isGenerating={isGenerating}
      isCheckingSavedTopics={isCheckingSavedTopics}
      setCurrentStep={onSetCurrentStep}
      setSelectedTopic={onSelectTopic}
    />
  );
}

