"use client";

import React, { useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DataContext } from "@/components/StorageContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampaignViewPage() {
  const params = useSearchParams();
  const idx = Number(params.get("i") || 0);
  const data = useContext(DataContext);
  const campaign = data?.campaignsData?.[idx];

  const latest = campaign?.epochData?.[campaign.epochData.length - 1];
  const learners = latest?.learners || [];

  const funds = useMemo(() => {
    if (!latest) return null;
    return latest.setting.funds;
  }, [latest]);

  if (!campaign) return (
    <div className="min-h-screen bg-white dark:bg-blackish text-gray-900 dark:text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">Campaign not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-blackish text-gray-900 dark:text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="bg-white dark:bg-surface">
          <CardHeader>
            <CardTitle>{campaign.metadata.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <div>Link: {campaign.metadata.link}</div>
            <div>Image: {campaign.metadata.imageUrl}</div>
            <div>Ends: {campaign.metadata.endDate ? new Date(campaign.metadata.endDate * 1000).toLocaleString() : "Not set"}</div>
            <div>Owner: {campaign.owner}</div>
            <div>Verifier: {campaign.verifier}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-surface">
          <CardHeader>
            <CardTitle>Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            {funds ? (
              <div className="space-y-2">
                <div>Native (Assimilation): {funds.nativeAss.toString()}</div>
                <div>Native (Integration): {funds.nativeInt.toString()}</div>
                <div>ERC20 (Assimilation): {funds.erc20Ass.map((t:any,i:number)=>`${t.tokenSymbol}:${t.amount.toString()}`).join(", ")}</div>
                <div>ERC20 (Integration): {funds.erc20Int.map((t:any,i:number)=>`${t.tokenSymbol}:${t.amount.toString()}`).join(", ")}</div>
              </div>
            ) : (
              <div>No epoch found.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-surface">
          <CardHeader>
            <CardTitle>Learners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            {learners.length === 0 ? (
              <div>No learners yet.</div>
            ) : (
              <ul className="space-y-2">
                {learners.map((l:any, i:number) => (
                  <li key={i} className="truncate">{l.id}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


