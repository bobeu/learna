import React from 'react';
import { Clock, Users, DollarSign, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignStateProps } from '../../../../types';
import { normalizeImageSrc } from '../../utilities';

// Reusable uniform card for non-hero grids
export default function CampaignSliderCard({ campaign, onJoin, onViewStats }: { campaign: CampaignStateProps; onJoin: (campaign: CampaignStateProps) => void; onViewStats?: (campaign: CampaignStateProps) => void }) {
  const timeLeft = Math.max(0, campaign.endDate.getTime() - Date.now());
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
  return (
    <Card className="w-full h-auto min-h-[350px] sm:h-[400px] hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-surface flex flex-col" onClick={() => onJoin(campaign)}>
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative h-32 sm:h-40 w-full">
          <Image
            src={normalizeImageSrc(campaign.image)}
            alt={campaign.name}
            fill
            className="object-cover rounded-t-lg"
          />
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {campaign.status === 'active' ? 'Active' : campaign.status === 'completed' ? 'Completed' : 'Featured'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
        <CardTitle className="text-lg sm:text-xl mb-2 truncate">{campaign.name}</CardTitle>
        <CardDescription className="mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">{campaign.description}</CardDescription>
        <div className="space-y-2 sm:space-y-3 flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              <span className="truncate">{campaign.fundingAmount} CELO</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">{campaign.participants} participants</span>
          </div>
        </div>
          
        <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4 flex-shrink-0">
          <Button className={`w-full sm:flex-1 text-sm sm:text-base dark:text-primary-800`} onClick={(e) => {
            e.stopPropagation();
            onJoin(campaign);
          }}>
            Join Campaign
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          </Button>
          {onViewStats && (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewStats(campaign);
              }}
            >
              Stats
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};