/* eslint-disable */

import { filterTransactionData, formatAddr, mockCampaign, mockEligibility, mockProfile, mockReadProfile } from '../utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import { Address, Campaign, CampaignDatum, Eligibility, Profile, ReadProfile, WeekData } from '../../../types/quiz';
import { Hex, keccak256, stringToHex, zeroAddress } from "viem";
import React from "react";
import useStorage from './useStorage';

export const toHash = (arg: string) => {
    return keccak256(stringToHex(arg));
}

export interface UseProfileType { inHash: Hex, wkId: number }
export interface ProfileReturnType {
    profile: Profile;
    claimable: Eligibility;
    claimed: boolean;
    campaign: Campaign;
    campaignHash: Hex;
    campaignDatum: CampaignDatum;
    totalPointsForACampaign: number;
    showVerificationButton: boolean;
    showWithdrawalButton: boolean;
}

export const mockProfileReturn : ProfileReturnType = {
    showVerificationButton: false,
    showWithdrawalButton: false,
    profile: mockProfile,
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
    campaignDatum: {
        campaignHash: toHash('solidity'),
        campaign: 'solidity',
    },
    claimed: false,
    campaign: mockCampaign,
    totalPointsForACampaign: 0
}

 const getReturnObj = (arg: {requestedHash: Hex, weekData: WeekData[], campaignData:CampaignDatum[], requestedWkId: number, readProfile: ReadProfile, eligibility: Eligibility, claimable: Eligibility}) : ProfileReturnType => {
    const { readProfile, eligibility, weekData, campaignData, claimable, requestedHash, requestedWkId } = arg;
    // Reward eligibility for the selected campaign. Soon as the week is sorted, users are eligible provided they 
    // have earned points. Sort however does not qualify for withdrawal unless users earned valid points and verify their idemtity. 
    const sorted = eligibility.canClaim;

    // Reward claim criteria. To show withdrawal button, user must have been verified
    const showWithdrawalButton = claimable.isVerified && !claimable.isClaimed;

    // Eligibility criteria. To show verification button user must have earned points, week sorted, and have not claim for this campaign
    const { other: { claimed, amountClaimedInERC20, amountClaimedInNative }, quizResults } = readProfile.profile;
    const showVerificationButton = !claimed && (amountClaimedInERC20 > 0n || amountClaimedInNative > 0n) && sorted;

    // Total points earned in a campaign
    const totalPointsForACampaign = quizResults.reduce((total, quizResult) => total + quizResult.other.score, 0);
    
    // Search campaign campaignData 
    const fcd = campaignData.filter(({campaignHash}) => campaignHash.toLowerCase() === requestedHash.toLowerCase());
    const cmd : CampaignDatum = fcd[0] || mockProfileReturn.campaignDatum;

    // Search campaign
    const filteredWk = weekData?.[requestedWkId]?.campaigns?.filter(({hash_}) => hash_.toLowerCase() === requestedHash.toLowerCase());
    const foundCampaign = filteredWk[0] || mockCampaign;
    
    return {
        claimable,
        campaignHash: readProfile.campaignHash,
        profile: readProfile.profile,
        campaign: foundCampaign,
        campaignDatum: cmd,
        showWithdrawalButton,
        showVerificationButton,
        totalPointsForACampaign,
        claimed: claimed && claimable.isClaimed
    };

};

export default function useProfile({ inHash, wkId }: UseProfileType){
    const [firstRead, setRead] = React.useState<boolean>(false);
    const [requestedHash, setCampaignHash] = React.useState<Hex>(inHash);
    const [requestedWkId, setRequestedId] = React.useState<number>(wkId);
    const [returnObj, setReturnObj] = React.useState<ProfileReturnType>(mockProfileReturn);

    const chainId = useChainId();
    const config = useConfig();
    const { address, isConnected } = useAccount();
    const account = formatAddr(address);
    const { campaignData, callback, weekId, weekData } = useStorage();

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
            functionNames: ['getProfile', 'checkEligibility', 'getClaimable'],
            callback
        });
        const readArgs = [[account, weekId, requestedHash], [account, requestedHash], [requestedHash, account]];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: item.contractAddress as Address,
                args: readArgs[i]
            }
        });
        return { readTxObject }
    }, [chainId, callback, account, weekId, requestedHash]);

    // Fetch the data 
    const { data, refetch } = useReadContracts({
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

    // Update the campaignHash in state whenever the inHash or requested weekId changes
    React.useEffect(() => {
        if(!firstRead) {
            if(data && data.length > 0){
                const readProfile = data[0]?.result as ReadProfile ?? mockReadProfile;
                const eligibility = data[1]?.result as Eligibility ?? mockEligibility;
                const claimable = data[2]?.result as Eligibility?? mockEligibility;
        
                const res = getReturnObj({
                    campaignData,
                    claimable,
                    eligibility,
                    readProfile,
                    requestedHash,
                    requestedWkId,
                    weekData
                });
        
                setReturnObj(res);
                setRead(true);
            }
        }
    }, [firstRead, data]);
 
    // Update the campaignHash in state whenever the inHash or requested weekId changes
    React.useEffect(() => {
        if(requestedHash !== inHash) setCampaignHash(inHash);
        if(requestedWkId !== wkId) setRequestedId(wkId);
    }, [inHash, wkId]);
   
    // Update the campaignHash in state whenever the inHash or requested weekId changes
    React.useEffect(() => {
        const controller = new AbortController();
        if(requestedWkId !== wkId || inHash !== requestedHash){
            const refresh = async() => {
                const res = await refetch();
                const readProfile = res?.data?.[0]?.result as ReadProfile ?? mockReadProfile;
                const eligibility = res?.data?.[1]?.result as Eligibility ?? mockEligibility;
                const claimable = res?.data?.[2]?.result as Eligibility?? mockEligibility;
                const returnObj_ = getReturnObj({
                    campaignData,
                    claimable,
                    eligibility,
                    readProfile,
                    requestedHash,
                    requestedWkId,
                    weekData
                });
        
                setReturnObj(returnObj_);
            }
            refresh();
            return () => controller.abort();
        }
    }, [inHash, wkId, campaignData, weekData, requestedWkId, requestedHash]);

 
    return { ...returnObj } 

}