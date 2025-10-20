"use client";
/* eslint-disable */
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { Address, FunctionName } from "../../../types";

const CONFIMATION_BLOCK = 2;

export interface TransactionStep {
  id: string;
  title: string;
  description: string;
  functionName: FunctionName;
  contractAddress: Address;
  abi: any[];
  args: any[];
  value?: bigint;
}

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  getSteps: () => TransactionStep[];
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export default function TransactionModal({
  isOpen,
  onClose,
  title,
  description,
  getSteps,
  onSuccess,
  onError,
}: TransactionModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [failedSteps, setFailedSteps] = useState<Set<string>>(new Set());
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const config = useConfig()

  const steps = getSteps();
  const currentStep = steps[currentStepIndex];
  const isCompleted = completedSteps.has(currentStep.id);
  const isFailed = failedSteps.has(currentStep.id);
  const isLastStep = currentStepIndex === steps.length - 1;

  const waitForConfirmation = async(hash: `0x${string}`) => {
    const receipt = await waitForTransactionReceipt(config, {hash, confirmations: CONFIMATION_BLOCK});
    return receipt.transactionHash;
  } 

  const executeStep = async (step: TransactionStep) => {
    try {
      setIsProcessing(true);
      let hash = await writeContractAsync({
        address: step.contractAddress,
        abi: step.abi,
        functionName: step.functionName,
        args: step.args,
        value: step.value,
      });
      hash = await waitForConfirmation(hash);
      setTxHashes(prev => ({ ...prev, [step.id]: hash }));
      setCompletedSteps(prev => new Set([...prev, step.id]));
      
      if (isLastStep) {
        onSuccess?.(hash);
        setTimeout(() => {
          onClose();
          resetModal();
        }, 2000);
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    } catch (error) {
      setFailedSteps(prev => new Set([...prev, step.id]));
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setFailedSteps(new Set());
    setTxHashes({});
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      resetModal();
    }
  };

  const getStepStatus = (stepId: string, index: number) => {
    if (completedSteps.has(stepId)) return "completed";
    if (failedSteps.has(stepId)) return "failed";
    if (index === currentStepIndex) return "current";
    if (index < currentStepIndex) return "completed";
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "current":
        return <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case "current":
        return <Badge className="bg-primary-100 text-primary-800 border-primary-200">Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-surface">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id, index);
              return (
                <Card key={step.id} className={`border ${
                  status === "current" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : 
                  status === "completed" ? "border-green-500 bg-green-50 dark:bg-green-900/20" :
                  status === "failed" ? "border-red-500 bg-red-50 dark:bg-red-900/20" :
                  "border-gray-200 dark:border-gray-700"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {step.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status)}
                        {txHashes[step.id] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://explorer.celo.org/tx/${txHashes[step.id]}`, '_blank')}
                            className="gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="border-neutral-700 text-gray-900 dark:text-white dark:border-gray-600"
            >
              {isCompleted ? "Close" : "Cancel"}
            </Button>
            {!isCompleted && !isFailed && (
              <Button
                onClick={() => executeStep(currentStep)}
                disabled={isProcessing}
                className="bg-primary-500 text-black hover:bg-primary-400"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  isLastStep ? "Complete" : "Next Step"
                )}
              </Button>
            )}
            {isFailed && (
              <Button
                onClick={() => {
                  setFailedSteps(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentStep.id);
                    return newSet;
                  });
                  executeStep(currentStep);
                }}
                className="bg-primary-500 text-black hover:bg-primary-400"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
