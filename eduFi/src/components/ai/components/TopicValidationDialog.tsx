/**
 * Dialog component for showing topic validation results
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopicValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isValid: boolean;
  message: string;
  topicTitle: string;
  onConfirm?: () => void;
}

export default function TopicValidationDialog({
  isOpen,
  onClose,
  isValid,
  message,
  topicTitle,
  onConfirm,
}: TopicValidationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-surface mx-0 left-4 right-4 translate-x-0 sm:left-[50%] sm:right-auto sm:translate-x-[-50%] top-[50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            {isValid ? (
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            )}
            <span className="text-base sm:text-lg">
              {isValid ? 'Topic Validated' : 'Topic Not Valid'}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Validation result for: <strong>{topicTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div
            className={`p-4 rounded-lg border ${
              isValid
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {message}
            </p>
          </div>

          {!isValid && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                Please choose a topic that's more aligned with the campaign to ensure you get the best learning experience.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {isValid && onConfirm ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  className="bg-primary-500 text-black hover:bg-primary-400 text-sm sm:text-base"
                >
                  Use This Topic
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="bg-primary-500 text-black hover:bg-primary-400 text-sm sm:text-base w-full sm:w-auto"
              >
                OK
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

