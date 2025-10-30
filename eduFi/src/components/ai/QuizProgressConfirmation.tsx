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
import { AlertTriangle, Save, X } from 'lucide-react';

interface QuizProgressConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndClose: () => void;
  onDiscard: () => void;
}

export default function QuizProgressConfirmation({
  isOpen,
  onClose,
  onSaveAndClose,
  onDiscard,
}: QuizProgressConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-surface border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Unsaved Progress
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            You have unsaved quiz results and performance data. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your progress will be saved temporarily so you can return later to save it on-chain.
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
            Discard
          </Button>
          <Button
            onClick={onSaveAndClose}
            className="bg-primary-500 text-black hover:bg-primary-400"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

