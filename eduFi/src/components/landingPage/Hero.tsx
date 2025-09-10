"use client";

import React, { useMemo } from "react";
// import { useTheme } from 'next-themes';
import { ArrowRight, Play, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import SliderCampaignMiniCard from "./cards/SliderCampaignMiniCard";
import HowItWorksModal from './HowItWorksModal';

{/* Hero Section with campaign slider */}
export default function Hero({campaigns, isLoading, handleJoinCampaign} : {campaigns: any, isLoading: boolean, handleJoinCampaign: (campaign: any) => void}) {
    const [learners, setLearners] = React.useState<number>(0);
    // const [rewards, setRewards] = React.useState<number>(0);
    // const [quizzes, setQuizzes] = React.useState<number>(0);

    // const { theme } = useTheme();
    // const [campaigns, setCampaigns] = useState<any[]>([]);
    // const [isLoading, setIsLoading] = useState(true);
    const autoplay = useMemo(() => Autoplay({ delay: 3500, stopOnInteraction: true }), []);
    const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplay]);
    const router = useRouter();
    const [showHow, setShowHow] = React.useState(false);

    // const { setpath } = useStorage();

    // const goToSetupCampaign = () => {
    //     if(!isConnected) {
    //         alert("Please connect a wallet");
    //     } else{
    //         setpath('setupcampaign');
    //     }
    // }

    // React.useEffect(() => {
    //     if(learners < 50000 || rewards < 500000 || quizzes < 1000) {
    //         const timer = setInterval(() => {
    //             setLearners(prev => prev + 1);
    //             setRewards(prev => prev + 2);
    //             setQuizzes(prev => prev + 1);
    //         }, 1000);
    //         return () => clearInterval(timer);
    //     }
    // }, [learners, quizzes, rewards]);

    // bg-gradient-to-br from-gray-50 to-cyan-50
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
                                  {/* <Button className="bg-primary-500 text-black hover:bg-primary-400" onClick={() => router.push('/learn')}>Start learning</Button> */}
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
                    <div className={`relative overflow-hidden dark:bg-black/30 backdrop-blur-sm p-4 dark:font-mono`} ref={emblaRef} onMouseEnter={() => autoplay.stop()} onMouseLeave={() => autoplay.play()}>
                        {/* controls */}
                        <button className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 text-black px-3 py-2 shadow" onClick={() => (emblaRef as any)?.current?.scrollPrev?.()} aria-label="Previous">
                            ‹
                        </button>
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 text-black px-3 py-2 shadow" onClick={() => (emblaRef as any)?.current?.scrollNext?.()} aria-label="Next">
                            ›
                        </button>
                        <div className="flex gap-3">
                            {/* {(isLoading ? MOCK_CAMPAIGNS : campaigns).slice(0, 6).map((c) => ( */}
                            {(isLoading ? MOCK_CAMPAIGNS : campaigns).map((c: any) => (
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
export const CAMPAIGN_FACTORY_ADDRESS = "0x16884C8C6a494527f4541007A46239218e76F661";
export const CAMPAIGN_FACTORY_ABI = [
  {
    "inputs": [],
    "name": "getData",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "dev", "type": "address"},
          {"internalType": "address", "name": "feeTo", "type": "address"},
          {"internalType": "uint256", "name": "creationFee", "type": "uint256"},
          {"internalType": "address", "name": "verifier", "type": "address"},
          {"internalType": "address", "name": "approvalFactory", "type": "address"},
          {
            "components": [
              {"internalType": "address", "name": "creator", "type": "address"},
              {"internalType": "address", "name": "identifier", "type": "address"}
            ],
            "internalType": "struct CampaignFactory.Campaign[]",
            "name": "campaigns",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct CampaignFactory.ReadData",
        "name": "data",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Mock campaign data
export const MOCK_CAMPAIGNS = [
  {
    id: 1,
    address: "0x1234567890123456789012345678901234567890",
    name: "Solidity Fundamentals",
    description: "Master the basics of Solidity programming language",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    fundingAmount: "1000",
    participants: 245,
    image: "/campaign-images/solidity-fundamentals.svg",
    status: "active"
  },
  {
    id: 2,
    address: "0x2345678901234567890123456789012345678901",
    name: "Celo Blockchain Development",
    description: "Learn to build on the Celo blockchain ecosystem",
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    fundingAmount: "2500",
    participants: 189,
    image: "/campaign-images/celo-blockchain-development.svg",
    status: "active"
  },
  {
    id: 3,
    address: "0x3456789012345678901234567890123456789012",
    name: "Divvi SDK Integration",
    description: "Integrate Divvi SDK into your applications",
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    fundingAmount: "1500",
    participants: 156,
    image: "/campaign-images/divvi-sdk-integration.svg",
    status: "active"
  },
  {
    id: 4,
    address: "0x4567890123456789012345678901234567890123",
    name: "Web3 Security Best Practices",
    description: "Learn essential security practices for Web3 development",
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    fundingAmount: "2000",
    participants: 312,
    image: "/campaign-images/web3-security-best-practices.svg",
    status: "completed"
  },
  {
    id: 5,
    address: "0x5678901234567890123456789012345678901234",
    name: "DeFi Protocols Deep Dive",
    description: "Understanding decentralized finance protocols",
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    fundingAmount: "3000",
    participants: 278,
    image: "/campaign-images/defi-protocols-deep-dive.svg",
    status: "completed"
  },
  {
    id: 6,
    address: "0x6789012345678901234567890123456789012345",
    name: "NFT Development Course",
    description: "Create and deploy NFT smart contracts",
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    fundingAmount: "1800",
    participants: 198,
    image: "/campaign-images/nft-development-course.svg",
    status: "featured"
  }
];
        // <section className="mx-auto bg-[url('/learna-image-2.png')] bg-no-repeat relative px-4 py-12 md:py-20 text-center font-mono">
        //     <div className="">
        //         <div className="mb-8">
        //             <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-cyan-200 mb-6 shadow-sm">
        //                 <Zap className="w-4 h-4 text-cyan-600 mr-2" />
        //                 <span className="text-cyan-700 text-sm font-medium">New Education Revolution</span>
        //             </div>
        //             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
        //                 <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        //                     {"Learn, Grow, Have Fun!"}
        //                 </span>
        //                 <br />
        //                 <span className="text-gray-900">Earn Crypto.</span>
        //             </h1>
        //             <p className="text-lg md:text-xl text-gray-800 mb-8 max-w-2xl mx-auto leading-relaxed">
        //                 Master technologies, protocols, subjects, tools, architectures, libraries including web3 fundamentals through interactive quizzes. 
        //                 Earn real cryptocurrency rewards as you build your knowledge and skills.
        //             </p>
        //         </div>
            
        //     <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        //         <button onClick={handleClick} className="flex justify-center items-center group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
        //             <a href="#connect" className="text-white hover:text-cyan-600 transition-colors font-medium">Start Learning</a>                        
        //             <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        //         </button>
        //         <button onClick={goToSetupCampaign} className="group border-2 border-cyan-500 md:border-white text-cyan-600 md:text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-cyan-500 hover:text-white transition-all duration-300">
        //             <span className="flex items-center justify-center">
        //                 <LucideBox className="w-5 h-5 mr-2" />
        //                 Fund A Campaign
        //             </span>
        //         </button>
        //     </div>

        //     <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
        //         <div className="text-center">
        //             <div className="text-2xl md:text-3xl font-bold text-cyan-600 mb-2">{learners}+</div>
        //             <div className="text-white text-sm md:text-base">Learners</div>
        //         </div>
        //         <div className="text-center">
        //             <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">${`${rewards}k+`}</div>
        //             <div className="text-white text-sm md:text-base">Rewards Paid</div>
        //         </div>
        //         <div className="text-center">
        //             <div className="text-2xl md:text-3xl font-bold text-pink-600 mb-2">{quizzes}+</div>
        //             <div className="text-white text-sm md:text-base">Quizzes</div>
        //         </div>
        //     </div>
        //     </div>
        // </section>