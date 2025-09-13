"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BarChart3, Users, Layers, Calendar, ImageIcon, WandSparkles, Loader2, ArrowLeft, Moon, Sun } from "lucide-react";
import { useChainId } from "wagmi";
import Link from "next/link";
// import { CAMPAIGN_FACTORY_ADDRESS } from "@/components/landingPage/Hero";
import CreateCampaign from "@/components/transactions/CreateCampaign";
import { CreateCampaignInput } from "../../../../types";

export default function NewCampaignPage(){
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';
    // const { address: connectedAddress } = useAccount();
    const chainId = useChainId();

    const [showMyCampaigns, setShowMyCampaigns] = React.useState(false);
    const [selectedCampaign, setSelectedCampaign] = React.useState<any | null>(null);
    const [ipfsUploading, setIpfsUploading] = React.useState(false);
    const [aiGenerating, setAiGenerating] = React.useState(false);

    // Form state
    const [name, setName] = React.useState("");
    const [docUrl, setDocUrl] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [imageUri, setImageUri] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [endInHours, setEndInHours] = React.useState<number | null>(null);
    const [useAiImage, setUseAiImage] = React.useState(false);
    const [imagePreview, setImagePreview] = React.useState<string>("");
    const [openDrawer, setOpenDrawer] = React.useState<number>(0);

    React.useEffect(() => {
        if (startDate && endDate) {
            const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
            if (diffMs > 0) setEndInHours(Math.floor(diffMs / (1000 * 60 * 60)));
            else setEndInHours(0);
        } else {
            setEndInHours(null);
        }
    }, [startDate, endDate]);

    const myCampaigns = React.useMemo(() => (
        [
            { id: 1, name: "Solidity Fundamentals", tvl: 3200, learners: 245, builders: 38, start: "2024-08-01", end: "2024-09-01" },
            { id: 2, name: "Divvi SDK Integration", tvl: 4100, learners: 190, builders: 27, start: "2024-06-15", end: "2024-07-20" },
        ]
    ), []);

    const { argReady, params } = React.useMemo(() => {
        const argReady = description !== '' && (endInHours !== null && endInHours > 0) && imageUri !== '' && name !== '';
        const params : CreateCampaignInput = {
            description,
            endDateInHr: Number(endInHours),
            imageUrl: imageUri,
            link: docUrl,
            name
        };
        return { argReady, params }
    }, [endInHours, imageUri, name, docUrl, description]);

    const totalTVL = React.useMemo(() => myCampaigns.reduce((s, c) => s + c.tvl, 0), [myCampaigns]);

    const toggleDrawer = (arg: number) => {
        setOpenDrawer(arg);
    }


    const uploadToIpfs = async (file: File) => {
        setIpfsUploading(true);
        try{
            const body = new FormData();
            body.append('file', file);
            const res = await fetch('/api/upload-to-ipfs', { method: 'POST', body });
            const data = await res.json();
            if (data?.uri) {
                setImageUri(data.uri);
                const local = URL.createObjectURL(file);
                setImagePreview(local);
            }
        } finally {
            setIpfsUploading(false);
        }
    };

    const generateAiImage = async () => {
        setAiGenerating(true);
        try{
            const res = await fetch('/api/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Generate a modern campaign cover image for ${name}. ${description}` }) });
            const data = await res.json();
            if (data?.uri) {
                setImageUri(data.uri);
                setImagePreview(data.uri);
            }
        } finally {
            setAiGenerating(false);
        }
    };

    const handleCreate = async () => {
        if(!argReady) return alert("Please provide relevant information");
        setOpenDrawer(1);
        // console.log({ name, docUrl, description, imageUri, startDate, endDate, endInHours, tokens, nativeAmount });
        // alert('Draft created. Hook up factory write when ready.');
    };

    return (
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-black dark:font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/">
                        <Button variant="outline" className={`gap-2 ${isDark ? 'text-white border-neutral-700' : ''}`}>
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary">Creator Console</Badge>
                        <Button variant="outline" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle theme">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <Card className="lg:col-span-1 border-neutral-200 dark:border-neutral-800 dark:bg-surface">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-semibold">Your Campaigns</div>
                                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowMyCampaigns((s) => !s)}>
                                    {showMyCampaigns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} View All
                                </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <Stat label="Created" value={String(myCampaigns.length)} icon={<Layers className="w-4 h-4" />} />
                                <Stat label="Total TVL" value={`$${totalTVL}`} icon={<BarChart3 className="w-4 h-4" />} />
                                <Stat label="Active" value={String(1)} icon={<Calendar className="w-4 h-4" />} />
                            </div>

                            {showMyCampaigns && (
                                <div className="space-y-2">
                                    {myCampaigns.map((c) => (
                                        <button key={c.id} className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setSelectedCampaign(c)}>
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{c.name}</div>
                                                <Badge variant="outline">${c.tvl}</Badge>
                                            </div>
                                            <div className="text-xs text-neutral-500">{c.start} → {c.end}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-neutral-200 dark:border-neutral-800 dark:bg-surface">
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <div className="text-xl font-semibold mb-1">Create new campaign</div>
                                <div className="text-sm text-neutral-500">Provide details and funding. You can add multiple ERC20s and native CELO.</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Campaign name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Solidity Fundamentals" />
                                </div>
                                <div>
                                    <Label htmlFor="doc">Documentation link</Label>
                                    <Input id="doc" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://docs.example.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea id="desc" value={description} onChange={(e) => {
                                        const text = e.target.value;
                                        const words = text.trim().length ? text.trim().split(/\s+/) : [];
                                        if (words.length <= 500) setDescription(text);
                                    }} rows={4} placeholder="Describe the campaign objectives and tasks (max 500 words)" />
                                    <div className="text-xs text-neutral-500 mt-1">{description.trim().length ? Math.min(500, description.trim().split(/\s+/).length) : 0} / 500 words</div>
                                </div>

                                <div>
                                    <Label>Start date</Label>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <Label>End date</Label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    {endInHours !== null && <div className="text-xs text-neutral-500 mt-1">Duration: {endInHours} hrs</div>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">Campaign image</div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Button variant={useAiImage ? "outline" : "default"} size="sm" className="gap-2" onClick={() => setUseAiImage(false)}>
                                            <ImageIcon className="w-4 h-4" /> Upload
                                        </Button>
                                        <Button variant={useAiImage ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setUseAiImage(true)}>
                                            <WandSparkles className="w-4 h-4" /> AI Generate
                                        </Button>
                                    </div>
                                </div>
                                {!useAiImage ? (
                                    <div className="flex items-center gap-3">
                                        <Input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadToIpfs(file);
                                        }} />
                                        {ipfsUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    </div>
                                ) : (
                                    <div>
                                        <Button onClick={generateAiImage} className="gap-2" disabled={aiGenerating}>
                                            {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />} Generate with AI
                                        </Button>
                                    </div>
                                )}
                                {imageUri && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-neutral-500 break-all">Image URI: {imageUri}</div>
                                        <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={(imagePreview || imageUri).startsWith('ipfs://') ? `https://ipfs.io/ipfs/${(imagePreview || imageUri).slice(7)}` : (imagePreview || imageUri)} alt="Campaign preview" className="w-full h-auto" />
                                            <div className="absolute top-2 right-2">
                                                <Button variant="destructive" size="sm" onClick={() => { setImageUri(""); setImagePreview(""); }}>Delete</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="font-medium text-blue-900 dark:text-blue-100">Campaign Creation</div>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Create your campaign first with basic information. You can add funding later from your profile.
                                </p>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full" onClick={handleCreate}>Create Campaign</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedCampaign && (
                <CampaignStatsModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
            )}
            <CreateCampaign 
                openDrawer={openDrawer}
                params={params}
                toggleDrawer={toggleDrawer}
            />
        </main>
    );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }){
    return (
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-200 text-black flex items-center justify-center">{icon}</div>
            <div>
                <div className="text-xs text-neutral-500">{label}</div>
                <div className="text-base font-semibold">{value}</div>
            </div>
        </div>
    );
}

function CampaignStatsModal({ campaign, onClose }: { campaign: any; onClose: () => void }){
    const [open, setOpen] = React.useState(true);
    const learners = campaign.learners;
    const builders = campaign.builders;
    const participationRate = Math.min(100, Math.round((learners / 500) * 100));

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Campaign Analytics - {campaign.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <Stat label="Total Learners" value={String(learners)} icon={<Users className="w-4 h-4" />} />
                        <Stat label="Total Builders" value={String(builders)} icon={<Layers className="w-4 h-4" />} />
                        <Stat label="TVL" value={`$${campaign.tvl}`} icon={<BarChart3 className="w-4 h-4" />} />
                    </div>
                    <div>
                        <div className="text-sm mb-1">Participation</div>
                        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full">
                            <div className="h-2 bg-primary-500 rounded-full" style={{ width: `${participationRate}%` }} />
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">{participationRate}% of target</div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


