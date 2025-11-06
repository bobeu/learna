/**
 * Component for allowing users to input custom topics
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomTopicInputProps {
  onValidate: (topic: string) => Promise<void>;
  isValidating: boolean;
  isDisabled?: boolean;
}

export default function CustomTopicInput({
  onValidate,
  isValidating,
  isDisabled,
}: CustomTopicInputProps) {
  const [topic, setTopic] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isValidating) return;
    
    await onValidate(topic.trim());
    setTopic('');
  };

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-2 border-t border-neutral-200 dark:border-neutral-800 mt-4 sm:mt-6"
      >
        <div className="text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
            Don&apos;t see a topic you like? Enter your own!
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(true)}
            disabled={isDisabled}
            className="w-full sm:w-auto border-neutral-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Suggest Your Own Topic
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="pt-4 border-t border-neutral-200 dark:border-neutral-800"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="custom-topic" className="text-sm font-medium text-gray-900 dark:text-white">
            Enter a topic you&apos;d like to learn
          </Label>
          <Input
            id="custom-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Smart Contract Security Best Practices"
            disabled={isValidating || isDisabled}
            className="mt-2 text-sm sm:text-base"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {topic.length}/100 characters
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!topic.trim() || isValidating || isDisabled}
            className="bg-primary-500 text-black hover:bg-primary-400 flex-1 sm:flex-initial"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Topic'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsExpanded(false);
              setTopic('');
            }}
            disabled={isValidating}
            className="border-neutral-300 dark:border-neutral-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

