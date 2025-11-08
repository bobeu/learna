/**
 * Dialog to inform user about quiz expiry and ask if they want to regenerate
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
import { AlertTriangle, RefreshCw, BookOpen } from 'lucide-react';

interface QuizExpiryDialogProps {
  isOpen: boolean;
  timeRemaining?: number; // minutes
  isExpired: boolean;
  onRegenerateSame: () => void;
  onDifferentTopic: () => void;
}

export default function QuizExpiryDialog({
  isOpen,
  timeRemaining,
  isExpired,
  onRegenerateSame,
  onDifferentTopic,
}: QuizExpiryDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Quiz Session {isExpired ? 'Expired' : 'Expiring Soon'}
          </DialogTitle>
          <DialogDescription>
            {isExpired ? (
              'Your quiz session has expired (3 minutes). The saved quiz data has been cleared.'
            ) : (
              `Your quiz session will expire in ${timeRemaining} minute${timeRemaining !== 1 ? 's' : ''}. After expiration, you won't be able to recover your progress.`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!isExpired && timeRemaining && timeRemaining > 0 && (
            <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ You have {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''} remaining to complete your quiz.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onRegenerateSame}
              className="flex-1 bg-primary-500 text-black hover:bg-primary-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate from Same Topic
            </Button>
            <Button
              onClick={onDifferentTopic}
              variant="outline"
              className="flex-1 border-neutral-300 dark:border-neutral-700"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Choose Different Topic
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

