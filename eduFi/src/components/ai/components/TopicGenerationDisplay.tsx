/**
 * Component for displaying Gemini's greeting, campaign info, and generated topics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { GeneratedTopic } from '../TopicSelection';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicGenerationDisplayProps {
  greeting: string | null;
  campaignInfo: string | null;
  topics: GeneratedTopic[];
  isGenerating: boolean;
  onTopicSelect: (topic: GeneratedTopic) => void;
  getDifficultyColor: (difficulty: string) => string;
  selectedTopicId?: string | null;
}

export default function TopicGenerationDisplay({
  greeting,
  campaignInfo,
  topics,
  isGenerating,
  onTopicSelect,
  getDifficultyColor,
  selectedTopicId,
}: TopicGenerationDisplayProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Greeting and Campaign Info */}
      <AnimatePresence>
        {(greeting || campaignInfo) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {greeting && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white leading-relaxed">
                    {greeting}
                  </p>
                </div>
              </div>
            )}
            
            {campaignInfo && (
              <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {campaignInfo}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isGenerating && topics.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8 sm:py-12"
        >
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary-500 mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Generating topics for you...
          </p>
        </motion.div>
      )}

      {/* Topics Grid */}
      <AnimatePresence>
        {topics.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          >
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="cursor-pointer"
                onClick={() => onTopicSelect(topic)}
              >
                <Card
                  className={`hover:shadow-lg transition-all duration-200 ${
                    selectedTopicId === topic.id
                      ? 'border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md ring-2 ring-primary-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600'
                  }`}
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 flex-1">
                        {topic.title}
                      </CardTitle>
                      <Badge className={getDifficultyColor(topic.difficulty)}>
                        {topic.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {topic.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

