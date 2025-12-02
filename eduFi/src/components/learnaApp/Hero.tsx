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
    const autoplay = useMemo(() => Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }), []);
    const [emblaRef] = useEmblaCarousel({ 
        loop: true, 
        align: 'center',
        skipSnaps: false,
        dragFree: false
    }, [autoplay]);
    const router = useRouter();
    const [showHow, setShowHow] = React.useState(false);

    return(
        <section className="relative py-8 sm:py-12 md:py-20 px-4 sm:px-6 lg:px-8 z-10">
            {/* <div className="absolute inset-0 -z-10">
                <Image src="/logo.png" alt="bg" fill className="object-cover opacity-10 dark:opacity-5" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/60 dark:from-black/50 dark:via-black/30 dark:to-black/50 backdrop-blur-sm" />
            </div> */}
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <div className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-100 text-gray-900 text-xs sm:text-sm font-medium mb-4 sm:mb-8 max-w-fit mx-auto w-full sm:w-auto">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate max-w-[calc(100vw-5rem)] sm:max-w-none">AI-powered proof of learning and integration</span>
                    </div>

                    <h1 className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 text-gray-900 dark:text-white dark:font-mono font-black drop-shadow-lg drop-shadow-primary-500 leading-tight px-2`}>
                      Learn faster. Prove mastery. Ship integrations. Earn crypto rewards.
                    </h1>

                    <p className={`text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-200 mb-6 sm:mb-10 max-w-3xl mx-auto px-2`}>
                      For developers, designers, and any product minds exploring technologies like Celo, Farcaster, Next.js, Solidity, and Wagmi, etc.
                    </p>

                    {/* Div for Learners and Creators */}
                    <div className="pt-2 sm:pt-4 pb-8 sm:pb-12 md:pb-20 px-2 sm:px-4 md:px-6 lg:px-8 dark:font-mono">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-400 dark:border-neutral-800 dark:bg-surface`}>
                                <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3`}>{'Builders & Learners'}</h3>
                                <p className={`text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 sm:mb-6`}>Follow AI-crafted learning paths on technologies like Celo, Farcaster, Next.js, Solidity, Wagmi and more. Earn crypto for proofs of learning and shipped integrations.</p>
                                <ul className={`space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 sm:mb-6`}>
                                    <li className="flex items-center gap-2"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0"/>Short, challenging lessons</li>
                                    <li className="flex items-center gap-2"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0"/>Hands-on quizzes and scoring</li>
                                    <li className="flex items-center gap-2"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0"/>Track progress on-chain</li>
                                </ul>
                                <Link href="/learn" prefetch>
                                  <Button className="bg-primary-500 text-black hover:bg-primary-400 text-sm sm:text-base w-full sm:w-auto">Start learning</Button>
                                </Link>
                            </div>

                            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-400 dark:border-neutral-800 dark:bg-surface`}>
                                <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3`}>Protocol Owners/Managers</h3>
                                <p className={`text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 sm:mb-6`}>Launch funded learning campaigns to onboard developers to your SDK or protocol. Reward with up to 3 ERC20 tokens and native assets like Celo.</p>
                                <ul className={`space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 sm:mb-6`}>
                                    <li className="flex items-center gap-2"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0"/>Target web2/web3 devs, designers, PMs</li>
                                    <li className="flex items-center gap-2"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0"/>Proof of Learning and Integration</li>
                                    <li className="flex items-center gap-2"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0"/>Analytics and impact tracking</li>
                                </ul>
                                <Link href="/campaigns/new" prefetch>
                                    <Button variant="outline" className="border-primary-500 text-primary-500 text-sm sm:text-base w-full sm:w-auto">Create a campaign</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Slider */}
                    <div className={`relative overflow-hidden dark:bg-black/30 backdrop-blur-sm p-2 sm:p-3 dark:font-mono`} ref={emblaRef}>
                        <div className="flex">
                            {campaigns && campaigns.length > 0 && campaigns.map((c) => (
                                <div key={c.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-1 sm:px-2">
                                    <div className="cursor-pointer w-full h-full" onClick={() => handleJoinCampaign(c)}>
                                        <SliderCampaignMiniCard campaign={c} onJoin={handleJoinCampaign} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mt-6 sm:mt-10 dark:font-mono px-2">
                        <Button size="default" className="bg-primary-500 text-black hover:bg-primary-400 text-sm sm:text-base w-full sm:w-auto" onClick={() => router.push('/learn')}>
                            Explore campaigns
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </Button>
                        <Button size="default" variant="outline" className={`border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm sm:text-base w-full sm:w-auto`} onClick={() => router.push('/profile?action=create')}>
                            Create campaign
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </Button>
                        <Button size="default" variant="outline" className={`border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm sm:text-base w-full sm:w-auto`} onClick={() => setShowHow(true)}>
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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