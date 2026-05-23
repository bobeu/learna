"use client";
/*eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
    <div className={`min-h-screen overflow-auto transition-colors duration-500 text-gray-900 dark:text-white font-mono relative`}>
      {/* Animated Flow Background */}
      <AnimatedFlowBackground campaigns={campaigns} />
      
      {/* Gradient Overlay for better visibility with Neon lime accents */}
      {/* <div className="" /> */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-[#1a1625]/90 pointer-events-none z-20" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-sm"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {/* <Navbar /> */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Hero 
          handleJoinCampaign={handleJoinCampaign}
          campaigns={campaigns}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CampaignTabs 
          campaigns={campaigns}
          handleJoinCampaign={handleJoinCampaign}
          handleViewStats={handleViewCampaignStats}
          isLoading={isLoading}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Features />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Footer />
      </motion.div>

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
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-primary-500 text-black px-4 py-3 shadow-lg hover:bg-primary-400 transition-all duration-300"
      aria-label="Scroll to top"
      whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(167, 255, 31, 0.5)' }}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        boxShadow: [
          '0 0 10px rgba(167, 255, 31, 0.3)',
          '0 0 20px rgba(167, 255, 31, 0.5)',
          '0 0 10px rgba(167, 255, 31, 0.3)',
        ]
      }}
      transition={{ 
        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      ↑
    </motion.button>
  );
};
