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
    <div className="min-h-screen bg-white dark:bg-blackish text-gray-900 dark:text-white px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <Card className="bg-white dark:bg-surface overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl break-words">{campaign.metadata.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            <div className="break-all">
              <span className="font-medium">Link: </span>
              <span className="break-all">{campaign.metadata.link}</span>
            </div>
            <div className="break-all">
              <span className="font-medium">Image: </span>
              <span className="break-all">{campaign.metadata.imageUrl}</span>
            </div>
            <div>
              <span className="font-medium">Ends: </span>
              {campaign.metadata.endDate ? new Date(campaign.metadata.endDate * 1000).toLocaleString() : "Not set"}
            </div>
            <div className="break-all">
              <span className="font-medium">Owner: </span>
              <span className="break-all font-mono">{campaign.owner}</span>
            </div>
            <div className="break-all">
              <span className="font-medium">Verifier: </span>
              <span className="break-all font-mono">{campaign.verifier}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-surface overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            {funds ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="break-words">
                  <span className="font-medium">Native (Assimilation): </span>
                  <span className="font-mono break-all">{funds.nativeAss.toString()}</span>
                </div>
                <div className="break-words">
                  <span className="font-medium">Native (Integration): </span>
                  <span className="font-mono break-all">{funds.nativeInt.toString()}</span>
                </div>
                <div className="break-words">
                  <span className="font-medium">ERC20 (Assimilation): </span>
                  <span className="break-all">{funds.erc20Ass.map((t) => `${t.tokenSymbol}:${t.amount.toString()}`).join(", ")}</span>
                </div>
                <div className="break-words">
                  <span className="font-medium">ERC20 (Integration): </span>
                  <span className="break-all">{funds.erc20Int.map((t) => `${t.tokenSymbol}:${t.amount.toString()}`).join(", ")}</span>
                </div>
              </div>
            ) : (
              <div>No epoch found.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-surface overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Learners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            {learners.length === 0 ? (
              <div>No learners yet.</div>
            ) : (
              <ul className="space-y-2">
                {learners.map((l, i) => (
                  <li key={i} className="break-all font-mono">{l.id}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


