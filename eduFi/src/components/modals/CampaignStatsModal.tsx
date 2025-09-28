"use client";
/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Trophy, 
  Calendar, 
  DollarSign, 
  Settings, 
  Award,
  Target,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  // Wallet
} from "lucide-react";
import { useAccount } from "wagmi";
import { FormattedCampaignTemplate, EpochData, Learner, Address } from "../../../types";
import { formatEther, formatUnits, Hex, hexToString } from "viem";
import LearnerProfileModal from "./LearnerProfileModal";
import CampaignSettingsModal from "./CampaignSettingsModal";
import RewardClaimModal from "./RewardClaimModal";
import { formatAddr, formattedMockCampaignsTemplate, normalizeString, toBN } from '../utilities';

interface CampaignStatsModalProps {
  campaign: FormattedCampaignTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EpochStatsProps {
  epochData: EpochData;
  epochIndex: number;
  onLearnerClick: (learner: Learner) => void;
  onClaimReward: (epochIndex: number) => void;
  isOwner: boolean;
  userAddress?: Address;
}

interface LearnerListProps {
  learners: Learner[];
  onLearnerClick: (learner: Learner) => void;
}

interface FundDisplayProps {
  funds: EpochData['setting']['funds'];
  title: string;
}

// Fund Display Component
function FundDisplay({ funds, title }: FundDisplayProps) {
  const totalNative = useMemo(() => {
    return formatEther(funds.nativeAss + funds.nativeInt);
  }, [funds.nativeAss, funds.nativeInt]);

  const erc20Tokens = useMemo(() => {
    const allTokens = [...funds.erc20Ass, ...funds.erc20Int];
    return allTokens.map(token => ({
      token: token.token,
      name: hexToString(token.tokenName as Hex),
      symbol: hexToString(token.tokenSymbol as Hex),
      amount: formatUnits(token.amount, token.decimals),
      decimals: token.decimals
    }));
  }, [funds.erc20Ass, funds.erc20Int]);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-gray-700">{title}</h4>
      
      {/* Native Funds */}
      <div className="flex items-center justify-between p-3 border border-gray-600/40 rounded-lg">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">Native (CELO)</span>
        </div>
        <span className="font-mono text-sm">{totalNative} CELO</span>
      </div>

      {/* ERC20 Tokens */}
      {erc20Tokens.map((token, index) => (
        <div key={`${token.token}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">{token.symbol[0]}</span>
            </div>
            <span className="text-sm font-medium">{token.name} ({token.symbol})</span>
          </div>
          <span className="font-mono text-sm">{token.amount}</span>
        </div>
      ))}
    </div>
  );
}

// Learner List Component
function LearnerList({ learners, onLearnerClick }: LearnerListProps) {
  return (
    <div className="space-y-2">
      {learners.map((learner,) => {
        const ratingSize = learner.ratings.length;
        const totalRating = learner.ratings.reduce((sum, rating) => sum + rating.value, 0);
        const totalScore = learner.poass.reduce((sum, poa) => sum + poa.score, 0);
        const avgRating = ratingSize > 0? totalRating / ratingSize : 0;

        return (
          <Card 
            key={learner.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onLearnerClick(learner)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {learner.id.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {learner.id.slice(0, 6)}...{learner.id.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {learner.poass.length} proofs • {learner.ratings.length} ratings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {totalScore} pts
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Avg: {avgRating.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Epoch Stats Component
function EpochStats({ epochData, epochIndex, onLearnerClick, onClaimReward, isOwner, userAddress }: EpochStatsProps) {
  const totalLearners = epochData.learners.length;
  const totalProofs = epochData.totalProofs;
  const maxProofsPerDay = epochData.setting.maxProof;
  const endDate = new Date(Number(epochData.setting.endDate) * 1000);

  return (
    <div className="space-y-6">
      {/* Epoch Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Epoch {epochIndex + 1}</h3>
          <p className="text-sm text-gray-500">
            Ends: {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString()}
          </p>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalLearners}</p>
                <p className="text-xs text-gray-500">Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{totalProofs}</p>
                <p className="text-xs text-gray-500">Total Proofs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{maxProofsPerDay}</p>
                <p className="text-xs text-gray-500">Max/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {totalLearners > 0 ? (totalProofs / totalLearners).toFixed(1) : 0}
                </p>
                <p className="text-xs text-gray-500">Avg/User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funds Display */}
      <div className="grid md:grid-cols-2 gap-6">
        <FundDisplay 
          funds={epochData.setting.funds} 
          title="Total Campaign Funds" 
        />
      </div>

      {/* Learners Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Learners ({totalLearners})</h4>
          {userAddress && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onClaimReward(epochIndex)}
            >
              <Award className="w-4 h-4 mr-2" />
              Claim Rewards
            </Button>
          )}
        </div>
        <LearnerList 
          learners={epochData.learners} 
          onLearnerClick={onLearnerClick} 
        />
      </div>
    </div>
  );
}

// Main Campaign Stats Modal Component
export default function CampaignStatsModal({ campaign: inCampaign, isOpen, onClose }: CampaignStatsModalProps) {
  const { address } = useAccount();
  const userAddress = formatAddr(address).toLowerCase();
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showClaimReward, setShowClaimReward] = useState(false);
  const [selectedEpoch, setSelectedEpoch] = useState(0);

  const {isOwner, campaign} = useMemo(() => {
    const defaultCampaign : FormattedCampaignTemplate = formattedMockCampaignsTemplate[0];
    // console.log("defaultValue", defaultCampaign);
    if(!inCampaign) return { isOwner: false, campaign: defaultCampaign};
    return { isOwner: userAddress === inCampaign.owner.toLowerCase(), campaign: inCampaign};
  }, [inCampaign?.owner, userAddress]);

  const { campaignMetadata, totalProofs } = useMemo(() => {
    const totalProofs = campaign.epochData.reduce((sum, epoch) => sum + toBN(epoch.totalProofs).toNumber(), 0);
    const campaignMetadata =  {
      name: normalizeString(campaign.metadata.name as Hex),
      description: normalizeString(campaign.metadata.description as Hex),
      link: normalizeString(campaign.metadata.link as Hex),
      imageUrl: normalizeString(campaign.metadata.imageUrl as Hex),
      startDate: new Date(Number(campaign.metadata.startDate) * 1000),
      endDate: new Date(Number(campaign.metadata.endDate) * 1000),
    };
    return { campaignMetadata, totalProofs }
  }, [campaign?.metadata, campaign?.epochData]);

  const handleLearnerClick = (learner: Learner) => {
    setSelectedLearner(learner);
  };

  const handleClaimReward = (epochIndex: number) => {
    setSelectedEpoch(epochIndex);
    setShowClaimReward(true);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {campaignMetadata.name} - Campaign Analytics
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {campaignMetadata.description}
                </p>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="epochs">Epochs ({campaign.epochData.length})</TabsTrigger>
              <TabsTrigger value="settings" disabled={!isOwner}>
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Campaign Overview */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {campaign.epochData.reduce((sum, epoch) => sum + epoch.learners.length, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Total Learners</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {totalProofs}
                        </p>
                        <p className="text-xs text-gray-500">Total Proofs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {campaign.epoches.toString()}
                        </p>
                        <p className="text-xs text-gray-500">Total Epochs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaign Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="text-sm">{campaignMetadata.startDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <p className="text-sm">{campaignMetadata.endDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Owner</p>
                      <p className="text-sm font-mono">{campaign.owner}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contract</p>
                      <p className="text-sm font-mono">{campaign.contractAddress}</p>
                    </div>
                  </div>
                  
                  {campaignMetadata.link && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Documentation</p>
                      <a 
                        href={campaignMetadata.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {campaignMetadata.link}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="epochs" className="space-y-6">
              {campaign.epochData.map((epochData, index) => (
                <EpochStats
                  key={index}
                  epochData={epochData}
                  epochIndex={index}
                  onLearnerClick={handleLearnerClick}
                  onClaimReward={handleClaimReward}
                  isOwner={isOwner}
                  userAddress={address}
                />
              ))}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Settings</CardTitle>
                  <p className="text-sm text-gray-500">
                    Manage your campaign settings and funding
                  </p>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleSettingsClick} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Open Settings Panel
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Learner Profile Modal */}
      {selectedLearner && (
        <LearnerProfileModal
          learner={selectedLearner}
          isOpen={!!selectedLearner}
          onClose={() => setSelectedLearner(null)}
        />
      )}

      {/* Campaign Settings Modal */}
      {showSettings && (
        <CampaignSettingsModal
          campaign={campaign}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Reward Claim Modal */}
      {showClaimReward && (
        <RewardClaimModal
          campaign={campaign}
          epochIndex={selectedEpoch}
          isOpen={showClaimReward}
          onClose={() => setShowClaimReward(false)}
        />
      )}
    </>
  );
}
