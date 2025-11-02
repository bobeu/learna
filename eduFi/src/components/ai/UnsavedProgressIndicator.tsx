"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, X } from 'lucide-react';

interface UnsavedProgressIndicatorProps {
  campaignName: string;
  quizScore: number;
  performanceValue: number;
  onDismiss?: () => void;
  onClick?: () => void;
}

export default function UnsavedProgressIndicator({
  campaignName,
  quizScore,
  performanceValue,
  onDismiss,
  onClick,
}: UnsavedProgressIndicatorProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div
        className="bg-white dark:bg-surface border-2 border-amber-400 dark:border-amber-500 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px] cursor-pointer hover:shadow-xl transition-shadow"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Unsaved Progress
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate mb-2">
                {campaignName}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200">
                  Score: {quizScore}%
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200">
                  Rating: {performanceValue}/5
                </Badge>
              </div>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

