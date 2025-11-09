/**
 * Results Section Component
 * Wrapper for Results component
 */

"use client";

import React from 'react';
import Results from '../Results';
import { getPerformanceRating } from '../../utilities';
import { Performance } from '../../../../types';

interface ResultsSectionProps {
  quizScore: number;
  quizSize: number;
  performance: Performance;
  isPending: boolean;
  onStoreOnChain: () => void;
  onClose: () => void;
}

export default function ResultsSection({
  quizScore,
  quizSize,
  performance,
  isPending,
  onStoreOnChain,
  onClose,
}: ResultsSectionProps) {
  return (
    <Results
      handleStoreOnChain={onStoreOnChain}
      isPending={isPending}
      onClose={onClose}
      performanceRating={getPerformanceRating(performance.value).text}
      performanceValue={performance.value}
      quizScore={quizScore}
      quizSize={quizSize}
    />
  );
}

