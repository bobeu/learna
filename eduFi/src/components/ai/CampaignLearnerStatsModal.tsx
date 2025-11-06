/**
 * CampaignLearnerStatsModal Component
 * 
 * Displays learner statistics for a specific campaign in a modal
 * Used on mobile screens to show campaign-specific learner data
 */

"use client";

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, BookOpenCheck, Trophy, Target, TrendingUp, Clock } from 'lucide-react';
import { CampaignStateProps } from '../../../types';
import { toBN, calculateStreak, formatAddr } from '@/components/utilities';
import { useAccount } from 'wagmi';

interface CampaignLearnerStatsModalProps {
  campaign: CampaignStateProps | null;
  isOpen: boolean;
  onClose: () => void;
}

interface LearnerStats {
  quizzesTaken: number;
  totalScore: number;
  totalPoints: number;
  averageScore: number;
  bestScore: number;
  streakDays: number;
  badges: number;
  proofsOfAssimilation: number;
  proofOfIntegration: boolean;
}

export default function CampaignLearnerStatsModal({
  campaign,
  isOpen,
  onClose,
}: CampaignLearnerStatsModalProps) {
  const { address } = useAccount();
  const userAddress = formatAddr(address);

  const learnerStats = useMemo((): LearnerStats | null => {
    if (!campaign?.__raw || !userAddress) return null;

    const userAddr = userAddress.toLowerCase();
    let quizzesTaken = 0;
    let totalScore = 0;
    let totalPoints = 0;
    let bestScore = 0;
    let streak = 0;
    let badges = 0;
    let proofsOfAssimilation = 0;
    let proofOfIntegration = false;

    campaign.__raw.epochData?.forEach((epoch) => {
      const learner = epoch.learners?.find(
        (l) => l.id.toLowerCase() === userAddr
      );

      if (learner) {
        quizzesTaken += learner.poass.length;
        proofsOfAssimilation = learner.poass.length;
        proofOfIntegration = learner.point?.verified || false;

        learner.poass.forEach((poa) => {
          totalScore += toBN(poa.score).toNumber();
          totalPoints += toBN(poa.totalPoints).toNumber();
          if (poa.percentage > bestScore) {
            bestScore = poa.percentage;
          }
        });

        streak = Math.max(streak, calculateStreak(learner.poass));
        badges += learner.ratings.reduce(
          (sum, r) => sum + toBN(r.value).toNumber(),
          0
        ) % 5;
      }
    });

    const averageScore =
      totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;

    return {
      quizzesTaken,
      totalScore,
      totalPoints,
      averageScore,
      bestScore,
      streakDays: streak,
      badges,
      proofsOfAssimilation,
      proofOfIntegration,
    };
  }, [campaign, userAddress]);

  if (!campaign || !learnerStats) {
    return null;
  }

  const stats = [
    {
      icon: <BookOpenCheck className="w-5 h-5" />,
      label: 'Quizzes Taken',
      value: String(learnerStats.quizzesTaken),
      color: 'text-blue-500',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Average Score',
      value: `${learnerStats.averageScore}%`,
      color: 'text-green-500',
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Best Score',
      value: `${learnerStats.bestScore}%`,
      color: 'text-yellow-500',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Streak',
      value: `${learnerStats.streakDays} days`,
      color: 'text-primary-500',
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Proofs of Assimilation',
      value: String(learnerStats.proofsOfAssimilation),
      color: 'text-purple-500',
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Badges',
      value: String(learnerStats.badges),
      color: 'text-orange-500',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Your Campaign Stats
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
            {campaign.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-neutral-200 dark:border-neutral-800"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center ${stat.color}`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {learnerStats.proofOfIntegration && (
            <Card className="border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-700 dark:text-primary-300" />
                  </div>
                  <div>
                    <div className="text-xs text-primary-700 dark:text-primary-300 font-medium">
                      Proof of Integration
                    </div>
                    <div className="text-sm text-primary-800 dark:text-primary-200 font-semibold">
                      Verified ✓
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

