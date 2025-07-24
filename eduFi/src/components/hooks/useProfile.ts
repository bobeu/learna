/* eslint-disable */

import { filterTransactionData, formatAddr, mockCampaign, mockEligibility, mockProfile, mockReadProfile, mockWeekProfileData, toBN } from '../utilities';
import { useAccount, useChainId, useConfig, useReadContracts, useReconnect } from 'wagmi';
import { Address, Campaign, Eligibility, Profile, ReadProfile, WeekData, WeekProfileData } from '../../../types/quiz';
import { Hex, keccak256, stringToHex, zeroAddress } from "viem";
import React from "react";
import useStorage from './useStorage';

type StateData = { readProfile: WeekProfileData[], claimables: Eligibility[] }
export const toHash = (arg: string) => {
    return keccak256(stringToHex(arg));
}

export interface UseProfileType { inHash?: Hex, wkId?: number }
export interface ProfileReturnType {
    campaign: Campaign;
    profile: Profile;
    claimable: Eligibility;
    claimed: boolean;
    campaignSlot: number;
    campaignHash: Hex;
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
    claimDeadline: 0,
    campaignSlot: 0,
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
    totalPointsForACampaign: 0,
    totalPointsInRequestedCampaign: 0n
}

 const formatData = (stateData: StateData, weekData: WeekData[], requestedWkId: number, requestedHash: Hex) : ProfileReturnType => {
    // const reqWeek = BigInt(requestedWkId);
    const claimables = stateData.claimables;
    const readProfile = stateData.readProfile;
    const wkFound = readProfile.filter((_, i) => i === requestedWkId);
    const filteredUserCampaigns = wkFound?.[0]?.campaigns || [mockReadProfile];
    // const filteredUser = filteredUserCampaigns.filter(({campaignHash}) => campaignHash.toLowerCase() == requestedHash.toLowerCase());
    let campaignSlot = 0;
    let userCampaign: ReadProfile = mockReadProfile;
    filteredUserCampaigns.forEach((found, index) => {
        if(found?.campaignHash.toLowerCase() == requestedHash.toLowerCase()) {
            campaignSlot = index;
            userCampaign = found;
        }
    });

    console.log("filteredUserCampaigns", filteredUserCampaigns);
    console.log("campaignSlot", campaignSlot);
    if(campaignSlot === filteredUserCampaigns.length) campaignSlot -= 1;
    console.log("campaignSlotAfter", campaignSlot);
    // const userCampaign = filteredUser?.[0] || mockReadProfile;

    // Reward eligibility for the selected campaign. Soon as the week is sorted, users are eligible provided they 
    // have earned points. Sort however does not qualify for withdrawal unless users earned valid points and verify their idemtity. 
    const sorted = userCampaign.eligibility.canClaim;
    
    // Search for the corresponding claimable data using the requested  hash 
    const claimable_ = claimables.filter(({campaignHash}) => campaignHash.toLowerCase() === requestedHash.toLowerCase());
    const claimable = claimable_?.[0] || mockEligibility;

    // Reward claim criteria. To show withdrawal button, user must have been verified
    const showWithdrawalButton = claimable.isVerified && !claimable.isClaimed;

    // Eligibility criteria. To show verification button user must have earned points, week sorted, and have not claim for this campaign
    const { other: { claimed }, quizResults,} = userCampaign.profile;
    const showVerificationButton = !claimed && (userCampaign.eligibility.erc20Amount > 0n || userCampaign.eligibility.nativeAmount > 0n) && sorted;

    // Total points earned in a campaign
    const totalUserPointsForACampaign = quizResults.reduce((total, quizResult) => total + quizResult.other.score, 0);
    
    // Search for the campaign using the requested parameters
    const weekCampaigns = weekData.filter((_, i) => i === requestedWkId);
    const filtered = weekCampaigns?.[0]?.campaigns.filter(({hash_}) => hash_.toLowerCase() === requestedHash.toLowerCase());
    const generalCampaign = filtered?.[0] || mockCampaign;
    return {    
        campaign: generalCampaign,
        claimable,
        campaignSlot,
        totalPointsInRequestedCampaign: generalCampaign.totalPoints,
        claimDeadline: toBN(weekData?.[requestedWkId]?.claimDeadline?.toString() || '0').toNumber(),
        campaignHash: userCampaign.campaignHash,
        profile: userCampaign.profile,
        showWithdrawalButton,
        showVerificationButton,
        totalPointsForACampaign: totalUserPointsForACampaign,
        claimed: claimed && claimable.isClaimed
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
        let claimables : Eligibility[] = [mockEligibility];
        if(data) {
            // User profile data in all campaigns for all the weeks
            readProfile = data?.[0].result as WeekProfileData[];

            // User's claim status for all campaigns that the user subscribed to.
            // Note: User's campaigns is always synced with the claim contract
            claimables = data?.[1].result as Eligibility[];
        } else {
            if(!isFetching){
                const refresh = async() => {
                    if(!isConnected) {
                        if(!isPending) await reconnectAsync({connectors});
                    }
                    const result = await refetch();
                    if(result) {
                        readProfile = result?.data?.[0].result as WeekProfileData[];
                        claimables = result?.data?.[1].result as Eligibility[];
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