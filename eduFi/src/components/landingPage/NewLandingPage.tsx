"use client";

import React, { useState, useEffect, useContext, useMemo } from 'react';
import Navbar from './Navbar';
import ImprovedAITutor from '../ai/ImprovedAITutor';
import Features from './Features';
import Hero from './Hero';
import CampaignTabs from '../campaigns/CampaignTabs';
import Footer from './Footer';
// import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { DataContext } from '@/components/StorageContextProvider';
import { formatEther, hexToString } from 'viem';
import useStorage from '../hooks/useStorage';
import { CampaignTemplateReadData, mockCampaignTemplateReadData } from '../../../types';

// Main Landing Page Component
export default function NewLandingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<{
    id: number;
    name: string;
    description: string;
    image: string;
    status: string;
    endDate: Date;
    fundingAmount: string;
    participants: number;
    __raw: CampaignTemplateReadData;
}[]>([{
  id: 0,
  name: '',
  description: '',
  image: '',
  status: '',
  endDate: new Date(),
  fundingAmount: '',
  participants: 0,
  __raw: mockCampaignTemplateReadData
}]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
//   const autoplay = useMemo(() => Autoplay({ delay: 3500, stopOnInteraction: true }), []);
//   const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplay]);

  // Pull live campaign data from context and map to UI-friendly objects
  const { campaignsData } = useStorage();

  const normalizeString = (val: string) => {
    if(!val) return '';
    return val.startsWith('0x') ? hexToString(val as any) : val;
  };

  const normalizeImageSrc = (val: string) => {
    const s = normalizeString(val);
    if(!s) return '/learna-image4.png';
    if(s.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${s.replace('ipfs://','')}`;
    }
    if(s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    return '/learna-image4.png';
  };

  const mappedCampaigns = useMemo(() => {
    // Map on-chain data into the UI shape used by Hero/CampaignTabs/Cards
    return campaignsData.map((c, idx) => {
      const md = c.metadata;
      const latestEpoch = c.epochData?.[c.epochData.length - 1];
      const learnersCount = latestEpoch?.learners?.length || 0;
      const nativeTotal = latestEpoch ? (latestEpoch.setting.funds.nativeAss + latestEpoch.setting.funds.nativeInt) : 0n;
      const endDateMs = (md.endDate || 0) * 1000; 
      const isActive = Date.now() < endDateMs || endDateMs === 0;
      const status = isActive ? 'active' : 'completed';
      return {
        id: idx + 1,
        name: normalizeString(md.name),
        description: normalizeString(md.description),
        image: normalizeImageSrc(md.imageUrl),
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
    // Prefetch learn route for faster nav
    router.prefetch?.('/learn');
    router.prefetch?.('/campaigns/new');
  }, [mappedCampaigns, router]);

  const handleJoinCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-white text-gray-900 dark:bg-blackish dark:text-white`}>
        <Navbar />
        <Hero 
            handleJoinCampaign={handleJoinCampaign}
            campaigns={campaigns}
            isLoading={isLoading}
        />
        <CampaignTabs 
            campaigns={campaigns}
            handleJoinCampaign={handleJoinCampaign}
            isLoading={isLoading}
        />
        <Features />

        {/* AI Tutor Modal */}
        {selectedCampaign && (
            <ImprovedAITutor
            campaign={selectedCampaign.__raw}
            onClose={() => setSelectedCampaign(null)}
            />
        )}
        <Footer />

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
