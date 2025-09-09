/* eslint-disable */

import React from 'react';
import { Clock, Award, ChevronRight, LucideUsers2, } from 'lucide-react';
import { Campaign, Address } from '../../../types';
import { filterTransactionData, getTimeFromEpoch } from '../utilities';
import AddressWrapper from '../peripherals/AddressFormatter/AddressWrapper';
import { useChainId } from 'wagmi';

interface QuizCardProps {
  campaign: Campaign;
  campaignName: string;
  onSelect: () => void;
}

export const CampaignCard: React.FC<QuizCardProps> = ({campaignName, campaign, onSelect }) => {
    const { activeLearners, lastUpdated, totalPoints, operator, token, fundsERC20, fundsNative } = campaign.data;
    const chainId = useChainId();
    const { contractAddresses: ca} = filterTransactionData({chainId, filter: false});
    const GrowToken = ca.PlatformToken as Address;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
        case 'green': return 'bg-green-100 text-green-800 border-green-200';
        case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'purple': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div 
        onClick={onSelect}
        className="glass-card rounded-2xl p-6 hover:border-white/40 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:scale-105 animate-fade-in"
        >
        {/* Campaign Image */}
            <div className="w-full h-32 mb-4 rounded-xl overflow-hidden">
                <img 
                    src={`/assets/${campaignName}.png`} 
                    alt={campaignName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
            </div>

        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize group-hover:text-gradient transition-all duration-300">
                    {campaignName}
                </h3>
                <div className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    <h3>Transition Date</h3>
                    <h3>{getTimeFromEpoch(0)}</h3>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all ml-4 flex-shrink-0" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor('purple')}`}>
                <h3>Operator</h3>
                <AddressWrapper 
                    account={operator}
                    display={false}
                    size={4}
                />
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <h3>Funded in</h3>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    { fundsERC20 > 0n && <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">{ token.toLowerCase() === GrowToken.toLowerCase()? 'GROW' : 'CUSD' }</span> }
                    { fundsNative > 0n && <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">CELO</span> }
                </div>
            </div>
        </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-1 ${getDifficultyColor('yellow')}`}>
                        <Award className="w-4 h-4" />
                        <span>All points {totalPoints} pts</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getDifficultyColor('purple')}`}>
                        <Clock className="w-4 h-4" />
                        <span>Last updated at { getTimeFromEpoch(lastUpdated)}</span>
                    </div>
                </div>
                <div className={`flex items-center space-x-1 ${getDifficultyColor('green')}`}>
                    <LucideUsers2 className="w-4 h-4" />
                    <span>Learners {activeLearners.toString()} </span>
                </div>
            </div>

            <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-brand-gradient h-2 rounded-full transition-all duration-700 group-hover:w-full"
                    style={{ width: '0%' }}
                />
            </div>
        </div>
    );
};