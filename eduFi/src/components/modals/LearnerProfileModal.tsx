/* eslint-disable */

"use client";

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Calendar, 
  Target,
  User2,
  UserCheck,
  CheckCircle,
  ExternalLink
} from "lucide-react";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Learner, Performance, ProofOfIntegration } from "../../../types";

interface LearnerProfileModalProps {
  learner: Learner;
  isOpen: boolean;
  onClose: () => void;
}

interface ProofOfAchievementProps {
  poi: ProofOfIntegration;
  index: number;
}

interface RatingProps {
  rating: Performance;
  index: number;
}

// Proof of Achievement Component
function ProofOfAchievement({ poi, index }: ProofOfAchievementProps) {
  const statusColor = poi.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  // const statusIcon = poi.verified ? CheckCircle : XCircle; 

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
                {poi.verified ? "Verified" : "Pending"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Score: {poi.score}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-500">
                  {new Date(Number(poi.approvedAt) * 1000).toLocaleDateString()}
                </span>
              </div>
              
              {poi.links && poi.links.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Submitted Links:</span>
                  </div>
                  <div className="space-y-1">
                    {poi.links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                        <a 
                          href={link.value} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                        >
                          {link.value}
                        </a>
                        <span className="text-xs text-gray-400">
                          {new Date(Number(link.submittedAt) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
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
                  {/* {new Date(Number(rating.ratedAt) * 1000).toLocaleDateString()} */}
                  { rating.ratedAt }
                </span>
              </div>      
              {/* {rating.comment && (
                <p className="text-sm text-gray-600 mt-2">
                  "{rating.comment}"
                </p>
              )} */}
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
    const verifiedPoints = learner.point.verified ? 1 : 0; // Verified proof of integrations. Points are verified when builder's score is greater than 0
    const totalProofs = learner.poass.length;
    const avgRating = learner.ratings.length > 0 
      ? learner.ratings.reduce((sum, rating) => sum + Number(rating.value), 0) / learner.ratings.length 
      : 0;
    const totalRatings = learner.ratings.length;

    return {
      totalScore,
      verifiedProofs: verifiedPoints,
      totalProofs,
      avgRating,
      totalRatings,
      verificationRate: totalProofs > 0 ? (verifiedPoints / totalProofs) * 100 : 0
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
            {/* { poi.isVerified? <UserCheck className={`${statusColor} h-4 w-4`} /> : <User2 />} */}
            {/* <ConnectButton /> */}
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Learner Header */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-bold flex-shrink-0">
                  {learner.id.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {learner.id.slice(0, 6)}...{learner.id.slice(-4)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 break-all">
                    Learner ID: {learner.id}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto sm:flex-col sm:items-end">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {learnerStats.totalScore} pts
                  </Badge>
                  <Badge className="text-xs sm:text-sm">
                    {learnerStats.avgRating.toFixed(1)}/5
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold truncate">{learnerStats.totalScore}</p>
                    <p className="text-xs text-gray-500 truncate">Total Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold truncate">{learnerStats.verifiedProofs}</p>
                    <p className="text-xs text-gray-500 truncate">Verified Proofs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold truncate">{learnerStats.totalProofs}</p>
                    <p className="text-xs text-gray-500 truncate">Total Proofs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold truncate">{learnerStats.totalRatings}</p>
                    <p className="text-xs text-gray-500 truncate">Ratings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
              {/* Proof of Integration */}
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Proof of Integration</h3>
                <ProofOfAchievement poi={learner.point} index={0} />
              </div>

              {/* Proof of Assimilation */}
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Proof of Assimilation</h3>
                {learner.poass.length > 0 ? (
                  <div className="space-y-3">
                    {learner.poass.map((poa, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Proof of Assimilation #{index + 1}</h4>
                          <Badge className="bg-blue-100 text-blue-800">
                            Completed
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Score: {poa.score}</p>
                          <p>Total Points: {poa.totalPoints}</p>
                          <p>Percentage: {poa.percentage}%</p>
                          <p>Time Spent: {poa.timeSpent} minutes</p>
                          <p>Completed: {new Date(Number(poa.completedAt) * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>
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
              </div>
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
