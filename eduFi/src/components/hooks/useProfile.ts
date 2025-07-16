import { filterTransactionData, formatAddr, mockCampaign, mockEligibility, mockProfile, mockReadProfile } from '../utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import { Address, Campaign, CampaignDatum, Eligibility, QuizResultOuput, ReadProfile } from '../../../types/quiz';
import { Hex, keccak256, stringToHex } from "viem";
import React from "react";
import useStorage from './useStorage';

export interface ProfileReturnType {
    amountClaimedInERC20: bigint;
    amountClaimedInNative: bigint;
    amountMinted: bigint;
    passKey: Hex;
    totalQuizPerWeek: number;
    claimed: boolean;
    campaign: Campaign;
    campaignDatum: CampaignDatum;
    haskey: boolean;
    quizResults: QuizResultOuput[];
    isElibigleToClaimForTheWeek: boolean;
    disableClaimButton: boolean;
    totalPointsForACampaign: number;
}

export const mockProfileReturn : ProfileReturnType = {
    amountClaimedInERC20: 0n,
    amountClaimedInNative: 0n,
    amountMinted: 0n,
    passKey: keccak256(stringToHex('user')),
    campaignDatum: {
        campaignHash: keccak256(stringToHex('solidity')),
        campaign: 'solidity',
    },
    totalQuizPerWeek: 0,
    claimed: false,
    campaign: mockCampaign,
    haskey: false,
    quizResults: [
        {
            answers: [
                {
                    isUserSelected: false,
                    questionHash: stringToHex('What is Solidity?'),
                    selected: 0
                }
            ], 
            other: {
                completedAt: stringToHex(new Date().toString()),
                percentage: 0,
                score: 0,
                timeSpent: 0,
                title: stringToHex('solidity'),
                totalPoints: 0,
                id: '', 
                quizId: ''
            }
        }
    ],
    isElibigleToClaimForTheWeek: false,
    disableClaimButton: false,
    totalPointsForACampaign: 0
}

export default function useProfile(){
    const chainId = useChainId();
    const config = useConfig();
    const { address, isConnected } = useAccount();
    const account = formatAddr(address);
    const { campaignHashes, campaignData, callback, wkId: wId, weekId, weekData } = useStorage();

    /**
     * @dev Fetches the profile for the connected account for all the campaigns in the current week
     * It also fetches the claim eligibility for the same week. This can be used in any of the components inside 
     * this app. 
     */
    const { readTxObject } = React.useMemo(() => {
        const { transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getProfile', 'checkEligibility'],
            callback
        });
        const readArgs = [[account, weekId, campaignHashes], [weekId, account, campaignHashes]];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: item.contractAddress as Address,
                args: readArgs[i]
            }
        });
        return { readTxObject }
    }, [chainId, callback, account, weekId, campaignHashes]);

    // Fetch the data 
    const { data: result } = useReadContracts({
        config,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
            refetchOnMount: 'always',
        }
    });
    
    
    /**
        *  @dev Return a single profile from a campaign
        *  @param hash : Campaign hash
        *  @returns : profile of type Profil. { See types/quiz.ts}
    */
   const getCampaignObj = React.useCallback((wkId: number = wId, requestedHash: Hex) => {
        const profiles = result?.[0]?.result as ReadProfile[] || [mockReadProfile];
        const eligibilities = result?.[1]?.result as Eligibility[] || mockEligibility;
        const filtered = profiles?.filter(({campaignHash}) => campaignHash.toLowerCase() === requestedHash.toLowerCase());
        const found = filtered?.[0]?.profile || mockProfile;
        const eligibleIndex = campaignHashes.indexOf(requestedHash); 
        const isElibigleToClaimForTheWeek = eligibilities[eligibleIndex]?.value || false;
        const { other: { claimed, haskey, amountClaimedInERC20, amountClaimedInNative, amountMinted, passKey, totalQuizPerWeek }, quizResults } = found;
        const disableClaimButton = claimed || !isElibigleToClaimForTheWeek;
        const totalPointsForACampaign = quizResults.reduce((total, quizResult) => total + quizResult.other.score, 0);
        let foundCampaign : Campaign = mockCampaign;
        let cmd : CampaignDatum =mockProfileReturn.campaignDatum;
        const fcd = campaignData.filter(({campaignHash}) => campaignHash.toLowerCase() === requestedHash.toLowerCase());
        if(fcd.length > 0) cmd = fcd[0];
        const fwd = weekData?.[wkId]?.campaigns?.filter(({hash_}) => hash_.toLowerCase() === requestedHash.toLowerCase());
        if(fwd && fwd.length > 0) foundCampaign = fwd[0];
       
        return {
           amountClaimedInERC20, 
           amountClaimedInNative, 
           amountMinted, 
           passKey: formatAddr(passKey), 
           totalQuizPerWeek,
           claimed, 
           campaign: foundCampaign,
           haskey,
           campaignDatum: cmd,
           quizResults,
           isElibigleToClaimForTheWeek,
           disableClaimButton,
           totalPointsForACampaign
       };

   }, [result, campaignHashes, weekData, campaignData, wId]);
 
    return { getCampaignObj }

}