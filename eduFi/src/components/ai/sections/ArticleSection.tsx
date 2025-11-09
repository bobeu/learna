/**
 * Article Reading Section Component
 * Wrapper for ArticleReading component
 */

"use client";

import React from 'react';
import ArticleReading, { Steps } from '../ArticleReading';

interface GeneratedArticle {
  title: string;
  content: string;
  wordCount: number;
  readingTime: number;
}

interface ArticleSectionProps {
  article: GeneratedArticle | null;
  selectedTopicTitle: string | undefined;
  isGenerating: boolean;
  onGenerateQuiz: () => void | Promise<void>;
  onSetCurrentStep: (step: Steps) => void;
}

export default function ArticleSection({
  article,
  selectedTopicTitle,
  isGenerating,
  onGenerateQuiz,
  onSetCurrentStep,
}: ArticleSectionProps) {
  return (
    <ArticleReading
      articleContent={article?.content}
      articleTitle={article?.title}
      generateQuiz={onGenerateQuiz}
      isArticleReady={article !== null}
      isGenerating={isGenerating}
      readingTime={article?.readingTime}
      setCurrentStep={onSetCurrentStep}
      selectedTopicTitle={selectedTopicTitle}
    />
  );
}

