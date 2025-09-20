"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Award, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FormattedCampaignTemplate, Address } from "../../../types";
import { formatEther, formatUnits, Hex } from "viem";
import { hexToString } from "viem";

interface RewardClaimModalProps {
  campaign: FormattedCampaignTemplate;
  epochIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

interface RewardInfo {
  canClaim: boolean;
  totalScore: bigint;
  totalRewards: bigint;
  nativeReward: bigint;
  erc20Rewards: Array<{
    token: Address;
    amount: bigint;
    name: string;
    symbol: string;
  }>;
  reason?: string;
}

// Main Reward Claim Modal Component
export default function RewardClaimModal({ 
  campaign, 
  epochIndex, 
  isOpen, 
  onClose 
}: RewardClaimModalProps) {
  const { address } = useAccount();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const [customError, setCustomError] = useState<string | null>(null);

  // const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  // Check if user has participated in this epoch
  const { isFundedCampaign, hasParticipated } = useMemo(() => {
    if (!address || !campaign.epochData[epochIndex]) return { isFundedCampaign: false, hasParticipated: false, isEligible: false };
    const epochData = campaign.epochData[epochIndex];
    const isFundedCampaign = (epochData.setting.funds.nativeAss > 0n || epochData.setting.funds.nativeInt > 0n) || epochData.setting.funds.erc20Ass.some(token => token.amount > 0n) || epochData.setting.funds.erc20Int.some(token => token.amount > 0n);
    const hasParticipated = epochData.learners.some(learner => 
      learner.id.toLowerCase() === address.toLowerCase() && learner.poass.some(poa => poa.score > 0)
    );
    // const isEligible = isFundedCampaign && hasParticipated;
    return { 
      isFundedCampaign, 
      hasParticipated
    };
  }, [address, campaign.epochData, epochIndex]);

  // Calculate user's rewards
  const userRewards = useMemo((): RewardInfo => {
    if (!address || !isFundedCampaign || !hasParticipated || !campaign.epochData[epochIndex]) {
      return {
        canClaim: false,
        totalScore: 0n,
        totalRewards: 0n,
        nativeReward: 0n,
        erc20Rewards: [],
        reason: "User has not participated in this epoch"
      };
    }

    const epochData = campaign.epochData[epochIndex];
    const userLearner = epochData.learners.find(learner => 
      learner.id.toLowerCase() === address.toLowerCase()
    );

    if (!userLearner) {
      return {
        canClaim: false,
        totalScore: 0n,
        totalRewards: 0n,
        nativeReward: 0n,
        erc20Rewards: [],
        reason: "User data not found"
      };
    }

    // Calculate total score from user's proofs
    const totalScore = userLearner.poass.reduce((sum, poa) => sum + BigInt(poa.score), 0n);
    
    if (totalScore === 0n) {
      return {
        canClaim: false,
        totalScore: 0n,
        totalRewards: 0n,
        nativeReward: 0n,
        erc20Rewards: [],
        reason: "No proofs of achievement to claim rewards for"
      };
    }

    // Calculate rewards based on total funds and user's contribution
    const totalAllScores = epochData.learners.reduce((sum, learner) => 
      sum + learner.poass.reduce((learnerSum, poa) => learnerSum + BigInt(poa.score), 0n), 0n
    );

    if (totalAllScores === 0n) {
      return {
        canClaim: false,
        totalScore: 0n,
        totalRewards: 0n,
        nativeReward: 0n,
        erc20Rewards: [],
        reason: "No total scores found in epoch"
      };
    }

    // Calculate proportional rewards
    const userProportion = (totalScore * 10000n) / totalAllScores; // Using 10000 for precision
    const nativeReward = (epochData.setting.funds.nativeAss * userProportion) / 10000n;
    
    const erc20Rewards = epochData.setting.funds.erc20Ass.map(token => ({
      token: token.token,
      amount: (token.amount * userProportion) / 10000n,
      name: hexToString(token.tokenName as Hex),
      symbol: hexToString(token.tokenSymbol as Hex)
    }));

    const totalRewards = nativeReward + erc20Rewards.reduce((sum, reward) => sum + reward.amount, 0n);

    return {
      canClaim: totalRewards > 0n,
      totalScore,
      totalRewards,
      nativeReward,
      erc20Rewards
    };
  }, [address, hasParticipated, campaign.epochData, isFundedCampaign, epochIndex]);

  const handleClaimReward = async () => {
    if (!address || !userRewards.canClaim) {
      console.error('Cannot claim reward: missing address or not eligible');
      return;
    }

    try {
      setCustomError(null);
      await writeContractAsync({
        address: campaign.contractAddress as Address,
        abi: [
          {
            name: "claimReward",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "epochIndex", type: "uint256" }
            ],
            outputs: []
          }
        ],
        functionName: "claimReward",
        args: [BigInt(epochIndex)]
      });
    } catch (err: any) {
      console.error("Error claiming reward:", err);
      
      // Parse and display user-friendly error messages
      let errorMessage = 'Failed to claim reward. Please try again.';
      
      if (err?.message) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction. Please check your wallet balance.';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected. Please try again.';
        } else if (err.message.includes('already claimed')) {
          errorMessage = 'Rewards have already been claimed for this epoch.';
        } else if (err.message.includes('not eligible')) {
          errorMessage = 'You are not eligible to claim rewards for this epoch.';
        } else if (err.message.includes('epoch not found')) {
          errorMessage = 'Epoch not found. Please refresh and try again.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = `Transaction failed: ${err.message}`;
        }
      }
      
      setCustomError(errorMessage);
    }
  };

  const epochData = campaign.epochData[epochIndex];
  const epochMetadata = useMemo(() => {
    if (!epochData) return null;
    
    return {
      startDate: new Date(Number(campaign.metadata.startDate) * 1000),
      endDate: new Date(Number(epochData.setting.endDate) * 1000),
      maxProof: epochData.setting.maxProof,
      totalLearners: epochData.learners.length,
      totalProofs: epochData.totalProofs
    };
  }, [epochData]);

  if (!epochData || !epochMetadata) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Epoch Not Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-500">The selected epoch could not be found.</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Claim Rewards - Epoch {epochIndex + 1}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                {epochMetadata.startDate.toLocaleDateString()} - {epochMetadata.endDate.toLocaleDateString()}
              </p>
            </div>
            <ConnectButton />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Epoch Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Epoch Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Learners</p>
                  <p className="font-semibold">{epochMetadata.totalLearners}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Proofs</p>
                  <p className="font-semibold">{epochMetadata.totalProofs}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Proofs/Day</p>
                  <p className="font-semibold">{epochMetadata.maxProof.toString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Your Score</p>
                  <p className="font-semibold">{userRewards.totalScore.toString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participation Status */}
          {!hasParticipated ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                You have not participated in this epoch and are not eligible to claim rewards.
              </AlertDescription>
            </Alert>
          ) : !userRewards.canClaim ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {userRewards.reason || "You are not eligible to claim rewards at this time."}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You are eligible to claim rewards for this epoch!
              </AlertDescription>
            </Alert>
          )}

          {/* Reward Breakdown */}
          {userRewards.canClaim && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Native Token Reward */}
                {userRewards.nativeReward > 0n && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Native (CELO)</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {formatEther(userRewards.nativeReward)} CELO
                    </span>
                  </div>
                )}

                {/* ERC20 Token Rewards */}
                {userRewards.erc20Rewards.map((reward, index) => (
                  <div key={`${reward.token}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">
                          {reward.symbol[0] || 'T'}
                        </span>
                      </div>
                      <span className="font-medium">
                        {reward.name} ({reward.symbol})
                      </span>
                    </div>
                    <span className="font-mono font-semibold">
                      {formatUnits(reward.amount, 18)} {reward.symbol}
                    </span>
                  </div>
                ))}

                {/* Total Rewards */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Rewards</span>
                    <span className="text-lg font-mono font-bold">
                      {formatEther(userRewards.totalRewards)} (estimated)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {(error || customError) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {customError || 'Transaction failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Rewards claimed successfully! Check your wallet for the tokens.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {userRewards.canClaim && (
              <Button 
                onClick={handleClaimReward} 
                disabled={isPending || isConfirming}
                className="min-w-[120px]"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isPending ? "Confirming..." : "Claiming..."}
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Claim Rewards
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
