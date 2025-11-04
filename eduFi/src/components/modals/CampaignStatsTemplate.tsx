"use client";
/* eslint-disable */
import React, { useState, useMemo } from 'react';
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
  // Award,
  Target,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  // Wallet
} from "lucide-react";
import { useAccount } from "wagmi";
import { FormattedCampaignTemplate, EpochData, Learner, Address, Funds } from "../../../types";
import { formatEther, formatUnits, Hex, hexToString } from "viem";
import LearnerProfileModal from "./LearnerProfileModal";
import CampaignSettingsModal from "./CampaignSettingsModal";
// Reward claiming is handled in the Builder profile, not here
import { formatAddr, normalizeString, toBN } from '../utilities';
import AddressWrapper from '../peripherals/AddressFormatter/AddressWrapper';

interface CampaignStatsModalProps {
  campaign: FormattedCampaignTemplate;
}

export interface EpochStatsProps {
  epochData: EpochData;
  epochIndex: number;
  onLearnerClick: (learner: Learner) => void;
  onClaimReward: (epochIndex: number) => void;
  isOwner: boolean;
  userAddress?: Address;
}

export interface LearnerListProps {
  learners: Learner[];
  onLearnerClick: (learner: Learner) => void;
}

export interface FundDisplayProps {
  funds: Funds;
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
      // name: hexToString(token.tokenName as Hex),
      name: token.tokenName,
      symbol: token.tokenSymbol,
      amount: formatUnits(token.amount, token.decimals),
      decimals: token.decimals
    }));
  }, [funds.erc20Ass, funds.erc20Int]);

  return (
    <div className="space-y-2 sm:space-y-3">
      <h4 className="font-semibold text-xs sm:text-sm text-gray-700">{title}</h4>
      
      {/* Native Funds */}
      <div className="flex items-center justify-between p-2 sm:p-3 border border-gray-600/40 rounded-lg gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">Native (CELO)</span>
        </div>
        <span className="font-mono text-xs sm:text-sm flex-shrink-0">{totalNative} CELO</span>
      </div>

      {/* ERC20 Tokens */}
      {erc20Tokens.map((token, index) => (
        <div key={`${token.token}-${index}`} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600">{token.symbol[0]}</span>
            </div>
            <span className="text-xs sm:text-sm font-medium truncate">{token.name} ({token.symbol})</span>
          </div>
          <span className="font-mono text-xs sm:text-sm flex-shrink-0 truncate max-w-[100px] sm:max-w-none">{token.amount}</span>
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
        const totalRating = learner.ratings.reduce((sum, rating) => sum + Number(rating.value), 0);
        const totalScore = learner.poass.reduce((sum, poa) => sum + Number(poa.score), 0);
        const avgRating = ratingSize > 0? totalRating / ratingSize : 0;

        return (
          <Card 
            key={learner.id.slice(2).concat('id')} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onLearnerClick(learner)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                    {learner.id.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {learner.id.slice(0, 6)}...{learner.id.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {learner.poass.length} proofs • {learner.ratings.length} ratings
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {totalScore} pts
                    </Badge>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
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
    <div className="space-y-4 sm:space-y-6">
      {/* Epoch Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold">Epoch {epochIndex + 1}</h3>
          <p className="text-xs sm:text-sm text-gray-500 break-words">
            Ends: {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString()}
          </p>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{totalLearners}</p>
                <p className="text-xs text-gray-500 truncate">Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{totalProofs}</p>
                <p className="text-xs text-gray-500 truncate">Total Proofs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{maxProofsPerDay}</p>
                <p className="text-xs text-gray-500 truncate">Max/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">
                  {totalLearners > 0 ? (Number(totalProofs) / Number(totalLearners)).toFixed(1) : 0}
                </p>
                <p className="text-xs text-gray-500 truncate">Avg/User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funds Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FundDisplay 
          funds={epochData.setting.funds} 
          title="Total Campaign Funds" 
        />
      </div>

      {/* Learners Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Learners ({totalLearners})</h4>
          {/* Claim actions are handled in Builder profile, not here */}
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
export default function CampaignStatsTemplate({ campaign }: CampaignStatsModalProps) {
  const { address } = useAccount();
  const userAddress = formatAddr(address).toLowerCase();
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  // Removed claim reward modal state from stats template

  const isOwner = userAddress === campaign.owner.toLowerCase();

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

  const handleClaimReward = (_epochIndex: number) => {};

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  return (
    <>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3">Overview</TabsTrigger>
          <TabsTrigger value="epochs" className="text-xs sm:text-sm px-2 sm:px-3">Epochs ({campaign.epochData.length})</TabsTrigger>
          <TabsTrigger value="settings" disabled={!isOwner} className="text-xs sm:text-sm px-2 sm:px-3">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Campaign Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold truncate">
                      {campaign.epochData.reduce((sum, epoch) => sum + epoch.learners.length, 0)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Total Learners</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold truncate">
                      {totalProofs}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Total Proofs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold truncate">
                      {campaign.epoches.toString()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Total Epochs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Info */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Start Date</p>
                  <p className="text-xs sm:text-sm break-words">{campaignMetadata.startDate.toLocaleDateString()}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">End Date</p>
                  <p className="text-xs sm:text-sm break-words">{campaignMetadata.endDate.toLocaleDateString()}</p>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Owner</p>
                  <div className="break-all">
                    <AddressWrapper
                      account={campaign.owner}
                      display={true}
                      copyIconSize='6'
                      size={6}
                      overrideClassName='font-mono text-xs sm:text-sm break-all'
                    />
                  </div>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Contract</p>
                  <div className="break-all">
                    <AddressWrapper
                      account={campaign.contractInfo.address}
                      display={true}
                      copyIconSize='6'
                      size={6}
                      overrideClassName='font-mono text-xs sm:text-sm break-all'
                    />
                  </div>
                </div>
              </div>
              
              {campaignMetadata.link && (
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Documentation</p>
                  <a 
                    href={campaignMetadata.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-blue-600 hover:underline flex items-start gap-1 break-all"
                  >
                    <span className="break-all">{campaignMetadata.link}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="epochs" className="space-y-6">
          {
            campaign.epochData.map((epochData, index) => (
              <EpochStats
                key={index}
                epochData={epochData}
                epochIndex={index}
                onLearnerClick={handleLearnerClick}
                onClaimReward={handleClaimReward}
                isOwner={isOwner}
                userAddress={address}
              />
            ))
          }
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

    {/* Removed RewardClaimModal from stats template */}
    </>
  );
}
