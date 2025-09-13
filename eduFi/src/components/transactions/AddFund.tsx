"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { erc20Abi, parseUnits, isAddress, formatEther } from "viem";
import { filterTransactionData } from '../utilities';
import { Address } from '../../../types';
import TransactionModal, { TransactionStep } from '@/components/ui/TransactionModal';

type TokenInput = { 
  address: string; 
  symbol: string; 
  decimals: number; 
  amount: string; 
  validated?: boolean; 
  error?: string; 
  approved?: boolean 
};

interface AddFundProps {
  isOpen: boolean;
  onClose: () => void;
  campaignAddress: Address;
  campaignName: string;
}

export default function AddFund({ isOpen, onClose, campaignAddress, campaignName }: AddFundProps) {
  const { address, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  
  const [nativeAmount, setNativeAmount] = useState<string>("");
  const [tokens, setTokens] = useState<TokenInput[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { contractAddresses } = useMemo(() => 
    filterTransactionData({ chainId, filter: false }), 
    [chainId]
  );

  const addToken = () => {
    setTokens(prev => [...prev, { 
      address: "", 
      symbol: "", 
      decimals: 18, 
      amount: "", 
      validated: false, 
      approved: false 
    }]);
  };

  const removeToken = (idx: number) => {
    setTokens(prev => prev.filter((_, i) => i !== idx));
  };

  const updateToken = (idx: number, patch: Partial<TokenInput>) => {
    setTokens(prev => prev.map((tk, i) => i === idx ? { ...tk, ...patch } : tk));
  };

  const autofillTokenMeta = async (idx: number, tokenAddress: string) => {
    try {
      if (!publicClient || !tokenAddress) return;
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
      updateToken(idx, { symbol, decimals, validated: true, error: undefined });
    } catch (e) {
      updateToken(idx, { 
        error: 'Failed to fetch token metadata. Please verify the address.', 
        validated: false 
      });
    }
  };

  const approveToken = async (idx: number) => {
    const tk = tokens[idx];
    if (!tk.address || !tk.amount || !tk.validated || tk.approved) return;
    
    try {
      const amount = parseUnits(tk.amount, tk.decimals);
      await writeContractAsync({
        address: tk.address as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [campaignAddress, amount],
      });
      updateToken(idx, { approved: true });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const createTransactionSteps = (): TransactionStep[] => {
    const steps: TransactionStep[] = [];
    
    // Add native funding step if amount is provided
    if (nativeAmount && parseFloat(nativeAmount) > 0) {
      steps.push({
        id: 'native-fund',
        title: 'Add Native Funding',
        description: `Adding ${nativeAmount} CELO to campaign`,
        functionName: 'addFund' as any,
        contractAddress: campaignAddress,
        abi: [], // Will be filled with actual ABI
        args: [parseUnits(nativeAmount, 18)],
        value: parseUnits(nativeAmount, 18),
      });
    }

    // Add ERC20 funding steps for approved tokens
    tokens.forEach((tk, idx) => {
      if (tk.approved && tk.amount && parseFloat(tk.amount) > 0) {
        steps.push({
          id: `erc20-fund-${idx}`,
          title: `Add ${tk.symbol} Funding`,
          description: `Adding ${tk.amount} ${tk.symbol} to campaign`,
          functionName: 'addFund' as any,
          contractAddress: campaignAddress,
          abi: [], // Will be filled with actual ABI
          args: [tk.address, parseUnits(tk.amount, tk.decimals)],
        });
      }
    });

    return steps;
  };

  const handleAddFunds = () => {
    const steps = createTransactionSteps();
    if (steps.length === 0) {
      alert('Please add at least one funding source');
      return;
    }
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = (txHash: string) => {
    console.log('Funding transaction successful:', txHash);
    onClose();
    // Reset form
    setNativeAmount("");
    setTokens([]);
  };

  const handleTransactionError = (error: Error) => {
    console.error('Funding transaction failed:', error);
  };

  const hasValidFunding = (nativeAmount && parseFloat(nativeAmount) > 0) || 
    tokens.some(tk => tk.approved && tk.amount && parseFloat(tk.amount) > 0);

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
                      disabled={tokens.some(t => t.validated && !t.approved)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Token
                    </Button>
                  </div>

                  {tokens.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No ERC20 tokens added yet
                    </div>
                  )}

                  {tokens.map((tk, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="md:col-span-4">
                        <Label className="text-xs">Token Address</Label>
                        <Input
                          placeholder="0x..."
                          value={tk.address}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateToken(idx, { address: val });
                            if (!val) {
                              updateToken(idx, { validated: false, error: undefined });
                              return;
                            }
                            if (isAddress(val)) {
                              updateToken(idx, { validated: true, error: undefined });
                              autofillTokenMeta(idx, val);
                            } else {
                              updateToken(idx, { 
                                validated: false, 
                                error: 'Invalid Ethereum address' 
                              });
                            }
                          }}
                          className={tk.error ? "border-red-500" : ""}
                        />
                        {tk.error && (
                          <div className="text-xs text-red-500 mt-1">{tk.error}</div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs">Symbol</Label>
                        <Input
                          placeholder="USDC"
                          value={tk.symbol}
                          onChange={(e) => updateToken(idx, { symbol: e.target.value })}
                          disabled
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs">Decimals</Label>
                        <Input
                          type="number"
                          placeholder="18"
                          value={tk.decimals}
                          onChange={(e) => updateToken(idx, { decimals: Number(e.target.value || 0) })}
                          disabled
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          placeholder="1000"
                          value={tk.amount}
                          onChange={(e) => updateToken(idx, { amount: e.target.value })}
                          type="number"
                          step="0.000001"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end gap-1">
                        {tk.validated && !tk.approved && (
                          <Button
                            size="sm"
                            onClick={() => approveToken(idx)}
                            disabled={isPending}
                            className="bg-primary-500 text-black hover:bg-primary-400"
                          >
                            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                          </Button>
                        )}
                        {tk.approved && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Approved</span>
                          </div>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeToken(idx)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {tokens.some(t => t.validated && !t.approved) && (
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
        onClose={() => setShowTransactionModal(false)}
        title="Adding Funds to Campaign"
        description="Please confirm the transactions to add funds to your campaign"
        steps={createTransactionSteps()}
        onSuccess={handleTransactionSuccess}
        onError={handleTransactionError}
      />
    </>
  );
}
