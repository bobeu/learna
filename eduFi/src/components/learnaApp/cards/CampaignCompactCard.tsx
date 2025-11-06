/**
 * CampaignCompactCard Component
 * 
 * A compact version of the campaign card (1/3 the size of CampaignSliderCard)
 * Used in the learn page for displaying campaigns in a dense grid layout
 */

import React from 'react';
import { Clock, Users, DollarSign, ArrowRight, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignStateProps } from '../../../../types';
import { normalizeImageSrc } from '../../utilities';

interface CampaignCompactCardProps {
  campaign: CampaignStateProps;
  onJoin: (campaign: CampaignStateProps) => void;
  onViewStats?: (campaign: CampaignStateProps) => void;
  isUserCampaign?: boolean;
}

export default function CampaignCompactCard({ 
  campaign, 
  onJoin, 
  onViewStats,
  isUserCampaign = false 
}: CampaignCompactCardProps) {
  const timeLeft = Math.max(0, campaign.endDate.getTime() - Date.now());
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
  return (
    <Card 
      className={`w-full h-auto min-h-[120px] hover:shadow-md transition-all cursor-pointer bg-white dark:bg-surface flex flex-col ${
        isUserCampaign ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
      }`} 
      onClick={() => onJoin(campaign)}
    >
      <CardContent className="p-2 sm:p-3 flex flex-col h-full">
        {/* Image and Header */}
        <div className="flex gap-2 sm:gap-3 mb-2">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={normalizeImageSrc(campaign.image)}
              alt={campaign.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white flex-1">
                {campaign.name}
              </h3>
              <Badge 
                variant={campaign.status === 'active' ? 'default' : 'secondary'} 
                className="text-[10px] px-1.5 py-0.5 flex-shrink-0"
              >
                {campaign.status === 'active' ? 'Active' : campaign.status === 'completed' ? 'Completed' : 'Featured'}
              </Badge>
            </div>
            {isUserCampaign && (
              <Badge className="text-[10px] px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 border-primary-300 dark:border-primary-700">
                Your Campaign
              </Badge>
            )}
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
              {campaign.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0 text-gray-500" />
            <span className="truncate">{daysLeft > 0 ? `${daysLeft}d` : 'Ended'}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 flex-shrink-0 text-green-500" />
            <span className="truncate">{parseFloat(campaign.fundingAmount).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 flex-shrink-0 text-blue-500" />
            <span className="truncate">{campaign.participants}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            className={`flex-1 text-[10px] sm:text-xs h-7 sm:h-8 dark:text-primary-800 ${
              isUserCampaign ? 'bg-primary-500 hover:bg-primary-400' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onJoin(campaign);
            }}
          >
            {isUserCampaign ? 'Start' : 'Join'}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          {isUserCampaign && onViewStats && (
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 border-neutral-300 dark:border-neutral-700"
              onClick={(e) => {
                e.stopPropagation();
                onViewStats(campaign);
              }}
            >
              <BarChart3 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

