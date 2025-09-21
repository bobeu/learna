"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Calendar, Search, Trophy, Target, BookOpenCheck, BarChart3, Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CampaignTabs from "@/components/campaigns/CampaignTabs"; 
import AITutor from "@/components/ai/AITutor";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { formattedMockLearners, CampaignStateProps } from "../../../types";
import { calculateStreak, normalizeImageSrc, normalizeString, toBN } from "@/components/utilities";
import useStorage from "@/components/hooks/useStorage";

export default function LearnPage(){
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    const [search, setSearch] = React.useState("");
    const [startDate, setStartDate] = React.useState<string>("");
    const [endDate, setEndDate] = React.useState<string>("");
    const [selectedCampaign, setSelectedCampaign] = React.useState<CampaignStateProps | null>(null);

    const { isLoading, builderCampaigns, campaignsData } = useStorage();

    const handleJoinCampaign = React.useCallback((campaign: CampaignStateProps) => {
        setSelectedCampaign(campaign);
    }, []);

    const closeTutor = React.useCallback(() => setSelectedCampaign(null), []);

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

    const filteredCampaigns : CampaignStateProps[] = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        return mappedCampaigns.filter((c) => {
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
    }, [mappedCampaigns, search, startDate, endDate]);

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
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-black dark:font-mono">
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
                        <Button variant="outline" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle theme">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                        <ConnectButton />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
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
                                {/* <div className="w-full sm:w-auto">
                                    <ConnectButton
                                        chainStatus={{ smallScreen: "none", largeScreen: "none" }}
                                        showBalance={{ smallScreen: true, largeScreen: true }}
                                        accountStatus={{ smallScreen: "avatar", largeScreen: "avatar" }}
                                        label="Connect"
                                    />
                                </div> */}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {
                                    statsContent.map(({icon, label, value}) => (
                                        <StatItem icon={icon} label={label} value={value} key={label} />
                                    ))
                                }
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-neutral-200 dark:border-neutral-800 dark:bg-surface">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="md:col-span-3">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                                        <Input id="search" placeholder="Search by name or funded amount" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="startDate">Start date</Label>
                                    <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">End date</Label>
                                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <section>
                    <CampaignTabs campaigns={filteredCampaigns} isLoading={isLoading} handleJoinCampaign={handleJoinCampaign} showHeader={false} compact={true} />
                </section>
            </div>

            {selectedCampaign && (
                <AITutor campaign={selectedCampaign} onClose={closeTutor} />
            )}
        </main>
    );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }){
    return (
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-200 text-black flex items-center justify-center">
                {icon}
            </div>
            <div>
                <div className="text-xs text-neutral-500">{label}</div>
                <div className="text-base font-semibold">{value}</div>
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