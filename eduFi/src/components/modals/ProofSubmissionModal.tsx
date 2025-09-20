"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract } from "wagmi";
import { Address, FunctionName } from "../../../types";
import TransactionModal, { TransactionStep } from "@/components/ui/TransactionModal";
import { X, Plus, Trash2, ExternalLink } from "lucide-react";

interface ProofSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignAddress: Address;
  epochData: any[];
}

export default function ProofSubmissionModal({ 
  isOpen, 
  onClose, 
  campaignAddress, 
  epochData 
}: ProofSubmissionModalProps) {
  const [links, setLinks] = useState<string[]>(["", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // Update link at specific index
  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  // Remove link at specific index
  const removeLink = (index: number) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      setLinks(newLinks);
    }
  };

  // Add new link (max 3)
  const addLink = () => {
    if (links.length < 3) {
      setLinks([...links, ""]);
    }
  };

  // Validate form
  const isValid = useMemo(() => {
    const filledLinks = links.filter(link => link.trim() !== "");
    return filledLinks.length > 0 && filledLinks.every(link => 
      link.startsWith("http://") || link.startsWith("https://")
    );
  }, [links]);

  // Prepare transaction data
  const transactionData = useMemo(() => {
    const validLinks = links.filter(link => link.trim() !== "");
    // Pad with empty strings to ensure array length is 3
    const paddedLinks = [...validLinks];
    while (paddedLinks.length < 3) {
      paddedLinks.push("");
    }
    
    return {
      functionName: 'submitProofOfIntegration' as FunctionName,
      contractAddress: campaignAddress,
      abi: [],
      args: [paddedLinks.slice(0, 3)] // Ensure exactly 3 strings
    };
  }, [links, campaignAddress]);

  // Create transaction steps
  const createTransactionSteps = (): TransactionStep[] => {
    return [{
      id: 'submit-proof',
      title: 'Submit Proof of Integration',
      description: 'Submitting your integration proof links to the blockchain',
      functionName: transactionData.functionName,
      contractAddress: transactionData.contractAddress,
      abi: transactionData.abi,
      args: transactionData.args
    }];
  };

  const handleSubmit = () => {
    if (!isValid) {
      setError("Please provide at least one valid URL");
      return;
    }
    
    setError(null);
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = () => {
    setShowTransactionModal(false);
    setLinks(["", "", ""]);
    onClose();
  };

  const handleTransactionError = (error: string) => {
    setError(error);
    setShowTransactionModal(false);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                Submit Proof of Integration
              </DialogTitle>
              <ConnectButton />
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integration Links</CardTitle>
                <p className="text-sm text-gray-600">
                  Submit up to 3 links that demonstrate your integration work. 
                  All links must be valid URLs starting with http:// or https://
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`link-${index}`}>
                        Link {index + 1}
                      </Label>
                      <Input
                        id={`link-${index}`}
                        type="url"
                        placeholder="https://example.com/your-integration"
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    {links.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLink(index)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {links.length < 3 && (
                  <Button
                    variant="outline"
                    onClick={addLink}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Link
                  </Button>
                )}

                <div className="text-sm text-gray-500">
                  {links.filter(link => link.trim() !== "").length} of 3 links provided
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isValid || !isConnected || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Proof"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          steps={createTransactionSteps()}
          onSuccess={handleTransactionSuccess}
          onError={handleTransactionError}
        />
      )}
    </>
  );
}
