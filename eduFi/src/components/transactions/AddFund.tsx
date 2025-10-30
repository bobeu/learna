"use client";
/* eslint-disable */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, CheckCircle } from "lucide-react";
import { useWriteContract, usePublicClient, useAccount, useConfig } from "wagmi";
import { erc20Abi, parseUnits, isAddress, zeroAddress } from "viem";
import { Address, FunctionName, RewardType } from '../../../types';
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';
import { filterTransactionData } from '../utilities';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TokenInput = { 
  address?: string; 
  symbol: string; 
  decimals: number; 
  rewardType?: RewardType;
  amount?: string; 
  validated?: boolean; 
  error?: string; 
  approved?: boolean 
};

const defaultTokenInput : TokenInput = { 
  address: zeroAddress, 
  symbol: "", 
  decimals: 18, 
  amount: "", 
  validated: false, 
  approved: false,
  rewardType: RewardType.POASS
}

interface AddFundProps {
  isOpen: boolean;
  onClose: () => void;
  campaignAddress: Address;
  campaignName: string;
  campaignIndex: bigint;
}

export default function AddFund({ isOpen, onClose, campaignAddress, campaignName, campaignIndex }: AddFundProps) {
  const { chainId } = useAccount();
  const config = useConfig();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient({chainId, config});
  
  const [nativeAmount, setNativeAmount] = useState<string>("");
  const [token, setToken] = useState<TokenInput | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToken = () => {
    setToken(defaultTokenInput);
  };

  const removeToken = () => {
    setToken(null);
  };

  const autofillTokenMeta = async (tokenAddress: string) => {
    try {
      if (!publicClient || tokenAddress === '') return;
      const [symbol, decimals] = await Promise.all([
        publicClient.readContract({ 
          address: tokenAddress as `0x${string}`, 
          abi: erc20Abi, 
          functionName: 'symbol' 
        }) as Promise<string>,
        publicClient.readContract({ 
          address: tokenAddress as `0x${string}`, 
          abi: erc20Abi, 
          functionName: 'decimals' 
        }) as Promise<number>,
      ]);
      setToken({ symbol, decimals, validated: true, error: undefined, address: tokenAddress, amount: '0' });
    } catch (e) {
      setToken({
        ...defaultTokenInput,
          error: 'Failed to fetch token metadata. Please verify the address.', 
          validated: false
      });
    }
  };

  const approveToken = async () => {
    const tk = token;
    if (!tk || !tk.address || !tk.amount || !tk.validated || tk.approved) return;
    
    try {
      const amount = parseUnits(tk.amount, tk.decimals);
      await writeContractAsync({
        address: tk.address as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [campaignAddress, amount],
      });
      setToken({...token, approved: true });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const createTransactionSteps = (): TransactionStep[] => {
    const steps: TransactionStep[] = [];
    const { transactionData: td } = filterTransactionData({chainId, functionNames: ['addFund'], filter: true});
    
    if(token && token.rewardType) {
      // Add native funding step if amount is provided
      if(nativeAmount && parseFloat(nativeAmount) > 0) {
        steps.push({
          id: 'native-fund',
          title: 'Add Native Funding',
          description: `Adding ${nativeAmount} CELO reward to campaign`,
          functionName: td[0].functionName as FunctionName,
          contractAddress: td[0].contractAddress as Address,
          abi: td[0].abi,
          args: [zeroAddress, token?.rewardType, campaignIndex],
          value: parseUnits(nativeAmount, 18),
        });
      }

      // Add ERC20 funding steps for approved tokens
      if(token.address !==  zeroAddress && token.approved && token.amount && parseFloat(token.amount) > 0) {
        steps.push({
          id: `erc20-fund-2`,
          title: `Add ${token.symbol} Funding`,
          description: `Adding ${token.amount} ${token.symbol} to campaign`,
          functionName: 'addFund' as any,
          contractAddress: campaignAddress,
          abi: td[0].abi,
          args: [token.address, token.rewardType, parseUnits(token.amount, token.decimals)],
        });
      }
    }

    return steps;
  };

  const handleAddFunds = () => {
    const steps = createTransactionSteps();
    if (steps.length === 0) {
      alert('Please add at least one funding source');
      return;
    }
    setIsProcessing(true);
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = (txHash: string) => {
    console.log('Funding transaction successful:', txHash);
    onClose();
    // Reset form
    setNativeAmount("");
    setToken(null);
  };

  const handleTransactionError = (error: Error) => {
    console.error('Funding transaction failed:', error);
  };

  const hasValidFunding = (nativeAmount && parseFloat(nativeAmount) > 0) || 
    (token && token.approved && token.amount && parseFloat(token.amount) > 0);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-white dark:bg-surface">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Add Funds to {campaignName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Reward Type Selection */}
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Reward Type</Label>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="max-w-sm">
                    <Select
                      onValueChange={(val) => {
                        const selected = val === 'POASS' ? RewardType.POASS : RewardType.POINT;
                        if (token) {
                          setToken({ ...token, rewardType: selected });
                        } else {
                          setToken({ ...defaultTokenInput, rewardType: selected });
                        }
                      }}
                      defaultValue={token?.rewardType === RewardType.POINT ? 'POINT' : 'POASS'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select reward type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="POASS">Proof of Assimilation (POASS)</SelectItem>
                          <SelectItem value="POINT">Proof of Integration (POINT)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Native Funding */}
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Native CELO Amount</Label>
                    <Badge variant="outline">Native</Badge>
                  </div>
                  <Input
                    placeholder="0.0"
                    value={nativeAmount}
                    onChange={(e) => setNativeAmount(e.target.value)}
                    type="number"
                    step="0.000001"
                  />
                  {nativeAmount && parseFloat(nativeAmount) > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      Ready to add {nativeAmount} CELO
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ERC20 Tokens */}
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">ERC20 Tokens</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addToken}
                      className="gap-2"
                      disabled={token !== null && token.validated && !token.approved}
                    >
                      <Plus className="w-4 h-4" />
                      Add Token
                    </Button>
                  </div>

                  {!token && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No ERC20 tokens added yet
                    </div>
                  )}

                  {token && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="md:col-span-4">
                        <Label className="text-xs">Token Address</Label>
                        <Input
                          placeholder="0x..."
                          value={token.address}
                          onChange={
                            (e) => {
                              const val = e.target.value;
                              setToken({...token, address: val });
                            if(!val) {
                              setToken({...token, validated: false, error: undefined });
                              return;
                            }
                            if(isAddress(val)) {
                              setToken({ ...token, validated: true, error: undefined });
                              autofillTokenMeta(val);
                            } else {
                              setToken({ 
                                ...token,
                                validated: false, 
                                error: 'Invalid Ethereum address' 
                              });
                            }
                          }}
                          className={token.error ? "border-red-500" : ""}
                        />
                        {token.error && (
                          <div className="text-xs text-red-500 mt-1">{token.error}</div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs">Symbol</Label>
                        <Input
                          placeholder="USDC"
                          value={token.symbol}
                          onChange={(e) => setToken({ ...token, symbol: e.target.value })}
                          disabled
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs">Decimals</Label>
                        <Input
                          type="number"
                          placeholder="18"
                          value={token.decimals}
                          onChange={(e) => setToken({ ...token, decimals: Number(e.target.value || 0) })}
                          disabled
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          placeholder="1000"
                          value={token.amount}
                          onChange={(e) => setToken({  ...token, amount: e.target.value })}
                          type="number"
                          step="0.000001"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end gap-1">
                        {token.validated && !token.approved && (
                          <Button
                            size="sm"
                            onClick={() => approveToken()}
                            disabled={isPending}
                            className="bg-primary-500 text-black hover:bg-primary-400"
                          >
                            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                          </Button>
                        )}
                        {token.approved && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Approved</span>
                          </div>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeToken()}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {(token && token.validated && !token.approved) && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      Please approve tokens before adding funds
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFunds}
                disabled={!hasValidFunding || isProcessing}
                className="bg-primary-500 text-black hover:bg-primary-400"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Add Funds"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setIsProcessing(false);
        }}
        title="Adding Funds to Campaign"
        description="Please confirm the transactions to add funds to your campaign"
        getSteps={createTransactionSteps}
        onSuccess={handleTransactionSuccess}
        onError={handleTransactionError}
      />
    </>
  );
}
