"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Coins, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { CampaignTemplateReadData, Learner, Performance } from "../../../types";
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';

interface BuilderRewardsProps {
  campaign: CampaignTemplateReadData;
  learnerData: Learner;
}

export default function BuilderRewards({ campaign, learnerData }: BuilderRewardsProps) {
  const { address, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total earnings from all epochs
  const totalEarnings = useMemo(() => {
    let totalNative = 0n;
    let totalERC20: Record<string, { amount: bigint; symbol: string }> = {};

    campaign.epochData.forEach(epoch => {
      const { setting } = epoch;
      
      // Calculate native rewards
      const nativeReward = setting.funds.nativeAss + setting.funds.nativeInt;
      totalNative += nativeReward;

      // Calculate ERC20 rewards
      [...setting.funds.erc20Ass, ...setting.funds.erc20Int].forEach(token => {
        const key = token.token.toLowerCase();
        if (!totalERC20[key]) {
          totalERC20[key] = { amount: 0n, symbol: token.tokenSymbol };
        }
        totalERC20[key].amount += token.amount;
      });
    });

    return { native: totalNative, erc20: totalERC20 };
  }, [campaign]);

  // Calculate user's performance score
  const performanceScore = useMemo(() => {
    if (!learnerData.ratings || learnerData.ratings.length === 0) return 0;
    const totalRating = learnerData.ratings.reduce((sum, rating) => sum + rating.value, 0);
    return totalRating / learnerData.ratings.length;
  }, [learnerData]);

  // Check if user is eligible to claim
  const isEligibleToClaim = useMemo(() => {
    // User must have completed at least one proof of assimilation
    const hasCompletedPoass = learnerData.poass && learnerData.poass.length > 0;
    
    // User must have a performance rating
    const hasPerformanceRating = learnerData.ratings && learnerData.ratings.length > 0;
    
    // Performance score should be above threshold (e.g., 60%)
    const meetsPerformanceThreshold = performanceScore >= 60;
    
    return hasCompletedPoass && hasPerformanceRating && meetsPerformanceThreshold;
  }, [learnerData, performanceScore]);

  // Calculate claimable amounts based on performance
  const claimableAmounts = useMemo(() => {
    if (!isEligibleToClaim) return { native: 0n, erc20: {} };

    // Performance multiplier (0.5 to 1.0 based on score)
    const performanceMultiplier = Math.max(0.5, performanceScore / 100);
    
    const claimableNative = BigInt(Math.floor(Number(totalEarnings.native) * performanceMultiplier));
    const claimableERC20: Record<string, { amount: bigint; symbol: string }> = {};

    Object.entries(totalEarnings.erc20).forEach(([address, token]) => {
      claimableERC20[address] = {
        amount: BigInt(Math.floor(Number(token.amount) * performanceMultiplier)),
        symbol: token.symbol
      };
    });

    return { native: claimableNative, erc20: claimableERC20 };
  }, [totalEarnings, performanceScore, isEligibleToClaim]);

  const createClaimSteps = (): TransactionStep[] => {
    const steps: TransactionStep[] = [];
    
    // Add claim step for native tokens
    if (claimableAmounts.native > 0n) {
      steps.push({
        id: 'claim-native',
        title: 'Claim Native Rewards',
        description: `Claiming ${formatEther(claimableAmounts.native)} CELO`,
        functionName: 'claimReward' as any,
        contractAddress: campaign.owner, // Campaign address
        abi: [], // Will be filled with actual ABI
        args: ['native', claimableAmounts.native],
      });
    }

    // Add claim steps for ERC20 tokens
    Object.entries(claimableAmounts.erc20).forEach(([address, token]) => {
      if (token.amount > 0n) {
        steps.push({
          id: `claim-erc20-${address}`,
          title: `Claim ${token.symbol} Rewards`,
          description: `Claiming ${formatEther(token.amount)} ${token.symbol}`,
          functionName: 'claimReward' as any,
          contractAddress: campaign.owner,
          abi: [],
          args: [address, token.amount],
        });
      }
    });

    return steps;
  };

  const handleClaim = () => {
    const steps = createClaimSteps();
    if (steps.length === 0) {
      alert('No rewards available to claim');
      return;
    }
    setShowClaimModal(true);
  };

  const handleClaimSuccess = (txHash: string) => {
    console.log('Claim transaction successful:', txHash);
    setShowClaimModal(false);
  };

  const handleClaimError = (error: Error) => {
    console.error('Claim transaction failed:', error);
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Very Good</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Good</Badge>;
    if (score >= 60) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>;
  };

  return (
    <>
      <Card className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Coins className="w-5 h-5" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Performance Score */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {performanceScore.toFixed(1)}%
              </span>
              {getPerformanceBadge(performanceScore)}
            </div>
          </div>

          {/* Eligibility Status */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Claim Eligibility</span>
            </div>
            <Badge className={isEligibleToClaim ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
              {isEligibleToClaim ? "Eligible" : "Not Eligible"}
            </Badge>
          </div>

          {/* Claimable Rewards */}
          {isEligibleToClaim && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Claimable Rewards</h4>
              
              {claimableAmounts.native > 0n && (
                <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">CELO</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatEther(claimableAmounts.native)}
                  </span>
                </div>
              )}

              {Object.entries(claimableAmounts.erc20).map(([address, token]) => (
                token.amount > 0n && (
                  <div key={address} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{token.symbol}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatEther(token.amount)}
                    </span>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Claim Button */}
          <Button
            onClick={handleClaim}
            disabled={!isEligibleToClaim || isPending}
            className="w-full bg-primary-500 text-black hover:bg-primary-400"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Claim Rewards
              </>
            )}
          </Button>

          {!isEligibleToClaim && (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="font-medium mb-1">To become eligible for rewards:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Complete at least one proof of assimilation</li>
                <li>Receive performance ratings from campaign creators</li>
                <li>Maintain a performance score above 60%</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Claim Your Rewards"
        description="Please confirm the transactions to claim your earned rewards"
        steps={createClaimSteps()}
        onSuccess={handleClaimSuccess}
        onError={handleClaimError}
      />
    </>
  );
}
