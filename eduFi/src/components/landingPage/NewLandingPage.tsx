"use client";

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AITutor from '../ai/AITutor';
import Features from './Features';
import Hero, { MOCK_CAMPAIGNS } from './Hero';
import CampaignTabs from '../campaigns/CampaignTabs';
import Footer from './Footer';
// import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Main Landing Page Component
export default function NewLandingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
//   const autoplay = useMemo(() => Autoplay({ delay: 3500, stopOnInteraction: true }), []);
//   const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplay]);

  // Mock blockchain data fetching
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setCampaigns(MOCK_CAMPAIGNS);
      setIsLoading(false);
    }, 1000);
    // Prefetch learn route for faster nav
    router.prefetch?.('/learn');
    router.prefetch?.('/campaigns/new');
  }, []);

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
            <AITutor
            campaign={selectedCampaign}
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
