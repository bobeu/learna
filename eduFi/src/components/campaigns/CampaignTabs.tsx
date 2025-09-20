import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignSliderCard from '../learnaApp/cards/CampaignSliderCard';
import { CampaignStateProps } from '../../../types';

{/* Campaigns Section */}
export default function CampaignTabs({campaigns, isLoading, handleJoinCampaign, handleViewStats, showHeader = true, compact = false, className = ''} : {campaigns: CampaignStateProps[], isLoading: boolean, handleJoinCampaign: (campaign: CampaignStateProps) => void, handleViewStats?: (campaign: CampaignStateProps) => void, showHeader?: boolean, compact?: boolean, className?: string}) {
    const [activeTab, setActiveTab] = useState('current');

    const currentCampaigns = campaigns.filter((c: { status: string; }) => c.status === 'active');
    const featuredCampaigns = campaigns.filter((c: { status: string; }) => c.status === 'featured');
    const pastCampaigns = campaigns.filter((c: { status: string; }) => c.status === 'completed');

    return(
        <section className={`${compact ? 'py-8' : 'py-20'} px-4 sm:px-6 lg:px-8 dark:font-mono ${className}`}>
            <div className="max-w-7xl mx-auto">
            {showHeader && (
                <div className="text-center mb-12">
                    <h2 className={`text-4xl font-bold mb-4 text-black opacity-80 dark:text-white`}>Learning Campaigns</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                    Choose from our curated selection of learning campaigns
                    </p>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full grid-cols-3 mb-8`}>
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="w-full">
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            </div>
                        </CardContent>
                        </Card>
                    ))
                    ) : (
                    currentCampaigns.map((campaign) => (
                        <CampaignSliderCard
                            key={campaign.id}
                            campaign={campaign}
                            onJoin={handleJoinCampaign}
                            onViewStats={handleViewStats}
                        />
                    ))
                    )}
                </div>
                </TabsContent>

                    <TabsContent value="featured" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCampaigns.map((campaign) => (
                            <CampaignSliderCard
                                key={campaign.id}
                                campaign={campaign}
                                onJoin={handleJoinCampaign}
                                onViewStats={handleViewStats}
                            />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="past" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {
                            pastCampaigns.map((campaign) => (
                                <CampaignSliderCard
                                    key={campaign.id}
                                    campaign={campaign}
                                    onJoin={handleJoinCampaign}
                                    onViewStats={handleViewStats}
                                />
                            ))
                        }
                    </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}