import React from 'react';
import { Clock, Users, DollarSign, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignStateProps } from '../../../../types';

// Reusable uniform card for non-hero grids
export default function CampaignSliderCard({ campaign, onJoin }: { campaign: CampaignStateProps; onJoin: (campaign: CampaignStateProps) => void }) {
    const timeLeft = Math.max(0, campaign.endDate.getTime() - Date.now());
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
    return (
      <Card className="w-full h-[400px] hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-surface" onClick={() => onJoin(campaign)}>
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            {/* <Image
              src={campaign.image}
              alt={campaign.name}
              fill
              className="object-cover rounded-t-lg"
            /> */}
            <div className="absolute top-4 right-4">
              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                {campaign.status === 'active' ? 'Active' : campaign.status === 'completed' ? 'Completed' : 'Featured'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-xl mb-2 truncate">{campaign.name}</CardTitle>
          <CardDescription className="mb-4 truncate">{campaign.description}</CardDescription>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>{campaign.fundingAmount} CELO</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{campaign.participants} participants</span>
            </div>
          </div>
          
          <Button className={`w-full mt-4 dark:text-primary-800 `} onClick={(e) => {
            e.stopPropagation();
            onJoin(campaign);
          }}>
            Join Campaign
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
};