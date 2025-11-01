/* eslint-disable */

"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Trophy,
} from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FormattedCampaignTemplate } from "../../../types";
import { goodDollarService, GoodDollarUser, GoodDollarReward } from "../../services/goodDollarService";

interface GoodDollarIntegrationModalProps {
  campaign: FormattedCampaignTemplate;
  epochIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function GoodDollarIntegrationModal({ 
  campaign, 
  epochIndex, 
  isOpen, 
  onClose 
}: GoodDollarIntegrationModalProps) {
  const { address } = useAccount();
  const [userInfo, setUserInfo] = useState<GoodDollarUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ success: boolean; reward?: GoodDollarReward; error?: string } | null>(null);
  const [potentialRewards, setPotentialRewards] = useState<{
    estimatedReward: string;
    canClaim: boolean;
    requirements: string[];
  } | null>(null);

  const loadUserInfo = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const [user, rewards] = await Promise.all([
        goodDollarService.getUserInfo(address),
        goodDollarService.calculatePotentialRewards(address, campaign.contractInfo.address, epochIndex)
      ]);
      
      setUserInfo(user);
      setPotentialRewards(rewards);
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load user information when modal opens
  useEffect(() => {
    if (isOpen && address) {
      loadUserInfo();
    }
  }, [isOpen, address, loadUserInfo]);

  const handleRegister = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const result = await goodDollarService.registerUser(address);
      if (result.success) {
        await loadUserInfo(); // Refresh user info
      } else {
        setClaimResult({ success: false, error: result.error });
      }
    } catch (error: any) {
      setClaimResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!address) return;

    setIsClaiming(true);
    try {
      const result = await goodDollarService.claimCampaignRewards(
        address, 
        campaign.contractInfo.address, 
        epochIndex
      );
      
      setClaimResult(result);
      
      if (result.success) {
        await loadUserInfo(); // Refresh user info
      }
    } catch (error: any) {
      setClaimResult({ success: false, error: error.message });
    } finally {
      setIsClaiming(false);
    }
  };

  const epochData = campaign.epochData[epochIndex];
  const hasParticipated = address && epochData?.learners.some(learner => 
    learner.id.toLowerCase() === address.toLowerCase()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                GoodDollar Integration
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Earn GoodDollar (G$) tokens for participating in this campaign
              </p>
            </div>
            <ConnectButton />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Status */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading user information...</p>
              </CardContent>
            </Card>
          ) : userInfo ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your GoodDollar Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${userInfo.isRegistered ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      {userInfo.isRegistered ? 'Registered' : 'Not Registered'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${userInfo.canClaim ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-sm">
                      {userInfo.canClaim ? 'Can Claim' : 'Cannot Claim'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">G$ Balance</span>
                  <span className="font-mono font-semibold">{userInfo.balance} G$</span>
                </div>

                {!userInfo.isRegistered && (
                  <Button onClick={handleRegister} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Register with GoodDollar
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Campaign Participation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Participation</CardTitle>
            </CardHeader>
            <CardContent>
              {hasParticipated ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have participated in this epoch and are eligible for GoodDollar rewards.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have not participated in this epoch and are not eligible for rewards.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Potential Rewards */}
          {potentialRewards && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Potential Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Estimated G$ Reward</span>
                  <span className="font-mono font-semibold text-green-600">
                    {potentialRewards.estimatedReward} G$
                  </span>
                </div>

                {potentialRewards.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {potentialRewards.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Claim Results */}
          {claimResult && (
            <Alert variant={claimResult.success ? "default" : "destructive"}>
              {claimResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {claimResult.success 
                  ? `Successfully claimed ${claimResult.reward?.amount} G$! Transaction: ${claimResult.reward?.transactionHash}`
                  : `Error: ${claimResult.error}`
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {hasParticipated && userInfo?.isRegistered && userInfo?.canClaim && (
              <Button 
                onClick={handleClaimRewards} 
                disabled={isClaiming}
                className="min-w-[140px]"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Claim G$ Rewards
                  </>
                )}
              </Button>
            )}
          </div>

          {/* GoodDollar Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About GoodDollar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                GoodDollar is a protocol that creates a universal basic income (UBI) token. 
                By participating in educational campaigns, you can earn G$ tokens that can be 
                used for various purposes within the GoodDollar ecosystem.
              </p>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <a 
                  href="https://gooddollar.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Learn more about GoodDollar
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
