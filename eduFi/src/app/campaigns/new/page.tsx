"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BarChart3, Layers, Calendar, ImageIcon, WandSparkles, Loader2, ArrowLeft, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Address, CreateCampaignInput, FormattedCampaignTemplate, FunctionName } from "../../../../types";
import useStorage from "@/components/hooks/useStorage";
import { formatEther, zeroAddress } from "viem";
import TransactionModal, { TransactionStep } from "@/components/ui/TransactionModal";
import { filterTransactionData, toBN } from "@/components/utilities";
import { useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CampaignStatsModal from "@/components/modals/CampaignStatsModal";

export default function NewCampaignPage(){
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';
    const chainId = useChainId();

    const [showMyCampaigns, setShowMyCampaigns] = React.useState(false);
    const [selectedCampaign, setSelectedCampaign] = React.useState<FormattedCampaignTemplate | null>(null);
    const [ipfsUploading, setIpfsUploading] = React.useState(false);
    const [aiGenerating, setAiGenerating] = React.useState(false);
    const [campaingStatModalOpen, setCampaignStatModalOpen] = React.useState(false);

    // Form state
    const [name, setName] = React.useState<string | null>(null);
    const [docUrl, setDocUrl] = React.useState<string | null>(null);
    const [description, setDescription] = React.useState<string | null>(null);
    const [imageUri, setImageUri] = React.useState<string | null>(null);
    const [startDate, setStartDate] = React.useState<string | null>(null);
    const [endDate, setEndDate] = React.useState<string | null>(null);
    const [endInHours, setEndInHours] = React.useState<number | null>(null);
    const [useAiImage, setUseAiImage] = React.useState(false);
    const [imagePreview, setImagePreview] = React.useState<string>("");
    const [showTransactionModal, setShowTransactionModal] = React.useState<boolean>(false);

    const { creatorCampaigns, creationFee } = useStorage();
    const onCloseCampaignStatModal = () => {
        setCampaignStatModalOpen(false);
    };

    React.useEffect(() => {
        if (startDate && endDate) {
            const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
            if (diffMs > 0) setEndInHours(Math.floor(diffMs / (1000 * 60 * 60)));
            else setEndInHours(0);
        } else {
            setEndInHours(null);
        }
    }, [startDate, endDate]);

    const myCampaigns = React.useMemo(() => {
        let learners = 0;
        let builders = 0;
        const myCampaigns = creatorCampaigns.map((myCampaign, id) => {
            const {metadata, epochData} = myCampaign;
            let tvl = 0;
            epochData.forEach(({setting: {funds : { erc20Ass, erc20Int, nativeAss, nativeInt}}, learners: lnrs}) => {
                learners += lnrs.length;
                tvl += Number(formatEther(nativeAss));
                tvl += Number(formatEther(nativeInt));
                if(erc20Ass.some((e) => e.amount > 0n)) {
                    const sum = erc20Ass.reduce((start, current) => {
                        return Number(formatEther(BigInt(start) + current.amount));
                    }, 0);
                    tvl += sum;
                }
                if(erc20Int.some((e) => e.amount > 0)){
                    const sum = erc20Int.reduce((start, current) => {
                        return Number(formatEther(BigInt(start) + current.amount));
                    }, 0);
                    tvl += sum;
                }
                builders += lnrs.reduce((prev, current) => {
                    return prev += current.point.score > 0? 1 : 0;
                }, 0);
            });

            
            return{
                id,
                name: metadata.name,
                tvl,
                learners,
                builders,
                start: new Date(toBN(metadata.startDate).toNumber()).toString(),
                end: new Date(toBN(metadata.endDate).toNumber()).toString(),
                _raw: myCampaign
            }
        })
        return myCampaigns;
    }, [creatorCampaigns]);

    const { argReady, transactionInfo } = React.useMemo(() => {
        const params : CreateCampaignInput = {
            description: '',
            endDateInHr: 0,
            imageUrl: '',
            link: '',
            name: ''
        };
        const argReady = description && (endInHours && endInHours > 0) && imageUri && name;
        if(description) params.description = description;
        if(endDate) params.endDateInHr = Number(endInHours);
        if(imageUri) params.imageUrl = imageUri;
        if(name) params.name = name;
        if(docUrl) params.link = docUrl;

        const { contractAddresses: ca, transactionData: td} = filterTransactionData({chainId, filter: true, functionNames: ['createCampaign']});
        const transactionInfo = {
            contractAddress: td[0].contractAddress as Address,
            functionName: td[0].functionName as FunctionName,
            abi: td[0].abi,
            args: [params],
            value: creationFee
        };

        return { argReady, transactionInfo }
    }, [endInHours, imageUri, name, docUrl, description]);

    const totalTVL = React.useMemo(() => myCampaigns.reduce((s, c) => s + c.tvl, 0), [myCampaigns]);

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

    // Prepare data for on-chain storage
    const prepareOnChainData = () => {
        if (!argReady) return null;
        return transactionInfo;
    };

    // Create transaction steps for on-chain storage
      const createTransactionSteps = (): TransactionStep[] => {
        const data = prepareOnChainData();
        if (!data) return [{
          id: 'null', 
          title: 'null',
          description: 'Data unavailable', 
          functionName: 'allowance', 
          contractAddress: zeroAddress,
          abi: [],
          args: []
        }];
        
        return [{
            id: 'create-campaign',
            title: 'Create a new learning campaign',
            description: `Setting up data for the new ${name} campaign on the blockchain`,
            ...data
        }];
      };
    
    const handleCreateCampaign = () => {
        const steps = createTransactionSteps();
        if (steps.length === 0) {
            alert('No data to create campaign');
            return;
        }
        setShowTransactionModal(true);
    };
    
    const handleTransactionSuccess = (txHash: string) => {
        console.log('Proof of assimilation stored:', txHash);
        setShowTransactionModal(false);
    };

    const handleTransactionError = (error: Error) => {
        console.error('Failed to store proof:', error);
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
                        <ConnectButton />
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
                                        <button key={c.id} className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => {
                                            setSelectedCampaign(c._raw);
                                            setCampaignStatModalOpen(true);
                                        }}>
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{c.name}</div>
                                                <Badge variant="outline">${c.tvl}</Badge>
                                            </div>
                                            <div className="text-xs text-neutral-500">{`from ${c.start} → ${c.end}`}</div>
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
                                <div className="text-sm text-neutral-500">Provide details.</div>
                                {/* and funding. You can add multiple ERC20s and native CELO */}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Campaign name</Label>
                                    <Input id="name" value={name || ''} onChange={(e) => setName(e.target.value)} placeholder="e.g. Solidity Fundamentals" />
                                </div>
                                <div>
                                    <Label htmlFor="doc">Documentation link</Label>
                                    <Input id="doc" value={docUrl || ''} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://docs.example.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea id="desc" value={description || ''} onChange={(e) => {
                                        const text = e.target.value;
                                        const words = text.trim().length ? text.trim().split(/\s+/) : [];
                                        if (words.length <= 500) setDescription(text);
                                    }} rows={4} placeholder="Describe the campaign objectives and tasks (max 500 words)" />
                                    <div className="text-xs text-neutral-500 mt-1">{description? description.trim().length ? Math.min(500, description.trim().split(/\s+/).length) : 0 : 0} / 500 words</div>
                                </div>

                                <div>
                                    <Label>Start date</Label>
                                    <Input type="date" value={startDate || ''} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <Label>End date</Label>
                                    <Input type="date" value={endDate || 0} onChange={(e) => setEndDate(e.target.value)} />
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
                                <Button className="w-full" onClick={handleCreateCampaign}>Create Campaign</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CampaignStatsModal 
                isOpen={campaingStatModalOpen}
                campaign={selectedCampaign} 
                onClose={onCloseCampaignStatModal} 
            />
            
             <TransactionModal
                isOpen={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                title="Create new campaign"
                description={`Setting up data for the new ${name} campaign on the blockchain`}
                getSteps={createTransactionSteps}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
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
