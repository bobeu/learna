/* eslint-disable */

import { filterTransactionData, formatAddr, mockCampaign, mockEligibility, mockProfile, mockWeekProfileData, toBN } from '../utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import { Address, Campaign, Eligibility, Profile, WeekProfileData } from '../../../types/quiz';
import { Hex, keccak256, stringToHex, zeroAddress } from "viem";
import React from "react";
import useStorage from './useStorage';

export const toHash = (arg: string) => {
    return keccak256(stringToHex(arg));
}

export interface UseProfileType { inHash?: Hex, wkId?: number }
export interface ProfileReturnType {
    campaign: Campaign;
    profile: Profile;
    claimable: Eligibility;
    claimed: boolean;
    campaignHash: Hex;
    claimDeadline: number;
    totalPointsForACampaign: number;
    showVerificationButton: boolean;
    showWithdrawalButton: boolean;
}

export const mockProfileReturn : ProfileReturnType = {
    showVerificationButton: false,
    showWithdrawalButton: false,
    profile: mockProfile,
    claimDeadline: 0,
    campaign: mockCampaign,
    campaignHash: toHash('solidity'),
    claimable: {
        campaignHash: toHash('solidity'),
        canClaim: false,
        erc20Amount: 0n,
        isClaimed: false,
        isVerified: false,
        nativeAmount: 0n,
        token: zeroAddress,
        weekId: 0n
    },
    claimed: false,
    totalPointsForACampaign: 0
}

export default function useProfile(){
    const { callback, wkId: weekId, weekData } = useStorage();

    const chainId = useChainId();
    const config = useConfig();
    const { address, isConnected } = useAccount();
    const account = formatAddr(address);

    /**
     * @dev Fetches the profile for the connected account for all the campaigns in the current week
     * It also fetches the claim eligibility for the same week. This can be used in any of the components inside 
     * this app. 
     * @notice 'getProfile' fetches the profile for the connected account based on the weekId parsed
     *         'checkEligibility' Fetches reward eligibility data for thepast week since a week must end before users can be eiligible to see what they earn..
     *         'getClaimable' Gets the withdrawable amount for the past week 
     */
    const { readTxObject } = React.useMemo(() => {
        const { transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getProfile', 'getClaimable'],
            callback
        });
        const readArgs = [[account], [account]];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: item.contractAddress as Address,
                args: readArgs[i]
            }
        });
        return { readTxObject }
    }, [chainId, callback, account, weekId]);

    // Fetch the data 
    const { data } = useReadContracts({
        config,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 4000,
            refetchOnMount: 'always',
        }
    });

    // Tracks the read result
    const { readProfile, claimables }  = React.useMemo(() => {
        // User profile data in all campaigns for all the weeks
        const readProfile = data?.[0]?.result as WeekProfileData[] ?? [mockWeekProfileData];

        // User's claim status for all campaigns that the user subscribed to.
        // Note: User's campaigns is always synced with the claim contract
        const claimables = data?.[1]?.result as Eligibility[]?? [mockEligibility];

        return { readProfile, claimables }
    }, [data]);

    const getReturnObj = React.useCallback(({ requestedHash, requestedWkId} : {requestedHash: Hex, requestedWkId: number}) : ProfileReturnType => {
        const reqWeek = BigInt(requestedWkId);
        // User's subscribed campaign profile for the requested week and campaignHash
        const userCampaign = readProfile.filter(q => q.weekId === reqWeek)?.[0]
        .campaigns.filter(h => h.campaignHash.toLowerCase() == requestedHash.toLowerCase())?.[0];

        // Reward eligibility for the selected campaign. Soon as the week is sorted, users are eligible provided they 
        // have earned points. Sort however does not qualify for withdrawal unless users earned valid points and verify their idemtity. 
        const sorted = userCampaign.eligibility.canClaim;

        // Search for the corresponding claimable data using the requested  hash 
        const claimable = claimables.filter(({campaignHash}) => campaignHash.toLowerCase() === requestedHash.toLowerCase())?.[0]?? mockEligibility;

        // Reward claim criteria. To show withdrawal button, user must have been verified
        const showWithdrawalButton = claimable.isVerified && !claimable.isClaimed;

        // Eligibility criteria. To show verification button user must have earned points, week sorted, and have not claim for this campaign
        const { other: { claimed }, quizResults } = userCampaign.profile;
        const showVerificationButton = !claimed && (userCampaign.eligibility.erc20Amount > 0n || userCampaign.eligibility.nativeAmount > 0n) && sorted;

        // Total points earned in a campaign
        const totalPointsForACampaign = quizResults.reduce((total, quizResult) => total + quizResult.other.score, 0);
        
        // Search for the campaign using the requested parameters
        const campaigns = weekData.find(q => q.weekId === reqWeek)?.campaigns?? [mockCampaign];

        return {
            campaign: campaigns[0],
            claimable,
            claimDeadline: toBN(weekData?.[requestedWkId]?.claimDeadline?.toString() || '0').toNumber(),
            campaignHash: userCampaign.campaignHash,
            profile: userCampaign.profile,
            showWithdrawalButton,
            showVerificationButton,
            totalPointsForACampaign,
            claimed: claimed && claimable.isClaimed
        };

    }, [readProfile, claimables])
 
    return { getReturnObj } 

}