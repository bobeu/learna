"use client";

/*eslint-disable */
import React, { useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Calendar, Search, Trophy, Target, BookOpenCheck, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CampaignLearningInit from "@/components/ai/CampaignLearningInit";
import CampaignCompactCard from "@/components/learnaApp/cards/CampaignCompactCard";
import LearnerProfileDisplay from "@/components/ai/LearnerProfileDisplay";
import LearnerProfileModal from "@/components/modals/LearnerProfileModal";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { formattedMockLearners, CampaignStateProps, Learner } from "../../../types";
import { calculateStreak, normalizeImageSrc, normalizeString, toBN, formatAddr } from "@/components/utilities";
import useStorage from "@/components/hooks/useStorage";
import { useAccount } from "wagmi";

export default function LearnPage(){
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { address } = useAccount();
    const userAddress = formatAddr(address);

    const [search, setSearch] = React.useState("");
    const [startDate, setStartDate] = React.useState<string>("");
    const [endDate, setEndDate] = React.useState<string>("");
    const [selectedCampaign, setSelectedCampaign] = React.useState<CampaignStateProps | null>(null);
    const [statsCampaign, setStatsCampaign] = React.useState<CampaignStateProps | null>(null);
    const [showStatsModal, setShowStatsModal] = React.useState(false);

    const { isLoading, builderCampaigns, campaignsData } = useStorage();

    const handleJoinCampaign = React.useCallback((campaign: CampaignStateProps) => {
        setSelectedCampaign(campaign);
    }, []);

    const closeTutor = React.useCallback(() => setSelectedCampaign(null), []);

    const handleViewStats = React.useCallback((campaign: CampaignStateProps) => {
        setStatsCampaign(campaign);
        setShowStatsModal(true);
    }, []);

    const closeStatsModal = React.useCallback(() => {
        setShowStatsModal(false);
        setStatsCampaign(null);
    }, []);

    const mappedCampaigns : CampaignStateProps[] = useMemo(() => {
        return campaignsData.map((c, idx) => {
            const latest = c.epochData?.[c.epochData.length - 1];
            const nativeTotal = latest ? (latest.setting.funds.nativeAss + latest.setting.funds.nativeInt) : 0n;
            const learners = latest?.learners || formattedMockLearners;
            const endDateMs = toBN(c.metadata.endDate || 0).toNumber() * 1000;
            
            return {
                id: idx,
                name: normalizeString(c.metadata.name),
                description: normalizeString(c.metadata.description),
                image: normalizeImageSrc(c.metadata.imageUrl),
                link: normalizeString(c.metadata.link),
                fundingAmount: formatEther(nativeTotal),
                endDate: new Date(endDateMs),
                status: c.metadata.endDate && endDateMs < Date.now() ? "completed" : "active",
                participants: learners.length,
                __raw: c
            };
        });
    }, [campaignsData]);

    // Check if user is a participant in a campaign
    const isUserParticipant = React.useCallback((campaign: CampaignStateProps) => {
        if (!userAddress || !campaign.__raw) return false;
        const userAddr = userAddress.toLowerCase();
        return campaign.__raw.epochData?.some(epoch => 
            epoch.learners?.some(learner => learner.id.toLowerCase() === userAddr)
        ) || false;
    }, [userAddress]);

    // Separate campaigns into user campaigns and other campaigns
    const { userCampaigns, otherCampaigns } = React.useMemo(() => {
        const user: CampaignStateProps[] = [];
        const other: CampaignStateProps[] = [];

        mappedCampaigns.forEach(campaign => {
            if (isUserParticipant(campaign)) {
                user.push(campaign);
            } else {
                other.push(campaign);
            }
        });

        return { userCampaigns: user, otherCampaigns: other };
    }, [mappedCampaigns, isUserParticipant]);

    const filteredCampaigns : CampaignStateProps[] = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        const allCampaigns = [...userCampaigns, ...otherCampaigns];
        return allCampaigns.filter((c) => {
            const matchesQuery = q.length === 0 || c.name.toLowerCase().includes(q) || String(c.fundingAmount).toLowerCase().includes(q);
            const inDateRange = (() => {
                if (!startDate && !endDate) return true;
                if (!c.endDate) return true;
                const end = new Date(c.endDate).getTime();
                const startOk = startDate ? end >= new Date(startDate).getTime() : true;
                const endOk = endDate ? end <= new Date(endDate).getTime() : true;
                return startOk && endOk;
            })();
            return matchesQuery && inDateRange;
        });
    }, [userCampaigns, otherCampaigns, search, startDate, endDate]);

    // Separate filtered campaigns into user and other
    const filteredUserCampaigns = React.useMemo(() => {
        return filteredCampaigns.filter(campaign => isUserParticipant(campaign));
    }, [filteredCampaigns, isUserParticipant]);

    // Create a set of user campaign IDs for quick lookup
    const userCampaignIds = React.useMemo(() => {
        return new Set(filteredUserCampaigns.map(campaign => campaign.id));
    }, [filteredUserCampaigns]);

    // Get learner data for a specific campaign (combines all epochs)
    const getCampaignLearner = React.useCallback((campaign: CampaignStateProps): Learner | null => {
        if (!campaign?.__raw || !userAddress) return null;

        const userAddr = userAddress.toLowerCase();
        let combinedLearner: Learner | null = null;

        campaign.__raw.epochData?.forEach((epoch) => {
            const learner = epoch.learners?.find(
                (l) => l.id.toLowerCase() === userAddr
            );

            if (learner) {
                if (!combinedLearner) {
                    // Initialize with first found learner
                    combinedLearner = {
                        id: learner.id,
                        poass: [...learner.poass],
                        point: learner.point,
                        ratings: [...learner.ratings],
                    };
                } else {
                    // Combine data from all epochs
                    combinedLearner.poass = [...combinedLearner.poass, ...learner.poass];
                    combinedLearner.ratings = [...combinedLearner.ratings, ...learner.ratings];
                    // Use the most recent point (or verified one if available)
                    if (learner.point.verified || (!combinedLearner.point.verified && learner.point.score > 0)) {
                        combinedLearner.point = learner.point;
                    }
                }
            }
        });

        return combinedLearner;
    }, [userAddress]);

    const statsContent = React.useMemo(() => {
        let quizzesTaken = 0;
        let joinedCampaigns = 0;
        let totalScore = 0;
        let averageScore = 0;
        let bestScore = 0;
        let totalPoints = 0;
        let streak = 0;
        let badges = 0;

        // const builder = campaignsData.filter((c) => {
        //     const anyLearner = c.epochData?.some((e) => e.learners?.some((l) => l.id.toLowerCase() === userAddress));
        //     return anyLearner;
        // });
        if(builderCampaigns.length > 0) {
            joinedCampaigns = builderCampaigns.length;
            builderCampaigns.forEach((b) => {
                b.epochData?.forEach((e) => {
                    e.learners?.forEach((l) => {
                        quizzesTaken += l.poass.length;
                        totalScore += l.poass.reduce((sum, p) => sum + toBN(p.score).toNumber(), 0);
                        totalPoints += l.poass.reduce((sum, p) => sum + toBN(p.totalPoints).toNumber(), 0);
                        streak = calculateStreak(l.poass);
                        badges = badges + l.ratings.reduce((sum, r) => sum + toBN(r.value).toNumber(), 0) % 5;
                        if(l.poass.length > 0){
                            const best = Math.max(...l.poass.map(p => p.percentage));
                            if(best > bestScore) bestScore = best;
                        }
                    });
                });
            });
            if(totalPoints > 0) {
                if(totalScore > 0) averageScore = Math.round((totalScore / totalPoints) * 100);
            }
        }

        const stats = {
            pastCampaigns: mappedCampaigns.filter(c => c.status === "completed").length,
            joinedCampaigns,
            quizzesTaken,
            avgScore: averageScore,
            streakDays: streak,
            badges,
        }                                                        
        return getStatsContent(stats);
    }, [mappedCampaigns, builderCampaigns]);

    return (
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-black dark:font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/">
                        <Button variant="outline" className={`gap-2 dark:text-white border-neutral-700 hover:border-primary-400`}>
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-black text-sm font-medium">
                            <Sparkles className="w-4 h-4 mr-1" />
                            Learning Hub
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* First Card: User Profile Stats */}
                    <Card className="lg:col-span-1 border-neutral-200 dark:border-neutral-800 dark:bg-surface">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-4 mb-6 flex-col sm:flex-row">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-black font-bold shrink-0">BL</div>
                                    <div className="hidden sm:block">
                                        <div className={`text-sm ${isDark ? "text-white" : "text-black"}`}>Welcome back</div>
                                        <div className="text-xs text-neutral-500">Manage your learning profile</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {
                                    statsContent.map(({icon, label, value}) => (
                                        <StatItem icon={icon} label={label} value={value} key={label} />
                                    ))
                                }
                            </div>
                            {/* Learner Profile Section - Only visible on web (lg and above) */}
                            {statsCampaign && (
                                <div className="hidden lg:block mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                        Your Profile
                                    </h4>
                                    <LearnerProfileDisplay 
                                        learner={getCampaignLearner(statsCampaign)} 
                                        campaignName={statsCampaign.name}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Second Card: Search Filters + Campaigns Grid */}
                    <Card className="lg:col-span-2 border-neutral-200 dark:border-neutral-800 dark:bg-surface">
                        <CardContent className="p-4 sm:p-6">
                            {/* Search Filters Section */}
                            <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Search & Filter Campaigns
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="sm:col-span-2 lg:col-span-1">
                                        <Label htmlFor="search" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Search
                                        </Label>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
                                            <Input 
                                                id="search" 
                                                placeholder="Name or amount..." 
                                                className="pl-10 pr-3 text-sm h-10 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-400" 
                                                value={search} 
                                                onChange={(e) => setSearch(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="startDate" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Start Date
                                        </Label>
                                        <Input 
                                            id="startDate" 
                                            type="date" 
                                            value={startDate} 
                                            onChange={(e) => setStartDate(e.target.value)} 
                                            className="text-sm h-10 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-400" 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            End Date
                                        </Label>
                                        <Input 
                                            id="endDate" 
                                            type="date" 
                                            value={endDate} 
                                            onChange={(e) => setEndDate(e.target.value)} 
                                            className="text-sm h-10 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-400" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Campaigns Grid Section */}
                            <div className="space-y-6">
                                {/* User Campaigns Section */}
                                {filteredUserCampaigns.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                Your Campaigns
                                            </h3>
                                            <span className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                                                {filteredUserCampaigns.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                            <AnimatePresence mode="popLayout">
                                                {filteredUserCampaigns.map((campaign, index) => (
                                                    <motion.div
                                                        key={campaign.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                                        transition={{
                                                            duration: 0.3,
                                                            delay: index * 0.05,
                                                            ease: [0.4, 0, 0.2, 1]
                                                        }}
                                                    >
                                                        <CampaignCompactCard
                                                            campaign={campaign}
                                                            onJoin={handleJoinCampaign}
                                                            onViewStats={handleViewStats}
                                                            isUserCampaign={true}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* All Campaigns Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                            {filteredUserCampaigns.length > 0 ? 'All Campaigns' : 'Campaigns'}
                                        </h3>
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 px-2 py-1 rounded-full">
                                            {filteredCampaigns.length}
                                        </span>
                                    </div>
                                    {isLoading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <Card key={i} className="w-full">
                                                    <CardContent className="p-3">
                                                        <div className="animate-pulse space-y-2">
                                                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : filteredCampaigns.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                            <AnimatePresence mode="popLayout">
                                                {filteredCampaigns.map((campaign, index) => {
                                                    const isInUserCampaigns = userCampaignIds.has(campaign.id);
                                                    return (
                                                        <motion.div
                                                            key={campaign.id}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.8, y: 20, rotateX: -15 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                                            exit={{ 
                                                                opacity: 0, 
                                                                scale: 0.8, 
                                                                y: -20, 
                                                                rotateX: 15,
                                                                transition: { duration: 0.2 }
                                                            }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: index * 0.03,
                                                                ease: [0.34, 1.56, 0.64, 1],
                                                                layout: { duration: 0.3 }
                                                            }}
                                                            whileHover={{ 
                                                                scale: 1.02,
                                                                transition: { duration: 0.2 }
                                                            }}
                                                            className={isInUserCampaigns ? 'blur-[2px] opacity-75' : ''}
                                                        >
                                                            <CampaignCompactCard
                                                                campaign={campaign}
                                                                onJoin={handleJoinCampaign}
                                                                onViewStats={isUserParticipant(campaign) ? handleViewStats : undefined}
                                                                isUserCampaign={isUserParticipant(campaign)}
                                                            />
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <Card className="border-neutral-200 dark:border-neutral-800">
                                            <CardContent className="p-6 text-center">
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    No campaigns found matching your search criteria.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedCampaign && (
                <CampaignLearningInit campaign={selectedCampaign} onClose={closeTutor} />
            )}

            {/* Learner Profile Modal - Only visible on mobile */}
            <LearnerProfileModal
                learner={statsCampaign ? getCampaignLearner(statsCampaign) : null}
                isOpen={showStatsModal && !!statsCampaign}
                onClose={closeStatsModal}
            />
        </main>
    );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }){
    return (
        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary-200 text-black flex items-center justify-center flex-shrink-0">{icon}</div>
            <div className="min-w-0 flex-1">
                <div className="text-xs text-neutral-500 truncate">{label}</div>
                <div className="text-sm sm:text-base font-semibold truncate">{value}</div>
            </div>
        </div>
    );
}

const getStatsContent= (stats: Stats) => {
    return [
        {
            icon: <Trophy className="w-4 h-4" />,
            label: 'Past Campaigns',
            value: String(stats.pastCampaigns)
        },
        {
            icon: <Target className="w-4 h-4" />,
            label: 'Joined',
            value: String(stats.joinedCampaigns)
        },
        {
            icon: <BookOpenCheck className="w-4 h-4" />,
            label: 'Quizzes',
            value: String(stats.quizzesTaken)
        },
        {
            icon: <BarChart3 className="w-4 h-4" />,
            label: 'Avg Score',
            value: `${stats.avgScore}%`
        },
        {
            icon: <Calendar className="w-4 h-4" />,
            label: 'Streak',
            value: `${stats.streakDays} days`
        },
        {
            icon: <Trophy className="w-4 h-4" />,
            label: 'Badges',
            value: String(stats.badges)
        },
    ]
}

interface Stats {
    pastCampaigns: number;
    joinedCampaigns: number;
    quizzesTaken: number;
    avgScore: number;
    streakDays: number;
    badges: number;
}