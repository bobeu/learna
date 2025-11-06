/**
 * Dialog component for handling existing completed topics
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { CompletedTopic } from '../services/topicStorageService';

interface CompletedTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  completedTopic: CompletedTopic;
  onContinue: () => void;
  onUseNew: () => void;
}

export default function CompletedTopicDialog({
  isOpen,
  onClose,
  completedTopic,
  onContinue,
  onUseNew,
}: CompletedTopicDialogProps) {
  const completedDate = new Date(completedTopic.completedAt).toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-surface mx-0 left-4 right-4 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] top-[50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
            <span className="text-base sm:text-lg">Topic Already Completed</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            You've already completed a learning path for this campaign
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2">
              {completedTopic.topicTitle}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
              {completedTopic.topicDescription}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Completed: {completedDate}</span>
              <span>•</span>
              <span className="capitalize">{completedTopic.difficulty}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Would you like to:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Continue with this topic and review the content</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Choose a new topic to learn something different</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onUseNew}
            className="w-full sm:w-auto border-neutral-300 dark:border-neutral-700 text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Choose New Topic
          </Button>
          <Button
            onClick={onContinue}
            className="bg-primary-500 text-black hover:bg-primary-400 w-full sm:w-auto text-sm sm:text-base"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Continue with This Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

