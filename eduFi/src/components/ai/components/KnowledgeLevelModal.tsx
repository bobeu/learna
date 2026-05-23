/**
 * Knowledge Level Selection Modal
 * Displays when user selects a campaign for the first time
 * Collects user's experience level and generates personalized learning path
 */

"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

interface KnowledgeLevelModalProps {
  isOpen: boolean;
  campaignName: string;
  campaignDescription: string;
  onSelect: (level: KnowledgeLevel, experienceNotes: string) => void;
  onClose: () => void;
  isGenerating?: boolean;
}

const levelDescriptions = {
  beginner: {
    title: 'Beginner',
    description: 'I\'m new to this topic and want to start from the basics',
    icon: '🌱',
  },
  intermediate: {
    title: 'Intermediate',
    description: 'I have some experience but want to deepen my understanding',
    icon: '📚',
  },
  advanced: {
    title: 'Advanced',
    description: 'I\'m experienced and want to master advanced concepts',
    icon: '🚀',
  },
};

const experienceQuestions = [
  {
    id: 'q1',
    question: 'Have you worked with similar technologies or concepts before?',
    options: ['Never', 'A little bit', 'Moderately', 'Extensively'],
  },
  {
    id: 'q2',
    question: 'How comfortable are you with the fundamentals?',
    options: ['Not comfortable', 'Somewhat comfortable', 'Comfortable', 'Very comfortable'],
  },
  {
    id: 'q3',
    question: 'What is your primary goal for learning this?',
    options: ['Just exploring', 'Building a project', 'Professional development', 'Mastery'],
  },
];

export default function KnowledgeLevelModal({
  isOpen,
  campaignName,
  campaignDescription,
  onSelect,
  onClose,
  isGenerating = false,
}: KnowledgeLevelModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel | null>(null);
  const [experienceNotes, setExperienceNotes] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    if (selectedLevel) {
      // Combine level, question answers, and notes for Gemini AI
      const combinedNotes = [
        `Selected Level: ${selectedLevel}`,
        ...Object.entries(questionAnswers).map(([qId, answer]) => {
          const question = experienceQuestions.find(q => q.id === qId);
          return question ? `${question.question}: ${answer}` : '';
        }).filter(Boolean),
        experienceNotes ? `Additional Notes: ${experienceNotes}` : '',
      ].join('\n');
      
      onSelect(selectedLevel, combinedNotes);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setSelectedLevel(null);
      setExperienceNotes('');
      setQuestionAnswers({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent 
        className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-surface"
        hideCloseButton={isGenerating}
        preventOutsideClose={isGenerating}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
            <span>Personalize Your Learning Path</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Help us understand your current level to create a tailored learning experience for <strong>{campaignName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campaign Info */}
          <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Campaign:</strong> {campaignName}
            </p>
            {campaignDescription && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {campaignDescription}
              </p>
            )}
          </div>

          {/* Questions to Gauge Experience */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">
                1. How familiar are you with {campaignName}?
              </Label>
              <div className="space-y-3">
                {Object.entries(levelDescriptions).map(([level, info]) => (
                  <motion.div
                    key={level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedLevel(level as KnowledgeLevel)}
                      disabled={isGenerating}
                      className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                        selectedLevel === level
                          ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                        selectedLevel === level
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-neutral-400 dark:border-neutral-600'
                      }`}>
                        {selectedLevel === level && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{info.icon}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {info.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {info.description}
                        </p>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Experience Questions */}
            {experienceQuestions.map((q, idx) => (
            <div key={q.id} className="space-y-3">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">
                {idx + 2}. {q.question}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {q.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setQuestionAnswers(prev => ({ ...prev, [q.id]: option }))}
                    disabled={isGenerating}
                    className={`p-2 rounded-lg border-2 text-sm transition-all ${
                      questionAnswers[q.id] === option
                        ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="experience-notes" className="text-base font-semibold text-gray-900 dark:text-white">
              {experienceQuestions.length + 2}. What specific aspects of {campaignName} would you like to focus on? (Optional)
            </Label>
            <Textarea
              id="experience-notes"
              placeholder="E.g., I've worked with similar technologies before, I understand the basics but want to go deeper..."
              value={experienceNotes}
              onChange={(e) => setExperienceNotes(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This helps us create a more personalized learning path for you
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedLevel || isGenerating}
              className="flex-1 bg-primary-500 text-black hover:bg-primary-400"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Path...
                </>
              ) : (
                <>
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

