"use client";

import React, { useContext, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { DataContext } from "@/components/StorageContextProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEther } from "viem";
import Link from "next/link";
import CampaignMetaEditor from "@/components/profile/CampaignMetaEditor";
import AddFund from "@/components/transactions/AddFund";
import BuilderRewards from "@/components/profile/BuilderRewards";
import { mockCampaignTemplateReadData } from "../../../types";
import { formatAddr } from "@/components/utilities";

export default function ProfilePage() {
  const { address } = useAccount();
  const data = useContext(DataContext);

  const campaignsData = data?.campaignsData || [mockCampaignTemplateReadData];
  const userAddress = formatAddr(address).toLowerCase();

  const { creatorCampaigns, builderCampaigns } = useMemo(() => {
    const creator = campaignsData.filter((c) => c.owner.toLowerCase() === userAddress);
    const builder = campaignsData.filter((c) => {
      const anyLearner = c.epochData?.some((e) => e.learners?.some((l) => l.id.toLowerCase() === userAddress));
      return anyLearner;
    });
    return { creatorCampaigns: creator, builderCampaigns: builder };
  }, [campaignsData, userAddress]);

  const [selectedForEdit, setSelectedForEdit] = useState<number | null>(null);
  const [selectedForFund, setSelectedForFund] = useState<number | null>(null);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white text-gray-900 dark:bg-blackish dark:text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your campaigns and participation</p>
        </div>

        <Tabs defaultValue="creator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="creator">Creator</TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="creator" className="space-y-6">
            {creatorCampaigns.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-600 dark:text-gray-300">
                  No campaigns found. <Link href="/campaigns/new" className="underline">Create one</Link>.
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorCampaigns.map((c, idx) => (
                <Card key={idx} className="bg-white dark:bg-surface">
                  <CardHeader>
                    <CardTitle className="truncate">{c.metadata.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      <div className="truncate">Link: {c.metadata.link}</div>
                      <div className="truncate">Image: {c.metadata.imageUrl}</div>
                      <div className="truncate">Ends: {c.metadata.endDate ? new Date(c.metadata.endDate * 1000).toLocaleString() : "Not set"}</div>
                      <div className="truncate">Epoches: {c.epoches?.toString?.() || 0}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button variant="outline" className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600" onClick={() => setSelectedForEdit(idx)}>Edit metadata</Button>
                      <Button variant="outline" className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600" onClick={() => setSelectedForFund(idx)}>Add funds</Button>
                      <Link href={{ pathname: "/profile/view", query: { i: idx.toString() } }}>
                        <Button className="bg-primary-500 text-black hover:bg-primary-400">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedForEdit !== null && creatorCampaigns[selectedForEdit] && (
              <CampaignMetaEditor 
                campaign={creatorCampaigns[selectedForEdit]}
                onClose={() => setSelectedForEdit(null)}
              />
            )}

            {selectedForFund !== null && creatorCampaigns[selectedForFund] && (
              <AddFund
                isOpen={true}
                onClose={() => setSelectedForFund(null)}
                campaignAddress={creatorCampaigns[selectedForFund].owner} // This should be the campaign identifier
                campaignName={creatorCampaigns[selectedForFund].metadata.name}
              />
            )}
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            {builderCampaigns.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-600 dark:text-gray-300">
                  You haven't subscribed to any campaigns yet.
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {builderCampaigns.map((c, idx) => {
                const latest = c.epochData?.[c.epochData.length - 1];
                const nativeTotal = latest ? (latest.setting.funds.nativeAss + latest.setting.funds.nativeInt) : 0n;
                const learners = latest?.learners || [];
                const userLearnerData = learners.find((l: any) => l.id.toLowerCase() === userAddress);
                
                return (
                  <div key={idx} className="space-y-4">
                    <Card className="bg-white dark:bg-surface">
                      <CardHeader>
                        <CardTitle className="truncate">{c.metadata.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-gray-700 dark:text-gray-200">
                          <div className="truncate">Ends: {c.metadata.endDate ? new Date(c.metadata.endDate * 1000).toLocaleString() : "Not set"}</div>
                          <div className="truncate">Funding (native): {nativeTotal ? Number(formatEther(nativeTotal)).toFixed(2) : "0"}</div>
                          <div className="truncate">Total Learners: {learners.length}</div>
                        </div>
                        <Link href={{ pathname: "/profile/view", query: { i: idx.toString(), role: "builder" } }}>
                          <Button className="w-full bg-primary-500 text-black hover:bg-primary-400">View Details</Button>
                        </Link>
                      </CardContent>
                    </Card>
                    
                    {userLearnerData && (
                      <BuilderRewards 
                        campaign={c} 
                        learnerData={userLearnerData} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


