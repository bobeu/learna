/**
 * Dialog for user to choose between continuing with saved topics or generating new ones
 */

"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles } from 'lucide-react';
import { GeneratedTopic } from '../TopicSelection';

interface ContinueOrNewTopicDialogProps {
  isOpen: boolean;
  savedTopics: GeneratedTopic[];
  onContinue: () => void;
  onNewTopics: () => void;
}

export default function ContinueOrNewTopicDialog({
  isOpen,
  savedTopics,
  onContinue,
  onNewTopics,
}: ContinueOrNewTopicDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            Continue Learning?
          </DialogTitle>
          <DialogDescription>
            We found {savedTopics.length} saved topic{savedTopics.length !== 1 ? 's' : ''} for this campaign.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Saved Topics:
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {savedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-900/50"
                >
                  • {topic.title}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onContinue}
              className="flex-1 bg-primary-500 text-black hover:bg-primary-400"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Continue with Saved Topics
            </Button>
            <Button
              onClick={onNewTopics}
              variant="outline"
              className="flex-1 border-neutral-300 dark:border-neutral-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Topics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

