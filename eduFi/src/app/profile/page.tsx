"use client";
/* eslint-disable */
import React, { useContext, useMemo, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { DataContext } from "@/components/StorageContextProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatEther } from "viem";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  Plus, 
  ChevronUp, 
  Calendar, 
  WandSparkles, 
  Loader2, 
  ArrowLeft, 
  Moon, 
  Sun,
} from "lucide-react";
import CampaignMetaEditor from "@/components/profile/CampaignMetaEditor";
import AddFund from "@/components/transactions/AddFund";
import BuilderRewards from "@/components/profile/BuilderRewards";
import TransactionModal, { TransactionStep } from "@/components/ui/TransactionModal";
import ProofSubmissionModal from "@/components/modals/ProofSubmissionModal";
import BuilderApprovalModal from "@/components/modals/BuilderApprovalModal";
import { mockCampaignTemplateReadData, Address, CreateCampaignInput, FunctionName } from "../../../types";
import { formatAddr, } from "@/components/utilities";
import useStorage from "@/components/hooks/useStorage";
import { zeroAddress } from "viem";
import Image from "next/image";

export default function ProfilePage() {
  const { address } = useAccount();
  const data = useContext(DataContext);
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const userAddress = formatAddr(address).toLowerCase();
  const campaignsData = useMemo(() => {
    return (data?.campaignsData || [mockCampaignTemplateReadData]);
  }, [data]);

  const { creatorCampaigns, builderCampaigns } = useMemo(() => {
    const creator = campaignsData.filter((c) => c.owner.toLowerCase() === userAddress);
    const builder = campaignsData.filter((c) => {
      const anyLearner = c.epochData?.some((e) => e.learners?.some((l) => l.id.toLowerCase() === userAddress));
      return anyLearner;
    });
    return { creatorCampaigns: creator, builderCampaigns: builder };
  }, [campaignsData, userAddress]);

  const [selectedForEdit, setSelectedForEdit] = useState<number | null>(null);
  const [selectedForFund, setSelectedForFund] = useState<number | null>(null);
  
  // Campaign creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [ipfsUploading, setIpfsUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showProofSubmission, setShowProofSubmission] = useState(false);
  const [selectedCampaignForProof, setSelectedCampaignForProof] = useState<Address | null>(null);
  const [showBuilderApproval, setShowBuilderApproval] = useState(false);
  const [selectedCampaignForApproval, setSelectedCampaignForApproval] = useState<Address | null>(null);
  
  // Form fields
  const [name, setName] = useState<string>("");
  const [docUrl, setDocUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUri, setImageUri] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [endInHours, setEndInHours] = useState<number | null>(null);
  // const [useAiImage, setUseAiImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { creatorCampaigns: myCampaigns } = useStorage();

  // Check if user came from "Create campaign" button
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateForm(true);
    }
  }, [searchParams]);

  // Calculate total TVL from epoch data
  const totalTVL = useMemo(() => {
    return myCampaigns.reduce((total, campaign) => {
      const campaignTVL = campaign.epochData.reduce((epochTotal, epoch) => {
        const nativeAmount = epoch.setting.funds.nativeAss + epoch.setting.funds.nativeInt;
        const erc20Amount = epoch.setting.funds.erc20Ass.reduce((sum, token) => sum + Number(token.amount), 0) +
                           epoch.setting.funds.erc20Int.reduce((sum, token) => sum + Number(token.amount), 0);
        return epochTotal + Number(nativeAmount) + erc20Amount;
      }, 0);
      return total + campaignTVL;
    }, 0);
  }, [myCampaigns]);

  // Calculate end date in hours
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end.getTime() - start.getTime();
      let diffInHours = 0;
      if(diff > 0)  diffInHours = Math.ceil(diff / (1000 * 60 * 60));
      setEndInHours(diffInHours);
    }
  }, [startDate, endDate]);

  // Form validation
  const isFormValid = name && description && startDate && endDate && imageUri;
  const argReady = isFormValid;

  // Transaction data preparation
  const transactionInfo = useMemo(() => {
    if (!argReady) return null;
    let startTimestamp = 0;
    let endTimestamp = 0;
    let endDateInHr = 0;
    const startDateInNum = new Date(startDate).getTime();
    const endDateInNum = new Date(endDate).getTime();
    if(startDateInNum > 0) startTimestamp = Math.floor(startDateInNum / 1000);
    if(endDateInNum > 0) endTimestamp = Math.floor(endDateInNum / 1000);
    
    const createCampaignInput: CreateCampaignInput = {
      name: name,
      link: docUrl || "https://learna.vercel.app",
      description: description,
      imageUrl: imageUri,
      endDateInHr: endDateInHr,
    };

    return {
      functionName: 'createCampaign' as FunctionName,
      contractAddress: process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS as Address,
      abi: [],
      args: [createCampaignInput],
    };
  }, [name, docUrl, description, imageUri, startDate, endDate, argReady]);

  // Image upload functions
  const uploadToIpfs = async (file: File) => {
    setIpfsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload-to-ipfs', { method: 'POST', body });
      const data = await res.json();
      if (data?.uri) {
        setImageUri(data.uri);
        const local = URL.createObjectURL(file);
        setImagePreview(local);
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
    } finally {
      setIpfsUploading(false);
    }
  };

  // Generate image using AI
  const generateAiImage = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/generate-image', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ prompt: `Generate a modern campaign cover image for ${name}. ${description}` }) 
      });
      const data = await res.json();
      if (data?.uri) {
        setImageUri(data.uri);
        setImagePreview(data.uri);
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  // Transaction handling
  const createTransactionSteps = (): TransactionStep[] => {
    const data = transactionInfo;
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
      functionName: data.functionName,
      contractAddress: data.contractAddress,
      abi: data.abi,
      args: data.args
    }];
  };

  const handleCreateCampaign = () => {
    const steps = createTransactionSteps();
    if (steps.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = (txHash: string) => {
    console.log('Campaign created successfully:', txHash);
    setShowTransactionModal(false);
    setShowCreateForm(false);
    // Reset form
    setName("");
    setDocUrl("");
    setDescription("");
    setImageUri("");
    setStartDate("");
    setEndDate("");
    setImagePreview("");
  };

  const handleTransactionError = (error: Error) => {
    console.error('Failed to create campaign:', error);
    // Keep form open for user to retry
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white text-gray-900 dark:bg-blackish dark:text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" className={`gap-2 ${isDark ? 'text-white border-neutral-700' : ''}`}>
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </Button>
              </Link>
              <div className="text-center flex-1">
                <h1 className="text-3xl md:text-4xl font-bold">Your Profile</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage your campaigns and participation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle theme">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <ConnectButton />
            </div>
          </div>
        </div>

        {/* Campaign Creation Toggle */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto"
            variant={showCreateForm ? "outline" : "default"}
          >
            {showCreateForm ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Campaign Creation Form
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create New Campaign
              </>
            )}
          </Button>
        </div>

        {/* Campaign Creation Form */}
        {showCreateForm && (
          <Card className="mb-8 border-neutral-200 dark:border-neutral-800 dark:bg-surface">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Create New Campaign</CardTitle>
              <p className="text-sm text-gray-500">Fill in the details to create your learning campaign</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter campaign name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docUrl">Documentation URL</Label>
                  <Input
                    id="docUrl"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://docs.example.com"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your campaign..."
                  className="w-full min-h-[100px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500">{description.length}/500 characters</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {endInHours && (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Campaign duration: {endInHours} hours ({Math.ceil(endInHours / 24)} days)
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label>Campaign Image *</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadToIpfs(file);
                      }}
                      className="w-full"
                      disabled={ipfsUploading}
                    />
                    {ipfsUploading && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading to IPFS...
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateAiImage}
                    disabled={!name || !description || aiGenerating}
                    className="gap-2"
                  >
                    {aiGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <WandSparkles className="w-4 h-4" />
                    )}
                    {aiGenerating ? 'Generating...' : 'AI Generate'}
                  </Button>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <Image
                      src={imagePreview}
                      alt="Campaign preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview("");
                        setImageUri("");
                      }}
                      className="mt-2"
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  // onClick={handleCreateCampaign}
                  disabled={!isFormValid}
                  className="flex-1"
                >
                  Create Campaign
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="creator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="creator">Creator</TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="creator" className="space-y-6">
            {creatorCampaigns.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-600 dark:text-gray-300">
                  No campaigns found. <Link href="/campaigns/new" className="underline">Create one</Link>.
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorCampaigns.map((c, idx) => (
                <Card key={idx} className="bg-white dark:bg-surface">
                  <CardHeader>
                    <CardTitle className="truncate">{c.metadata.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      <div className="truncate">Link: {c.metadata.link}</div>
                      <div className="truncate">Image: {c.metadata.imageUrl}</div>
                      <div className="truncate">Ends: {c.metadata.endDate ? new Date(c.metadata.endDate * 1000).toLocaleString() : "Not set"}</div>
                      <div className="truncate">Epoches: {c.epoches?.toString?.() || 0}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {/* <Button variant="outline" className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600" onClick={() => setSelectedForEdit(idx)}>Edit metadata</Button>
                        <Button variant="outline" className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600" onClick={() => setSelectedForFund(idx)}>Add funds</Button> */}
                        <Link href={{ pathname: "/profile/view", query: { i: idx.toString() } }}>
                          <Button className="bg-primary-500 text-black hover:bg-primary-400">View</Button>
                        </Link>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => {
                          setSelectedCampaignForApproval(c.contractAddress);
                          setShowBuilderApproval(true);
                        }}
                      >
                        Review Builder Submissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedForEdit !== null && creatorCampaigns[selectedForEdit] && (
              <CampaignMetaEditor 
                metadata={creatorCampaigns[selectedForEdit].metadata}
                onClose={() => setSelectedForEdit(null)}
              />
            )}

            {selectedForFund !== null && creatorCampaigns[selectedForFund] && (
              <AddFund
                isOpen={true}
                onClose={() => setSelectedForFund(null)}
                campaignAddress={creatorCampaigns[selectedForFund].owner} // This should be the campaign identifier
                campaignName={creatorCampaigns[selectedForFund].metadata.name}
              />
            )}
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            {builderCampaigns.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-600 dark:text-gray-300">
                  You haven&apos;t subscribed to any campaigns yet.
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {builderCampaigns.map((c, idx) => {
                const latest = c.epochData?.[c.epochData.length - 1];
                const nativeTotal = latest ? (latest.setting.funds.nativeAss + latest.setting.funds.nativeInt) : 0n;
                const learners = latest?.learners || [];
                const userLearnerData = learners.find((l) => l.id.toLowerCase() === userAddress);
                
                return (
                  <div key={idx} className="space-y-4">
                    <Card className="bg-white dark:bg-surface">
                      <CardHeader>
                        <CardTitle className="truncate">{c.metadata.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-gray-700 dark:text-gray-200">
                          <div className="truncate">Ends: {c.metadata.endDate ? new Date(c.metadata.endDate * 1000).toLocaleString() : "Not set"}</div>
                          <div className="truncate">Funding (native): {nativeTotal ? Number(formatEther(nativeTotal)).toFixed(2) : "0"}</div>
                          <div className="truncate">Total Learners: {learners.length}</div>
                        </div>
                        <div className="space-y-2">
                          <Link href={{ pathname: "/profile/view", query: { i: idx.toString(), role: "builder" } }}>
                            <Button className="w-full bg-primary-500 text-black hover:bg-primary-400">View Details</Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              setSelectedCampaignForProof(c.contractAddress);
                              setShowProofSubmission(true);
                            }}
                          >
                            Submit Proof of Integration
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {userLearnerData && (
                      <BuilderRewards 
                        campaign={c} 
                        learnerData={userLearnerData} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          title="Create new campaign"
          description={`Setting up data for the new ${name} campaign on the blockchain`}
          getSteps={createTransactionSteps}
          onSuccess={handleTransactionSuccess}
          onError={handleTransactionError}
        />

        {/* Proof Submission Modal */}
        {selectedCampaignForProof && (
          <ProofSubmissionModal
            isOpen={showProofSubmission}
            onClose={() => {
              setShowProofSubmission(false);
              setSelectedCampaignForProof(null);
            }}
            campaignAddress={selectedCampaignForProof}
            epochData={campaignsData.find(c => c.contractAddress === selectedCampaignForProof)?.epochData || []}
          />
        )}

        {/* Builder Approval Modal */}
        {selectedCampaignForApproval && (
          <BuilderApprovalModal
            isOpen={showBuilderApproval}
            onClose={() => {
              setShowBuilderApproval(false);
              setSelectedCampaignForApproval(null);
            }}
            campaignAddress={selectedCampaignForApproval}
            learners={campaignsData.find(c => c.contractAddress === selectedCampaignForApproval)?.epochData?.[0]?.learners || []}
            epoch={BigInt(campaignsData.find(c => c.contractAddress === selectedCampaignForApproval)?.epochData?.[0]?.setting?.endDate || 0n)}
          />
        )}
      </div>
    </div>
  );
}


