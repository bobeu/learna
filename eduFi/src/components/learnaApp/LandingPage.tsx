"use client";
/*eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import CampaignLearningInit from '../ai/CampaignLearningInit';
import Features from './Features';
import Hero from './Hero';
import CampaignTabs from '../campaigns/CampaignTabs';
import Footer from './Footer';
import AnimatedFlowBackground from './AnimatedFlowBackground';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import useStorage from '../hooks/useStorage';
import { CampaignStateProps, mockCampaignState, FormattedCampaignTemplate } from '../../../types';
import CampaignStatsModal from '../modals/CampaignStatsModal';
import { toBN } from '../utilities';

// Main Landing Page Component
export default function LandingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignStateProps[]>([mockCampaignState]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignStateProps | null>(null);
  const [selectedCampaignStats, setSelectedCampaignStats] = useState<FormattedCampaignTemplate | null>(null);

  const { campaignsData } = useStorage();

  const mappedCampaigns = useMemo(() => {
    // Map on-chain data into the UI shape used by Hero/CampaignTabs/Cards
    return campaignsData.map((c, idx) => {
      const md = c.metadata;
      const latestEpoch = c.epochData?.[c.epochData.length - 1];
      const learnersCount = latestEpoch?.learners?.length || 0;
      const nativeTotal = latestEpoch ? (latestEpoch.setting.funds.nativeAss + latestEpoch.setting.funds.nativeInt) : 0n;
      const endDateMs = toBN(md.endDate || 0).toNumber() * 1000; 
      const isActive = Date.now() < endDateMs || endDateMs === 0;
      const status = isActive ? 'active' : 'completed';
      return {
        id: idx + 1,
        name: md.name,
        description: md.description,
        image: md.imageUrl,
        status,
        endDate: md.endDate ? new Date(endDateMs) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        fundingAmount: nativeTotal ? Number(formatEther(nativeTotal)).toFixed(2) : '0',
        participants: learnersCount,
        // Keep original for deeper drill-downs if needed
        __raw: c,
      }; 
    });
  }, [campaignsData]);

  useEffect(() => {
    setCampaigns(mappedCampaigns);
    setIsLoading(!mappedCampaigns || mappedCampaigns.length === 0);
    // Prefetch learn route for faster nav. Works best in production mode
    router.prefetch?.('/learn');
    router.prefetch?.('/campaigns/new');
  }, [mappedCampaigns, router]);

  const handleJoinCampaign = (campaign: CampaignStateProps) => {
    setSelectedCampaign(campaign);
  };

  const handleViewCampaignStats = (campaign: CampaignStateProps) => {
    setSelectedCampaignStats(campaign.__raw);
  };

  return (
    // <div className={`min-h-screen overflow-auto transition-colors duration-300 bg-white text-gray-900 dark:bg-blackish dark:text-white font-mono relative`}>
    <div className={`min-h-screen overflow-auto transition-colors duration-300 text-gray-900 dark:text-white font-mono relative`}>
      {/* Animated Flow Background */}
      <AnimatedFlowBackground campaigns={campaigns} />
      
      {/* <Navbar /> */}
      <Hero 
        handleJoinCampaign={handleJoinCampaign}
        campaigns={campaigns}
      />
      
      <CampaignTabs 
        campaigns={campaigns}
        handleJoinCampaign={handleJoinCampaign}
        handleViewStats={handleViewCampaignStats}
        isLoading={isLoading}
      />
      <Features />

      <Footer />

      {/* Campaign Learning Init Modal */}
      {selectedCampaign && (
        <CampaignLearningInit
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* Campaign Stats Modal */}
      {selectedCampaignStats && (
        <CampaignStatsModal
          campaign={selectedCampaignStats}
          isOpen={!!selectedCampaignStats}
          onClose={() => setSelectedCampaignStats(null)}
        />
      )}

      {/* Scroll to top */}
      <ScrollTopButton />
    </div>
  );
}

// Floating scroll-to-top button
const ScrollTopButton = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-primary-500 text-black px-4 py-3 shadow-lg hover:bg-primary-400"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};
