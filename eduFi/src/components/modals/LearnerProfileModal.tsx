"use client";

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Trophy, 
  Star, 
  Calendar, 
  Award,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Learner } from "../../../types";
import { formatUnits } from "viem";

interface LearnerProfileModalProps {
  learner: Learner;
  isOpen: boolean;
  onClose: () => void;
}

interface ProofOfAchievementProps {
  poa: Learner['poass'][0];
  index: number;
}

interface RatingProps {
  rating: Learner['ratings'][0];
  index: number;
}

// Proof of Achievement Component
function ProofOfAchievement({ poa, index }: ProofOfAchievementProps) {
  const statusColor = poa.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  const statusIcon = poa.verified ? CheckCircle : XCircle;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                Proof #{index + 1}
              </Badge>
              <Badge className={`text-xs ${statusColor}`}>
                {poa.verified ? "Verified" : "Pending"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Score: {poa.score}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-500">
                  {new Date(Number(poa.timestamp) * 1000).toLocaleDateString()}
                </span>
              </div>
              
              {poa.link && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <a 
                    href={poa.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Proof
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Rating Component
function Rating({ rating, index }: RatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star 
      key={i} 
      className={`w-4 h-4 ${
        i < rating.value 
          ? "text-yellow-400 fill-current" 
          : "text-gray-300"
      }`} 
    />
  ));

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                Rating #{index + 1}
              </Badge>
              <div className="flex items-center gap-1">
                {stars}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {rating.value}/5 stars
              </p>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-500">
                  {new Date(Number(rating.timestamp) * 1000).toLocaleDateString()}
                </span>
              </div>
              
              {rating.comment && (
                <p className="text-sm text-gray-600 mt-2">
                  "{rating.comment}"
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Learner Profile Modal Component
export default function LearnerProfileModal({ learner, isOpen, onClose }: LearnerProfileModalProps) {
  const learnerStats = useMemo(() => {
    const totalScore = learner.poass.reduce((sum, poa) => sum + poa.score, 0);
    const verifiedProofs = learner.poass.filter(poa => poa.verified).length;
    const totalProofs = learner.poass.length;
    const avgRating = learner.ratings.length > 0 
      ? learner.ratings.reduce((sum, rating) => sum + rating.value, 0) / learner.ratings.length 
      : 0;
    const totalRatings = learner.ratings.length;

    return {
      totalScore,
      verifiedProofs,
      totalProofs,
      avgRating,
      totalRatings,
      verificationRate: totalProofs > 0 ? (verifiedProofs / totalProofs) * 100 : 0
    };
  }, [learner]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Learner Profile
            </DialogTitle>
            <ConnectButton />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Learner Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {learner.id.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {learner.id.slice(0, 6)}...{learner.id.slice(-4)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Learner ID: {learner.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {learnerStats.totalScore} pts
                    </Badge>
                    <Badge className="text-sm">
                      {learnerStats.avgRating.toFixed(1)}/5
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{learnerStats.totalScore}</p>
                    <p className="text-xs text-gray-500">Total Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{learnerStats.verifiedProofs}</p>
                    <p className="text-xs text-gray-500">Verified Proofs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{learnerStats.totalProofs}</p>
                    <p className="text-xs text-gray-500">Total Proofs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{learnerStats.totalRatings}</p>
                    <p className="text-xs text-gray-500">Ratings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Verification Rate</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${learnerStats.verificationRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {learnerStats.verificationRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Average Rating</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(learnerStats.avgRating)
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {learnerStats.avgRating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Proofs and Ratings */}
          <Tabs defaultValue="proofs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="proofs">
                Proofs of Achievement ({learnerStats.totalProofs})
              </TabsTrigger>
              <TabsTrigger value="ratings">
                Ratings ({learnerStats.totalRatings})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="proofs" className="space-y-4">
              {learner.poass.length > 0 ? (
                <div className="space-y-3">
                  {learner.poass.map((poa, index) => (
                    <ProofOfAchievement 
                      key={index} 
                      poa={poa} 
                      index={index} 
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No proofs of achievement yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ratings" className="space-y-4">
              {learner.ratings.length > 0 ? (
                <div className="space-y-3">
                  {learner.ratings.map((rating, index) => (
                    <Rating 
                      key={index} 
                      rating={rating} 
                      index={index} 
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No ratings yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
