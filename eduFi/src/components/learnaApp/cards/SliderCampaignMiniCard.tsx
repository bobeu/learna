import { Badge } from 'lucide-react';
import Image from 'next/image';
import { CampaignStateProps } from '../../../../types';
import { normalizeImageSrc } from '../../utilities';

// Compact card specifically for the hero slider
export default function SliderCampaignMiniCard({ campaign, onJoin }: { campaign: CampaignStateProps; onJoin: (campaign: CampaignStateProps) => void }) {
    return(
        <div
            className="relative w-full h-full min-h-[180px] sm:min-h-[220px] md:min-h-[250px] rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/40 hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => onJoin(campaign)}
        >
            <Image src={normalizeImageSrc(campaign.image)} alt={campaign.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                <div className="mb-1.5 sm:mb-2">
                <Badge className="bg-primary-500 text-black text-xs sm:text-sm">{campaign.status}</Badge>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">{campaign.name}</h3>
            </div>
        </div>
    );
}