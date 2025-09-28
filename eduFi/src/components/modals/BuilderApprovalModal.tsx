"use client";
/* eslint-disable */
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Address, FunctionName, ApproveIntegrationParams, Learner } from "../../../types";
import TransactionModal, { TransactionStep } from "@/components/ui/TransactionModal";
import { ExternalLink, CheckCircle, XCircle, Star } from "lucide-react";

interface BuilderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignAddress: Address;
  learners: Learner[];
  epoch: bigint;
}

export default function BuilderApprovalModal({ 
  isOpen, 
  onClose, 
  campaignAddress, 
  learners,
  epoch
}: BuilderApprovalModalProps) {
  const [selectedBuilders, setSelectedBuilders] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Map<string, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  const { isConnected } = useAccount();

  // Filter learners who have submitted proof of integration
  const buildersWithProof = useMemo(() => {
    return learners.filter(learner => 
      learner.point && 
      learner.point.links && 
      learner.point.links.length > 0
    );
  }, [learners]);

  // Toggle builder selection
  const toggleBuilder = (builderId: string) => {
    const newSelected = new Set(selectedBuilders);
    if (newSelected.has(builderId)) {
      newSelected.delete(builderId);
    } else {
      newSelected.add(builderId);
    }
    setSelectedBuilders(newSelected);
  };

  // Update score for a builder
  const updateScore = (builderId: string, score: number) => {
    const newScores = new Map(scores);
    newScores.set(builderId, Math.max(0, Math.min(100, score)));
    setScores(newScores);
  };

  // Prepare transaction data
  const transactionData = useMemo(() => {
    const targets: Address[] = [];
    const points: number[] = [];
    
    selectedBuilders.forEach(builderId => {
      targets.push(builderId as Address);
      points.push(scores.get(builderId) || 0);
    });

    return {
      functionName: 'approveIntegration' as FunctionName,
      contractAddress: campaignAddress,
      abi: [],
      args: [{ targets, points, epoch } as ApproveIntegrationParams]
    };
  }, [selectedBuilders, scores, campaignAddress, epoch]);

  // Create transaction steps
  const createTransactionSteps = (): TransactionStep[] => {
    return [{
      id: 'approve-integration',
      title: 'Approve Builder Integrations',
      description: `Approving ${selectedBuilders.size} builder integration submissions`,
      functionName: transactionData.functionName,
      contractAddress: transactionData.contractAddress,
      abi: transactionData.abi,
      args: transactionData.args
    }];
  };

  const handleApprove = () => {
    if (selectedBuilders.size === 0) {
      setError("Please select at least one builder to approve");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = () => {
    setShowTransactionModal(false);
    setIsSubmitting(false);
    setSelectedBuilders(new Set());
    setScores(new Map());
    onClose();
  };

  const handleTransactionError = (error: Error) => {
    setError(error.message || 'Unknown error');
    setIsSubmitting(false);
    setShowTransactionModal(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                Approve Builder Integrations
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

            {buildersWithProof.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-600">
                  No builders have submitted proof of integration yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {buildersWithProof.length} builder(s) have submitted integration proof
                </div>
                
                {buildersWithProof.map((builder) => (
                  <Card key={builder.id} className="border-2 border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Builder: {builder.id.slice(0, 6)}...{builder.id.slice(-4)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={selectedBuilders.has(builder.id) ? "default" : "outline"}>
                            {selectedBuilders.has(builder.id) ? "Selected" : "Not Selected"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBuilder(builder.id)}
                          >
                            {selectedBuilders.has(builder.id) ? "Deselect" : "Select"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Integration Links */}
                      <div>
                        <h4 className="font-medium mb-2">Submitted Links:</h4>
                        <div className="space-y-2">
                          {builder.point.links.map((link, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">#{index + 1}</span>
                              <a 
                                href={link.value} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate flex-1"
                              >
                                {link.value}
                              </a>
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Current Score */}
                      <div>
                        <h4 className="font-medium mb-2">Current Score: {builder.point.score}</h4>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${
                                i < Math.floor(builder.point.score / 20)
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Score Input (only if selected) */}
                      {selectedBuilders.has(builder.id) && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            New Score (0-100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={scores.get(builder.id) || builder.point.score}
                            onChange={(e) => updateScore(builder.id, parseInt(e.target.value) || 0)}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                      )}

                      {/* Verification Status */}
                      <div className="flex items-center gap-2">
                        {builder.point.verified ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-600 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-600 font-medium">Pending Verification</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={selectedBuilders.size === 0 || !isConnected || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Approving..." : `Approve ${selectedBuilders.size} Builder(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          getSteps={createTransactionSteps}
          onSuccess={handleTransactionSuccess}
          onError={handleTransactionError}
          description="Approving proofs of integrations"
          title="Approve proofs"
        />
      )}
    </>
  );
}
