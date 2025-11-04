"use client";
/* eslint-disable */
import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccount } from "wagmi";
import { FormattedCampaignTemplate } from "../../../types";
import { Hex } from "viem";
import { formatAddr, formattedMockCampaignsTemplate, normalizeString } from '../utilities';
import CampaignStatsTemplate from './CampaignStatsTemplate';

// Main Campaign Stats Modal Component
export default function CampaignStatsModal({ campaign: inCampaign, isOpen, onClose }: { isOpen: boolean; onClose: (arg:boolean) => void; campaign: FormattedCampaignTemplate | null;}) {
  const { address } = useAccount();
  const userAddress = formatAddr(address).toLowerCase();

  const {campaign} = useMemo(() => {
    const defaultCampaign : FormattedCampaignTemplate = formattedMockCampaignsTemplate[0];
    // console.log("defaultValue", defaultCampaign);
    if(!inCampaign) return { isOwner: false, campaign: defaultCampaign};
    return { isOwner: userAddress === inCampaign.owner.toLowerCase(), campaign: inCampaign};
  }, [inCampaign?.owner, userAddress]);

  const { campaignMetadata } = useMemo(() => {
    // const totalProofs = campaign.epochData.reduce((sum, epoch) => sum + toBN(epoch.totalProofs).toNumber(), 0);
    const campaignMetadata =  {
      name: normalizeString(campaign.metadata.name as Hex),
      description: normalizeString(campaign.metadata.description as Hex),
      link: normalizeString(campaign.metadata.link as Hex),
      imageUrl: normalizeString(campaign.metadata.imageUrl as Hex),
      startDate: new Date(Number(campaign.metadata.startDate) * 1000),
      endDate: new Date(Number(campaign.metadata.endDate) * 1000),
    };
    return { campaignMetadata }
  }, [campaign?.metadata, campaign?.epochData]);

  // const handleLearnerClick = (learner: Learner) => {
  //   setSelectedLearner(learner);
  // };

  // const handleClaimReward = (epochIndex: number) => {
  //   setSelectedEpoch(epochIndex);
  //   setShowClaimReward(true);
  // };

  // const handleSettingsClick = () => {
  //   setShowSettings(true);
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl font-bold break-words">
                {campaignMetadata.name} - Campaign Analytics
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                {campaignMetadata.description}
              </p>
            </div>
          </div>
        </DialogHeader>
        <CampaignStatsTemplate campaign={campaign}/>
      </DialogContent>
    </Dialog>
  );
}
