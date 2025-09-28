"use client";
/* eslint-disable */
import React, { useMemo } from "react";
import { ArrowRight, Play, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import SliderCampaignMiniCard from "./cards/SliderCampaignMiniCard";
import HowItWorksModal from './HowItWorksModal';
import { CampaignStateProps } from "../../../types";

{/* Hero Section with campaign slider */}
export default function Hero({campaigns, handleJoinCampaign} : {campaigns: CampaignStateProps[], handleJoinCampaign: (campaign: any) => void}) {
    const autoplay = useMemo(() => Autoplay({ delay: 3500, stopOnInteraction: true }), []);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplay]);
    const router = useRouter();
    const [showHow, setShowHow] = React.useState(false);

    return(
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 -z-10">
                <Image src="/learna-image4.png" alt="bg" fill className="object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-gray-900 text-sm font-medium mb-8">
                      <Zap className="w-4 h-4 mr-2" />
                      AI-powered proof of learning and integration
                    </div>

                    <h1 className={`text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white dark:font-mono font-black drop-shadow-lg drop-shadow-primary-500`}>
                      Learn faster. Prove mastery. Ship integrations. Earn crypto rewards.
                    </h1>

                    <p className={`text-base md:text-lg text-gray-700 dark:text-gray-200 mb-10 max-w-3xl mx-auto`}>
                      For developers, designers, and any product minds exploring technologies like Celo, Farcaster, Next.js, Solidity, and Wagmi, etc.
                    </p>

                    {/* Div for Learners and Creators */}
                    <div className="pt-4 pb-20 px-4 sm:px-6 lg:px-8 dark:font-mono">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className={`rounded-2xl p-8 border border-neutral-800 dark:bg-surface`}>
                                <h3 className={`text-3xl font-bold text-gray-900 dark:text-white mb-3`}>For Builders</h3>
                                <p className={`text-gray-700 dark:text-gray-200 mb-6`}>Follow AI-crafted learning paths on technologies like Celo, Farcaster, Next.js, Solidity, Wagmi and more. Earn crypto for proofs of learning and shipped integrations.</p>
                                <ul className={`space-y-2 text-gray-700 dark:text-gray-200 mb-6`}>
                                    <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Short, challenging lessons</li>
                                    <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Hands-on quizzes and scoring</li>
                                    <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Track progress on-chain</li>
                                </ul>
                                <Link href="/learn" prefetch>
                                  <Button className="bg-primary-500 text-black hover:bg-primary-400">Start learning</Button>
                                </Link>
                            </div>

                            <div className={`rounded-2xl p-8 border border-neutral-800 dark:bg-surface`}>
                                <h3 className={`text-3xl font-bold text-gray-900 dark:text-white mb-3`}>For Protocol Owners/Managers</h3>
                                <p className={`text-gray-700 dark:text-gray-200 mb-6`}>Launch funded learning campaigns to onboard developers to your SDK or protocol. Reward with up to 3 ERC20 tokens and native assets like Celo.</p>
                                <ul className={`space-y-2 text-gray-700 dark:text-gray-200 mb-6`}>
                                    <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Target web2/web3 devs, designers, PMs</li>
                                    <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Proof of Learning and Integration</li>
                                    <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Analytics and impact tracking</li>
                                </ul>
                                <Link href="/campaigns/new" prefetch>
                                    <Button variant="outline" className="border-primary-500 text-primary-500">Create a campaign</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Slider */}
                    <div className={`relative overflow-hidden dark:bg-black/30 backdrop-blur-sm p-4 dark:font-mono`} ref={emblaRef}>
                        {/* controls */}
                        <button 
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 text-black px-3 py-2 shadow hover:bg-white transition-colors" 
                          onClick={() => emblaApi?.scrollPrev()} 
                          aria-label="Previous"
                        >
                          ‹
                        </button>
                        <button 
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 text-black px-3 py-2 shadow hover:bg-white transition-colors" 
                          onClick={() => emblaApi?.scrollNext()} 
                          aria-label="Next"
                        >
                          ›
                        </button>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                            {/* {(isLoading ? MOCK_CAMPAIGNS : campaigns).slice(0, 6).map((c) => ( */}
                            {campaigns && campaigns.length > 0 && campaigns.map((c) => (
                            <div key={c.id} className="min-w-[150px] max-w-[250px] shrink-0 cursor-pointer" onClick={() => handleJoinCampaign(c)}>
                                <SliderCampaignMiniCard campaign={c} onJoin={handleJoinCampaign} />
                            </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 dark:font-mono">
                        <Button size="lg" className="bg-primary-500 text-black hover:bg-primary-400" onClick={() => router.push('/learn')}>
                            Explore campaigns
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button size="lg" variant="outline" className={`border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600`} onClick={() => router.push('/profile?action=create')}>
                            Create campaign
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button size="lg" variant="outline" className={`border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600`} onClick={() => setShowHow(true)}>
                          <Play className="w-5 h-5 mr-2" />
                          How it works
                        </Button>
                    </div>
                    {showHow && (
                      <HowItWorksModal open={showHow} onClose={() => setShowHow(false)} />
                    )}
                </div>
            </div>
        </section>
    );
}

// Mock contract addresses and ABIs
// const CAMPAIGN_FACTORY_ADDRESS = "0x16884C8C6a494527f4541007A46239218e76F661";
// const CAMPAIGN_FACTORY_ABI = [
//   {
//     "inputs": [],
//     "name": "getData",
//     "outputs": [
//       {
//         "components": [
//           {"internalType": "address", "name": "dev", "type": "address"},
//           {"internalType": "address", "name": "feeTo", "type": "address"},
//           {"internalType": "uint256", "name": "creationFee", "type": "uint256"},
//           {"internalType": "address", "name": "verifier", "type": "address"},
//           {"internalType": "address", "name": "approvalFactory", "type": "address"},
//           {
//             "components": [
//               {"internalType": "address", "name": "creator", "type": "address"},
//               {"internalType": "address", "name": "identifier", "type": "address"}
//             ],
//             "internalType": "struct CampaignFactory.Campaign[]",
//             "name": "campaigns",
//             "type": "tuple[]"
//           }
//         ],
//         "internalType": "struct CampaignFactory.ReadData",
//         "name": "data",
//         "type": "tuple"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   }
// ];

// Mock campaign data
// const MOCK_CAMPAIGNS = [
//   {
//     id: 1,
//     address: "0x1234567890123456789012345678901234567890",
//     name: "Solidity Fundamentals",
//     description: "Master the basics of Solidity programming language",
//     endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//     fundingAmount: "1000",
//     participants: 245,
//     image: "/campaign-images/solidity-fundamentals.svg",
//     status: "active"
//   },
//   {
//     id: 2,
//     address: "0x2345678901234567890123456789012345678901",
//     name: "Celo Blockchain Development",
//     description: "Learn to build on the Celo blockchain ecosystem",
//     endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
//     fundingAmount: "2500",
//     participants: 189,
//     image: "/campaign-images/celo-blockchain-development.svg",
//     status: "active"
//   },
//   {
//     id: 3,
//     address: "0x3456789012345678901234567890123456789012",
//     name: "Divvi SDK Integration",
//     description: "Integrate Divvi SDK into your applications",
//     endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
//     fundingAmount: "1500",
//     participants: 156,
//     image: "/campaign-images/divvi-sdk-integration.svg",
//     status: "active"
//   },
//   {
//     id: 4,
//     address: "0x4567890123456789012345678901234567890123",
//     name: "Web3 Security Best Practices",
//     description: "Learn essential security practices for Web3 development",
//     endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
//     fundingAmount: "2000",
//     participants: 312,
//     image: "/campaign-images/web3-security-best-practices.svg",
//     status: "completed"
//   },
//   {
//     id: 5,
//     address: "0x5678901234567890123456789012345678901234",
//     name: "DeFi Protocols Deep Dive",
//     description: "Understanding decentralized finance protocols",
//     endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
//     fundingAmount: "3000",
//     participants: 278,
//     image: "/campaign-images/defi-protocols-deep-dive.svg",
//     status: "completed"
//   },
//   {
//     id: 6,
//     address: "0x6789012345678901234567890123456789012345",
//     name: "NFT Development Course",
//     description: "Create and deploy NFT smart contracts",
//     endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
//     fundingAmount: "1800",
//     participants: 198,
//     image: "/campaign-images/nft-development-course.svg",
//     status: "featured"
//   }
// ];
  