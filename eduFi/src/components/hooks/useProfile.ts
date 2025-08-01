/* eslint-disable */

import { filterTransactionData, formatAddr, mockCampaign, mockClaimResult, mockProfile, mockReadProfile, mockWeekProfileData, toBN } from '../utilities';
import { useAccount, useChainId, useConfig, useReadContracts, useReconnect } from 'wagmi';
import { Address, Campaign, ClaimResult, Profile, WeekData, WeekProfileData } from '../../../types/quiz';
import { Hex, keccak256, stringToHex } from "viem";
import React from "react";
import useStorage from './useStorage';

type StateData = { readProfile: WeekProfileData[], claimables: ClaimResult[] }
export const toHash = (arg: string) => {
    return keccak256(stringToHex(arg));
}

export interface UseProfileType { inHash?: Hex, wkId?: number }
export interface ProfileReturnType {
    campaign: Campaign;
    profile: Profile;
    protocolReward: {
        erc20Amount: bigint;
        nativeAmount: bigint;
    };
    claimed: boolean;
    claimId: bigint;
    campaignHash: Hex;
    eligibility: ClaimResult;
    requestedWeekId: bigint;
    claimDeadline: number;
    totalPointsForACampaign: number;
    showVerificationButton: boolean;
    showWithdrawalButton: boolean;
    totalPointsInRequestedCampaign: bigint;
}

export const mockProfileReturn : ProfileReturnType = {
    showVerificationButton: false,
    showWithdrawalButton: false,
    profile: mockProfile,
    protocolReward: {
        erc20Amount: 0n,
        nativeAmount: 0n
    }, 
    claimDeadline: 0,
    eligibility: mockClaimResult,
    claimId: 0n,
    requestedWeekId: 0n,
    campaign: mockCampaign,
    campaignHash: toHash('solidity'),
    claimed: false,
    totalPointsForACampaign: 0,
    totalPointsInRequestedCampaign: 0n
}

 const formatData = (stateData: StateData, weekData: WeekData[], requestedWkId: number, requestedHash: Hex) : ProfileReturnType => {
    // const reqWeek = BigInt(requestedWkId);
    // if(stateData && stateData.claimables && stateData.claimables.length > 0 && )
    const claimables = stateData.claimables;
    const readProfile = stateData.readProfile;

    // Filter all the claimables you have for the requested week
    const eligibility = claimables?.filter(({weekId}) => toBN(weekId).toNumber() === requestedWkId)?.[0] || mockClaimResult;

    // Find the eligible campaign data for the requested week
    const { elgs, barred, isVerified, weekId: claimId, claimed } = eligibility;
    let showWithdrawalButton = false;
    elgs.forEach(({erc20Amount, nativeAmount, protocolVerified}) => {
        if((erc20Amount > 0n || nativeAmount > 0n) && protocolVerified  && !barred && isVerified && !claimed) showWithdrawalButton = true;
    });

    // Filter user profiles using the requestedWkId - Returns all the campaign profiles for that week
    const wkFound = readProfile?.filter((_, i) => i === requestedWkId)?.[0] || [mockWeekProfileData];

    // const filteredUserCampaigns = wkFound.campaigns;
    const filteredUser = wkFound.campaigns?.filter(({campaignHash}) => campaignHash.toLowerCase() == requestedHash.toLowerCase())?.[0] || mockReadProfile;

    const { eligibility: { protocolVerified, ...rest }, profile, campaignHash } = filteredUser;

    // Reward eligibility for the selected campaign. Soon as the week is sorted, users are eligible provided they 
    // have earned points. Sort however does not qualify for withdrawal unless users earned valid points and verify their idemtity. 
    const showVerificationButton = protocolVerified && rest?.erc20Amount > 0 && rest?.nativeAmount > 0n;
    
    // Total points earned in a campaign
    const totalUserPointsForACampaign = profile.quizResults.reduce((total, quizResult) => total + quizResult.other.score, 0);
    
    // Search for the dashboard and Stat requested campaign using the requested parameters
    const weekCampaigns = weekData.filter((_, i) => i === requestedWkId);
    const filtered = weekCampaigns?.[0]?.campaigns.filter(({hash_}) => hash_.toLowerCase() === requestedHash.toLowerCase());
    const generalCampaign = filtered?.[0] || mockCampaign;
    
    return {    
        protocolReward: { ...rest },
        campaign: generalCampaign,
        eligibility,
        claimId,
        requestedWeekId: BigInt(requestedWkId),
        totalPointsInRequestedCampaign: generalCampaign.totalPoints,
        claimDeadline: toBN(weekData?.[requestedWkId]?.claimDeadline?.toString() || '0').toNumber(),
        campaignHash,
        profile,
        showWithdrawalButton,
        showVerificationButton,
        totalPointsForACampaign: totalUserPointsForACampaign,
        claimed
    };
};

export default function useProfile(){
    const [ requestedWkId, setRequestedWeek ] = React.useState<number>(0);
    const [ requestedHash, setRequestedHash ] = React.useState<Hex>(mockReadProfile.campaignHash);
    const [ returnObj, setReturnObj ] = React.useState<ProfileReturnType>(mockProfileReturn);
    
    const chainId = useChainId();
    const config = useConfig();
    const { address, isConnected } = useAccount();
    const { reconnectAsync, connectors, isPending } = useReconnect();
    const { weekData } = useStorage();
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
    }, [chainId, account]);

    // Fetch the data 
    const { data, isFetching, refetch } = useReadContracts({
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

    // Can be used to request for latest data using the arg paramter based on requested Hash and the supplied requested week
    const setHash = (reqHash: Hex) => {
        if(reqHash !== requestedHash) setRequestedHash(reqHash);
    };
    
    // Can be used to request for latest data using the arg paramter based on weekId
    const setWeekId = (arg: number) => {
        if(arg !== requestedWkId) setRequestedWeek(arg);
    };

    React.useEffect(() => {
        const controller = new AbortController();
        let readProfile : WeekProfileData[] = [mockWeekProfileData];

        // A list of all campaigns that user subscribed to for all concluded weeks excluding the current week
        let claimables : ClaimResult[] = [mockClaimResult];

        if(data !== undefined && data.length > 0) {
            // User profile data in all campaigns for all the weeks
            readProfile = data[0].result as WeekProfileData[];

            // User's claim status for all campaigns that the user subscribed to.
            // Note: User's campaigns is always synced with the claim contract
            claimables = data[1].result as ClaimResult[];
            if(claimables && claimables.length === 0) claimables = [mockClaimResult];
        } else {
            if(!isFetching){
                const refresh = async() => {
                    if(!isConnected) {
                        if(!isPending) await reconnectAsync({connectors});
                    }
                    const result = await refetch();
                    if(result) {
                        readProfile = result?.data?.[0].result as WeekProfileData[];
                        claimables = result?.data?.[1].result as ClaimResult[];
                    }
                }
                refresh();
                return () => controller.abort();
            }
        }
        setReturnObj(
            formatData(
                {readProfile, claimables},
                weekData,
                requestedWkId,
                requestedHash
            )
        );
    }, [data, requestedHash, requestedWkId, weekData, isFetching, isConnected, refetch]);
 
    return { returnObj, setHash, setWeekId } 

}