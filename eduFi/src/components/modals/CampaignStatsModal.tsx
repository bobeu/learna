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
        <CampaignStatsTemplate campaign={campaign}/>
      </DialogContent>
    </Dialog>
  );
}




// <>
//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <DialogTitle className="text-xl font-bold">
//                   {campaignMetadata.name} - Campaign Analytics
//                 </DialogTitle>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {campaignMetadata.description}
//                 </p>
//               </div>
//             </div>
//           </DialogHeader>

//           <Tabs defaultValue="overview" className="w-full">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="overview">Overview</TabsTrigger>
//               <TabsTrigger value="epochs">Epochs ({campaign.epochData.length})</TabsTrigger>
//               <TabsTrigger value="settings" disabled={!isOwner}>
//                 Settings
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview" className="space-y-6">
//               {/* Campaign Overview */}
//               <div className="grid md:grid-cols-3 gap-4">
//                 <Card>
//                   <CardContent className="p-4">
//                     <div className="flex items-center gap-2">
//                       <Users className="w-4 h-4 text-blue-600" />
//                       <div>
//                         <p className="text-2xl font-bold">
//                           {campaign.epochData.reduce((sum, epoch) => sum + epoch.learners.length, 0)}
//                         </p>
//                         <p className="text-xs text-gray-500">Total Learners</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardContent className="p-4">
//                     <div className="flex items-center gap-2">
//                       <Trophy className="w-4 h-4 text-yellow-600" />
//                       <div>
//                         <p className="text-2xl font-bold">
//                           {totalProofs}
//                         </p>
//                         <p className="text-xs text-gray-500">Total Proofs</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardContent className="p-4">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-green-600" />
//                       <div>
//                         <p className="text-2xl font-bold">
//                           {campaign.epoches.toString()}
//                         </p>
//                         <p className="text-xs text-gray-500">Total Epochs</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Campaign Info */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Campaign Information</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Start Date</p>
//                       <p className="text-sm">{campaignMetadata.startDate.toLocaleDateString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">End Date</p>
//                       <p className="text-sm">{campaignMetadata.endDate.toLocaleDateString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Owner</p>
//                       <p className="text-sm font-mono">{campaign.owner}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Contract</p>
//                       <p className="text-sm font-mono">{campaign.contractAddress}</p>
//                     </div>
//                   </div>
                  
//                   {campaignMetadata.link && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Documentation</p>
//                       <a 
//                         href={campaignMetadata.link} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         className="text-sm text-blue-600 hover:underline flex items-center gap-1"
//                       >
//                         {campaignMetadata.link}
//                         <ExternalLink className="w-3 h-3" />
//                       </a>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="epochs" className="space-y-6">
//               {campaign.epochData.map((epochData, index) => (
//                 <EpochStats
//                   key={index}
//                   epochData={epochData}
//                   epochIndex={index}
//                   onLearnerClick={handleLearnerClick}
//                   onClaimReward={handleClaimReward}
//                   isOwner={isOwner}
//                   userAddress={address}
//                 />
//               ))}
//             </TabsContent>

//             <TabsContent value="settings" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Campaign Settings</CardTitle>
//                   <p className="text-sm text-gray-500">
//                     Manage your campaign settings and funding
//                   </p>
//                 </CardHeader>
//                 <CardContent>
//                   <Button onClick={handleSettingsClick} className="w-full">
//                     <Settings className="w-4 h-4 mr-2" />
//                     Open Settings Panel
//                   </Button>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </DialogContent>
//       </Dialog>

//       {/* Learner Profile Modal */}
//       {selectedLearner && (
//         <LearnerProfileModal
//           learner={selectedLearner}
//           isOpen={!!selectedLearner}
//           onClose={() => setSelectedLearner(null)}
//         />
//       )}

//       {/* Campaign Settings Modal */}
//       {showSettings && (
//         <CampaignSettingsModal
//           campaign={campaign}
//           isOpen={showSettings}
//           onClose={() => setShowSettings(false)}
//         />
//       )}

//       {/* Reward Claim Modal */}
//       {showClaimReward && (
//         <RewardClaimModal
//           campaign={campaign}
//           epochIndex={selectedEpoch}
//           isOpen={showClaimReward}
//           onClose={() => setShowClaimReward(false)}
//         />
//       )}
//     </>