"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, X, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SavedProgressDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  quizScore: number;
  performanceValue: number;
  savedAt: number;
}

export default function SavedProgressDialog({
  isOpen,
  onContinue,
  onDiscard,
  quizScore,
  performanceValue,
  savedAt,
}: SavedProgressDialogProps) {
  // Calculate days since saved
  const daysSinceSaved = Math.floor((Date.now() - savedAt) / (1000 * 60 * 60 * 24));
  const savedDate = new Date(savedAt).toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-white dark:bg-surface border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Found Saved Progress
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            You have previously saved quiz progress for this campaign. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Saved Progress Details
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200">
                    Score: {quizScore}%
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200">
                    Rating: {performanceValue}/5
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300">
                    <Clock className="w-3 h-3" />
                    <span>Saved {daysSinceSaved} {daysSinceSaved === 1 ? 'day' : 'days'} ago ({savedDate})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              If you continue, your saved progress will be restored and you can save it on-chain. If you discard, all local progress will be permanently deleted.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600"
          >
            <X className="w-4 h-4 mr-2" />
            Discard Progress
          </Button>
          <Button
            onClick={onContinue}
            className="bg-primary-500 text-black hover:bg-primary-400"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Continue with Saved Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

