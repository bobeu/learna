/**
 * Dialog for user to choose between continuing with saved article or reading a different topic
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
import { BookOpen, FileText } from 'lucide-react';

interface ContinueOrNewArticleDialogProps {
  isOpen: boolean;
  articleTitle: string;
  onContinue: () => void;
  onDifferentTopic: () => void;
}

export default function ContinueOrNewArticleDialog({
  isOpen,
  articleTitle,
  onContinue,
  onDifferentTopic,
}: ContinueOrNewArticleDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Continue Reading?
          </DialogTitle>
          <DialogDescription>
            You have a saved article for this topic.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 rounded bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Saved Article:
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words">
              {articleTitle}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onContinue}
              className="flex-1 bg-primary-500 text-black hover:bg-primary-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Continue Reading
            </Button>
            <Button
              onClick={onDifferentTopic}
              variant="outline"
              className="flex-1 border-neutral-300 dark:border-neutral-700"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Different Topic
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

