import { Badge } from 'lucide-react';
import Image from 'next/image';

// Compact card specifically for the hero slider
export default function SliderCampaignMiniCard({ campaign, onJoin }: { campaign: any; onJoin: (campaign: any) => void }) {
    return(
        <div
            className="relative min-w-[250px] max-w-[180px] h-[150px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/40 hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => onJoin(campaign)}
        >
            {/* <Image src={campaign.image} alt={campaign.name} fill className="object-cover" /> */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
                <div className="mb-1">
                <Badge className="bg-primary-500 text-black">{campaign.status}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-white truncate">{campaign.name}</h3>
            </div>
        </div>
    );
}