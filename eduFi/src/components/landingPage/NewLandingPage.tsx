"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';
import { Sun, Moon, BookOpen, Trophy, Clock, Users, DollarSign, ArrowRight, Play, Star, Brain, Zap } from 'lucide-react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
import { useAccount } from 'wagmi';

// Mock contract addresses and ABIs - replace with actual values
const CAMPAIGN_FACTORY_ADDRESS = "0x16884C8C6a494527f4541007A46239218e76F661";
const CAMPAIGN_FACTORY_ABI = [
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

// Mock campaign data - replace with actual blockchain data
const MOCK_CAMPAIGNS = [
  {
    id: 1,
    address: "0x1234567890123456789012345678901234567890",
    name: "Solidity Fundamentals",
    description: "Master the basics of Solidity programming language",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    fundingAmount: "1000",
    participants: 245,
    image: "/learna-image4.png",
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
    image: "/learna-image-2.png",
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
    image: "/learna-image4.png",
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
    image: "/learna-image-2.png",
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
    image: "/learna-image4.png",
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
    image: "/learna-image-2.png",
    status: "featured"
  }
];

// AI Tutor Component
const AITutor = ({ campaign, onClose }: { campaign: any; onClose: () => void }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [article, setArticle] = useState('');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const topics = ['Solidity', 'Celo', 'Divvi', 'Web3', 'DeFi', 'Smart Contracts'];

  const generateArticle = async () => {
    if (!selectedTopic) return;
    
    setIsGenerating(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock article content - replace with actual AI generation
    const mockArticle = `# ${selectedTopic} Fundamentals

${selectedTopic} is a revolutionary technology that has transformed the way we think about digital systems. In this comprehensive guide, we'll explore the core concepts, practical applications, and future potential of ${selectedTopic}.

## Key Concepts

The fundamental principles of ${selectedTopic} include decentralization, transparency, and immutability. These characteristics make it particularly suitable for applications requiring trust and security.

## Practical Applications

${selectedTopic} has found applications in various industries, from finance to healthcare, demonstrating its versatility and potential for widespread adoption.

## Future Outlook

As ${selectedTopic} continues to evolve, we can expect to see even more innovative applications and use cases emerge, shaping the future of technology.

## Getting Started

To begin your journey with ${selectedTopic}, start by understanding the basic concepts and gradually work your way up to more complex implementations.`;

    setArticle(mockArticle);
    setIsGenerating(false);
  };

  const generateQuizzes = async () => {
    setIsGenerating(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock quiz data - replace with actual AI generation
    const mockQuizzes = [
      {
        question: `What is the primary benefit of ${selectedTopic}?`,
        options: ['Speed', 'Decentralization', 'Cost', 'Simplicity'],
        correct: 1
      },
      {
        question: `Which industry has ${selectedTopic} most impacted?`,
        options: ['Agriculture', 'Finance', 'Education', 'Manufacturing'],
        correct: 1
      },
      {
        question: `What makes ${selectedTopic} secure?`,
        options: ['Encryption', 'Immutability', 'Speed', 'Cost'],
        correct: 1
      },
      {
        question: `How does ${selectedTopic} ensure transparency?`,
        options: ['Private keys', 'Public ledgers', 'Centralized control', 'Encryption'],
        correct: 1
      },
      {
        question: `What is a key feature of ${selectedTopic}?`,
        options: ['Centralization', 'Trustlessness', 'High costs', 'Slow processing'],
        correct: 1
      }
    ];
    
    setQuizzes(mockQuizzes);
    setIsGenerating(false);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuiz] = answerIndex;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correct = 0;
    quizzes.forEach((quiz, index) => {
      if (answers[index] === quiz.correct) correct++;
    });
    setScore(Math.round((correct / quizzes.length) * 100));
    setShowResults(true);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Tutor - {campaign.name}
          </DialogTitle>
          <DialogDescription>
            Learn with our intelligent AI tutor and test your knowledge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedTopic && (
            <div>
              <Label className="text-lg font-semibold mb-4 block">Choose a topic to learn:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    variant={selectedTopic === topic ? "default" : "outline"}
                    onClick={() => setSelectedTopic(topic)}
                    className="h-12"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedTopic && !article && (
            <div className="text-center">
              <Button onClick={generateArticle} disabled={isGenerating} className="mb-4">
                {isGenerating ? 'Generating Article...' : 'Generate Article'}
              </Button>
            </div>
          )}

          {article && (
            <div>
              <div className="prose max-w-none mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: article.replace(/\n/g, '<br/>') }} />
              </div>
              <Button onClick={generateQuizzes} disabled={isGenerating}>
                {isGenerating ? 'Generating Quizzes...' : 'Take Quiz'}
              </Button>
            </div>
          )}

          {quizzes.length > 0 && !showResults && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Quiz Progress</h3>
                <span>{currentQuiz + 1} of {quizzes.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuiz + 1) / quizzes.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium">{quizzes[currentQuiz].question}</h4>
                <div className="space-y-2">
                  {quizzes[currentQuiz].options.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant={answers[currentQuiz] === index ? "default" : "outline"}
                      onClick={() => handleAnswer(index)}
                      className="w-full justify-start"
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </Button>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuiz(Math.max(0, currentQuiz - 1))}
                    disabled={currentQuiz === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentQuiz < quizzes.length - 1) {
                        setCurrentQuiz(currentQuiz + 1);
                      } else {
                        calculateScore();
                      }
                    }}
                  >
                    {currentQuiz < quizzes.length - 1 ? 'Next' : 'Finish Quiz'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showResults && (
            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold">Quiz Complete!</h3>
              <div className="text-4xl font-bold text-green-600">{score}%</div>
              <p className="text-gray-600 dark:text-gray-300">
                You answered {score > 0 ? Math.round((score / 100) * quizzes.length) : 0} out of {quizzes.length} questions correctly
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => {
                  setShowResults(false);
                  setCurrentQuiz(0);
                  setAnswers([]);
                  setScore(0);
                }}>
                  Retake Quiz
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reusable uniform card for non-hero grids
const CampaignSliderCard = ({ campaign, isDark, onJoin }: { campaign: any; isDark: boolean; onJoin: (campaign: any) => void }) => {
  const timeLeft = Math.max(0, campaign.endDate.getTime() - Date.now());
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <Card className="w-full h-[400px] hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-surface" onClick={() => onJoin(campaign)}>
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={campaign.image}
            alt={campaign.name}
            fill
            className="object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4">
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
              {campaign.status === 'active' ? 'Active' : campaign.status === 'completed' ? 'Completed' : 'Featured'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-xl mb-2 truncate">{campaign.name}</CardTitle>
        <CardDescription className="mb-4 truncate">{campaign.description}</CardDescription>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span>{campaign.fundingAmount} CELO</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-500" />
            <span>{campaign.participants} participants</span>
          </div>
        </div>
        
        <Button className={`w-full mt-4 dark:text-primary-800 `} onClick={(e) => {
          e.stopPropagation();
          onJoin(campaign);
        }}>
          Join Campaign
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

// Compact card specifically for the hero slider
const SliderCampaignMiniCard = ({ campaign, onJoin }: { campaign: any; onJoin: (campaign: any) => void }) => {
  return (
    <div
      className="relative min-w-[250px] max-w-[180px] h-[150px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/40 hover:border-primary-400 transition-colors cursor-pointer"
      onClick={() => onJoin(campaign)}
    >
      <Image src={campaign.image} alt={campaign.name} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-2 left-2 right-2">
        <div className="mb-1">
          <Badge className="bg-primary-500 text-black">{campaign.status}</Badge>
        </div>
        <h3 className="text-sm font-semibold text-white truncate">{campaign.name}</h3>
      </div>
    </div>
  );
};

// Main Landing Page Component
export default function NewLandingPage() {
  const { theme, setTheme } = useTheme();
  const { isConnected } = useAccount();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('current');
  const autoplay = useMemo(() => Autoplay({ delay: 3500, stopOnInteraction: true }), []);
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplay]);
  const isDark = theme === 'dark';

  // Mock blockchain data fetching - replace with actual contract calls
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setCampaigns(MOCK_CAMPAIGNS);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleJoinCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
  };

  const currentCampaigns = campaigns.filter(c => c.status === 'active');
  const featuredCampaigns = campaigns.filter(c => c.status === 'featured');
  const pastCampaigns = campaigns.filter(c => c.status === 'completed');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-blackish text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-black bg-opacity-80 dark:bg-primary-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold dark:text-primary-500">
                Learna
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
              >
                {isDark? <Sun className="w-5 h-5 text-primary-500" /> : <Moon className="w-5 h-5" />}
              </Button>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with campaign slider (Dorahacks style) */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <Image src="/assets/learna-image4.png" alt="bg" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-black text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              AI-powered proof of learning and integration
            </div>

            <h1 className={`text-4xl md:text-6xl font-extrabold mb-4 ${isDark? 'text-gray-300 font-mono' : 'text-black opacity-80 font-black drop-shadow-primary-500'} drop-shadow-lg `}>
              Learn faster. Prove mastery. Ship integrations. Earn crypto rewards.
            </h1>

            <p className={`text-base md:text-lg ${isDark? 'text-gray-300' : 'text-black opacity-80'} mb-10 max-w-3xl mx-auto`}>
              For developers, designers, and any product minds exploring technologies like Celo, Farcaster, Next.js, Solidity, and Wagmi, etc.
            </p>

            {/* Div for Learners and Creators */}
            <div className="pt-4 pb-20 px-4 sm:px-6 lg:px-8 dark:font-mono">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`rounded-2xl p-8 border border-neutral-800 dark:bg-surface`}>
                        <h3 className={`text-3xl font-bold dark:text-white opacity-80 mb-3`}>For Builders</h3>
                        <p className={`{isDark? 'text-gray-300' : ''} mb-6`}>Follow AI-crafted learning paths on technologies like Celo, Farcaster, Next.js, Solidity, Wagmi and more. Earn crypto for proofs of learning and shipped integrations.</p>
                        <ul className={`space-y-2 dark:text-gray-300 mb-6`}>
                            <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Short, challenging lessons</li>
                            <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Hands-on quizzes and scoring</li>
                            <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Track progress on-chain</li>
                        </ul>
                        <Button className="bg-primary-500 text-black hover:bg-primary-400">Start learning</Button>
                    </div>

                    <div className={`rounded-2xl p-8 border border-neutral-800 dark:bg-surface`}>
                        <h3 className={`text-3xl font-bold dark:text-white opacity-80 mb-3`}>For Protocol Owners/Managers</h3>
                        <p className={`{isDark? 'text-gray-300 mb-6`}>Launch funded learning campaigns to onboard developers to your SDK or protocol. Reward with up to 3 ERC20 tokens and native assets like Celo.</p>
                        <ul className={`space-y-2 dark:text-gray-300 mb-6`}>
                            <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Target web2/web3 devs, designers, PMs</li>
                            <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Proof of Learning and Integration</li>
                            <li className="flex items-center gap-2"><Star className="w-5 h-5 text-primary-500"/>Analytics and impact tracking</li>
                        </ul>
                        <Button variant="outline" className="border-primary-500 text-primary-500">Create a campaign</Button>
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
                {(isLoading ? MOCK_CAMPAIGNS : campaigns).map((c) => (
                  <div key={c.id} className="min-w-[150px] max-w-[250px] shrink-0 cursor-pointer" onClick={() => handleJoinCampaign(c)}>
                    <SliderCampaignMiniCard campaign={c} onJoin={handleJoinCampaign} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 dark:font-mono">
              <Button size="lg" className="bg-primary-500 text-black hover:bg-primary-400">
                Explore campaigns
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className={`border-neutral-700 ${isDark? 'text-white' : ''}`}>
                <Play className="w-5 h-5 mr-2" />
                How it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 dark:font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${isDark? 'text-white' : 'text-black opacity-80'}`}>Learning Campaigns</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose from our curated selection of learning campaigns
            </p>
          </div>

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
                      isDark={isDark}
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
                    isDark={isDark}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastCampaigns.map((campaign) => (
                  <CampaignSliderCard
                    key={campaign.id}
                    campaign={campaign}
                    onJoin={handleJoinCampaign}
                    isDark={isDark}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 dark:bg-neutral-950 dark:font-mono">
        <div className="max-w-7xl border border-black/80 dark:border-none rounded-xl py-8 px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Learna?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Experience the future of education with our innovative platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn with our intelligent AI tutor that creates personalized content and quizzes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get paid in cryptocurrency for completing learning challenges and quizzes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Join a vibrant community of learners and compete with others
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor Modal */}
      {selectedCampaign && (
        <AITutor
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* Footer */}
      {/* <footer className="border-t border-neutral-800 "> */}
      <footer className="dark:bg-neutral-950 dark:text-gray-300 pb-4 dark:font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 border border-black/80 dark:border-primary-100 rounded-xl py-8 px-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded bg-black bg-opacity-70 dark:bg-primary-500" />
              <span className="font-bold dark:text-white">Learna</span>
            </div>
            <p className="text-sm">AI-powered learning campaigns for builders. Learn, prove, integrate, and earn.</p>
          </div>
          <div>
            <h4 className="font-semibold dark:text-white mb-3">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li>Celo</li>
              <li>Farcaster</li>
              <li>Solidity</li>
              <li>And more</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Create</h4>
            <ul className="space-y-2 text-sm">
              <li>Launch a campaign</li>
              <li>Funding options</li>
              <li>Guidelines</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>About</li>
              <li>Docs</li>
              <li>Contact</li>
            </ul>
          </div>
            <div className="py-6 text-center text-xs font-bold text-gray-500">© {new Date().getFullYear()} Learna. All rights reserved.</div>
        </div>
      </footer>

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
