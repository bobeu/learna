"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {  
  AlertTriangle,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FormattedCampaignTemplate, EpochSettingInput, RewardType } from "../../../types";

interface CampaignSettingsModalProps {
  campaign: FormattedCampaignTemplate;
  isOpen: boolean;
  onClose: () => void;
}

interface TokenInputProps {
  tokenAddress: string;
  onTokenAddressChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

// Token Input Component
function TokenInput({ 
  tokenAddress, 
  onTokenAddressChange, 
  onRemove, 
  canRemove 
}: TokenInputProps) {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Label htmlFor="tokenAddress">Token Address</Label>
        <Input
          id="tokenAddress"
          value={tokenAddress}
          onChange={(e) => onTokenAddressChange(e.target.value)}
          placeholder="0x..."
          className="font-mono text-sm"
        />
      </div>
      {canRemove && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// Main Campaign Settings Modal Component
export default function CampaignSettingsModal({ campaign, isOpen, onClose }: CampaignSettingsModalProps) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Form state - using the correct EpochSettingInput type
  const [settings, setSettings] = useState<EpochSettingInput>({
    maxProof: campaign.epochData[0]?.setting.maxProof || 0,
    endInHr: 24, // Default to 24 hours
    tokens: [], // Array of token addresses
    newOperator: campaign.owner // Default to current owner
  });

  const [rewardType, setRewardType] = useState<RewardType>(RewardType.POASS);
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([""]);

  const isOwner = useMemo(() => {
    return address?.toLowerCase() === campaign.owner.toLowerCase();
  }, [address, campaign.owner]);

  const totalTokens = useMemo(() => {
    return settings.tokens.length + tokenAddresses.length;
  }, [settings.tokens.length, tokenAddresses.length]);

  const handleMaxProofChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      maxProof: parseInt(value) || 0
    }));
  };

  const handleEndInHrChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      endInHr: parseInt(value) || 24
    }));
  };

  const handleNewOperatorChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      newOperator: value as `0x${string}`
    }));
  };

  const handleTokenAddressChange = (index: number, value: string) => {
    setTokenAddresses(prev => prev.map((addr, i) => 
      i === index ? value : addr
    ));
  };

  const addTokenAddress = () => {
    if (totalTokens < 3) {
      setTokenAddresses(prev => [...prev, ""]);
    }
  };

  const removeTokenAddress = (index: number) => {
    setTokenAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!isOwner) return;

    try {
      // Filter out empty token addresses
      const validTokens = tokenAddresses.filter(addr => addr.trim() !== "");
      
      const updatedSettings: EpochSettingInput = {
        ...settings,
        tokens: [...settings.tokens, ...validTokens] as `0x${string}`[]
      };

      // Create contract args with proper types
      const contractArgs = {
        maxProof: BigInt(updatedSettings.maxProof),
        endInHr: BigInt(updatedSettings.endInHr),
        tokens: updatedSettings.tokens,
        newOperator: updatedSettings.newOperator
      };

      await writeContract({
        address: campaign.contractAddress as `0x${string}`,
        abi: [
          {
            name: "epochSetting",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "setting", type: "tuple", components: [
                { name: "maxProof", type: "uint256" },
                { name: "endInHr", type: "uint256" },
                { name: "tokens", type: "address[]" },
                { name: "newOperator", type: "address" }
              ]},
              { name: "rewardType", type: "uint8" }
            ],
            outputs: []
          }
        ],
        functionName: "epochSetting",
        args: [contractArgs as any, rewardType]
      });
    } catch (err) {
      console.error("Error updating campaign settings:", err);
    }
  };

  if (!isOwner) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-500">Only the campaign owner can modify settings.</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Campaign Settings
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Update your campaign configuration and funding
              </p>
            </div>
            {/* <ConnectButton /> */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning about token limit */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You can use a maximum of 3 tokens as funding tokens in your campaign. 
              Current total: {totalTokens} tokens.
            </AlertDescription>
          </Alert>

          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxProof">Max Proofs Per Day</Label>
                  <Input
                    id="maxProof"
                    type="number"
                    value={settings.maxProof}
                    onChange={(e) => handleMaxProofChange(e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="endInHr">End Date (Hours from now)</Label>
                  <Input
                    id="endInHr"
                    type="number"
                    value={settings.endInHr}
                    onChange={(e) => handleEndInHrChange(e.target.value)}
                    placeholder="24"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardType">Reward Type</Label>
                  <Select value={rewardType.toString()} onValueChange={(value) => setRewardType(Number(value) as RewardType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Proof of Achievement (POASS)</SelectItem>
                      <SelectItem value="1">Proof of Integration (POINT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newOperator">New Operator (Optional)</Label>
                  <Input
                    id="newOperator"
                    value={settings.newOperator}
                    onChange={(e) => handleNewOperatorChange(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Funding */}
          <Card>
            <CardHeader>
              <CardTitle>Token Funding</CardTitle>
              <p className="text-sm text-gray-500">
                Add up to 3 token addresses for campaign funding
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenAddresses.map((tokenAddress, index) => (
                <TokenInput
                  key={index}
                  tokenAddress={tokenAddress}
                  onTokenAddressChange={(value) => handleTokenAddressChange(index, value)}
                  onRemove={() => removeTokenAddress(index)}
                  canRemove={tokenAddresses.length > 1}
                />
              ))}
              
              {totalTokens < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTokenAddress}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Token Address
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Current Settings Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Settings Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Max Proofs Per Day:</span>
                  <span className="font-mono">{settings.maxProof}</span>
                </div>
                <div className="flex justify-between">
                  <span>End Date (Hours):</span>
                  <span className="font-mono">{settings.endInHr}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reward Type:</span>
                  <span className="font-mono">{rewardType === RewardType.POASS ? 'POASS' : 'POINT'}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Operator:</span>
                  <span className="font-mono text-xs">{settings.newOperator}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token Addresses:</span>
                  <span className="font-mono">{totalTokens}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Campaign settings updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isPending || isConfirming}
              className="min-w-[120px]"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? "Confirming..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}