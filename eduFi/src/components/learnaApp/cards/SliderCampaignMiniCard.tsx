/**
 * SliderCampaignMiniCard Component
 * 
 * Compact card for Hero section slider - half the size of original
 * Styled similar to CampaignCompactCard but optimized for hero slider
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { CampaignStateProps } from '../../../../types';
import { normalizeImageSrc } from '../../utilities';

// Compact card specifically for the hero slider - half the original size
export default function SliderCampaignMiniCard({ campaign, onJoin }: { campaign: CampaignStateProps; onJoin: (campaign: CampaignStateProps) => void }) {
    const timeLeft = Math.max(0, campaign.endDate.getTime() - Date.now());
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    
    return(
        <div
            className="relative w-full h-full min-h-[90px] sm:min-h-[110px] md:min-h-[125px] rounded-lg sm:rounded-xl overflow-hidden border border-neutral-800 dark:border-neutral-700 bg-white dark:bg-surface hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            onClick={() => onJoin(campaign)}
        >
            <div className="flex h-full">
                {/* Image Section - Smaller */}
                <div className="relative w-20 sm:w-24 h-full flex-shrink-0">
                    <Image 
                        src={normalizeImageSrc(campaign.image)} 
                        alt={campaign.name} 
                        fill 
                        className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                    <div className="absolute top-1.5 left-1.5">
                        <Badge className="bg-primary-500 text-black text-[10px] px-1.5 py-0.5 h-5">
                            {campaign.status === 'active' ? 'Active' : campaign.status === 'completed' ? 'Completed' : 'Featured'}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-2 sm:p-2.5 flex flex-col justify-between min-w-0">
                    <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                            {campaign.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
                            {campaign.description}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-1 mt-1.5 text-[10px]">
                        <div className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{daysLeft > 0 ? `${daysLeft}d` : 'End'}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <DollarSign className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                            <span className="truncate">{parseFloat(campaign.fundingAmount).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{campaign.participants}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}