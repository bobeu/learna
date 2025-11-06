/**
 * LearnerProfileDisplay Component
 * 
 * Non-modal version of learner profile for web display
 * Shows full learner profile in a card layout (not in a modal)
 */

"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Calendar, 
  Target,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Learner, Performance, ProofOfIntegration } from "../../../types";

interface LearnerProfileDisplayProps {
  learner: Learner | null;
  campaignName?: string;
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
  const statusColor = poi.verified ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";

  return (
    <Card className="hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
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
                <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Score: {poi.score}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(Number(poi.approvedAt) * 1000).toLocaleDateString()}
                </span>
              </div>
              
              {poi.links && poi.links.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted Links:</span>
                  </div>
                  <div className="space-y-1">
                    {poi.links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
                        <a 
                          href={link.value} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs"
                        >
                          {link.value}
                        </a>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
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
          : "text-gray-300 dark:text-gray-600"
      }`} 
    />
  ));

  return (
    <Card className="hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
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
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {rating.value}/5 stars
              </p>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {rating.ratedAt}
                </span>
              </div>      
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Learner Profile Display Component (Non-Modal)
export default function LearnerProfileDisplay({ learner, campaignName }: LearnerProfileDisplayProps) {
  const learnerStats = useMemo(() => {
    if (!learner) return null;

    const totalScore = learner.poass.reduce((sum, poa) => sum + Number(poa.score), 0);
    const verifiedPoints = learner.point.verified ? 1 : 0;
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

  if (!learner || !learnerStats) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
        No learner data available for this campaign.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Learner Header */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0">
              {learner.id.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                {learner.id.slice(0, 6)}...{learner.id.slice(-4)}
              </h3>
              {campaignName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {campaignName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto sm:flex-col sm:items-end">
              <Badge variant="secondary" className="text-xs">
                {learnerStats.totalScore} pts
              </Badge>
              <Badge className="text-xs">
                {learnerStats.avgRating.toFixed(1)}/5
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base font-bold truncate text-gray-900 dark:text-white">{learnerStats.totalScore}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Total Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base font-bold truncate text-gray-900 dark:text-white">{learnerStats.verifiedProofs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base font-bold truncate text-gray-900 dark:text-white">{learnerStats.totalProofs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Total Proofs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-base font-bold truncate text-gray-900 dark:text-white">{learnerStats.totalRatings}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-2">Verification Rate</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${learnerStats.verificationRate}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {learnerStats.verificationRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-2">Average Rating</h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${
                        i < Math.floor(learnerStats.avgRating)
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300 dark:text-gray-600"
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {learnerStats.avgRating.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Proofs and Ratings */}
      <Tabs defaultValue="proofs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8 text-xs">
          <TabsTrigger value="proofs" className="text-xs">
            Proofs ({learnerStats.totalProofs})
          </TabsTrigger>
          <TabsTrigger value="ratings" className="text-xs">
            Ratings ({learnerStats.totalRatings})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proofs" className="space-y-3 mt-3">
          {/* Proof of Integration */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white">Proof of Integration</h3>
            <ProofOfAchievement poi={learner.point} index={0} />
          </div>

          {/* Proof of Assimilation */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white">Proof of Assimilation</h3>
            {learner.poass.length > 0 ? (
              <div className="space-y-2">
                {learner.poass.map((poa, index) => (
                  <div key={index} className="p-3 border rounded-lg border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">Proof #{index + 1}</h4>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                        Completed
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Score: {poa.score}</p>
                      <p>Total: {poa.totalPoints}</p>
                      <p>Percentage: {poa.percentage}%</p>
                      <p>Time: {poa.timeSpent} min</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">No proofs yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-3 mt-3">
          {learner.ratings.length > 0 ? (
            <div className="space-y-2">
              {learner.ratings.map((rating, index) => (
                <Rating 
                  key={index} 
                  rating={rating} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">No ratings yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

