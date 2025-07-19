import { filterTransactionData, formatAddr, mockCampaign, mockEligibility, mockProfile, mockReadProfile } from '../utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import { Address, Campaign, CampaignDatum, Eligibility, Profile, ReadProfile } from '../../../types/quiz';
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
    campaignDatum: CampaignDatum;
    totalPointsForACampaign: number;
    showVerificationButton: boolean;
    showWithdrawalButton: boolean;
}

export const mockProfileReturn : ProfileReturnType = {
    showVerificationButton: false,
    showWithdrawalButton: false,
    profile: mockProfile,
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

export default function useProfile({ inHash, wkId }: UseProfileType){
    const [requestedHash, setCampaignHash] = React.useState<Hex>(inHash);
    const [requestedWkId, setRequestedId] = React.useState<number>(wkId);

    const chainId = useChainId();
    const config = useConfig();
    const { address, isConnected } = useAccount();
    const account = formatAddr(address);
    const { campaignHashes, campaignData, callback, weekId, weekData } = useStorage();

    /**
     * @dev Fetches the profile for the connected account for all the campaigns in the current week
     * It also fetches the claim eligibility for the same week. This can be used in any of the components inside 
     * this app. 
     */
    const { readTxObject } = React.useMemo(() => {
        const { transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getProfile', 'checkEligibility', 'getClaimable'],
            callback
        });
        const readArgs = [[account, weekId, campaignHashes], [weekId, account, campaignHashes], [requestedHash, account]];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: item.contractAddress as Address,
                args: readArgs[i]
            }
        });
        return { readTxObject }
    }, [chainId, callback, account, weekId, campaignHashes, requestedHash]);

    // Fetch the data 
    const { data: result, refetch } = useReadContracts({
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
    
    /**
        *  @dev Return a single profile from a campaign ne  , 
        *  @param hash : Campaign hash
        *  @returns : profile of type Profil. { See types/quiz.ts}
    */
   const getCampaignObj = React.useMemo(() : ProfileReturnType => {
        const profiles = result?.[0]?.result as ReadProfile[] || [mockReadProfile];
        const eligibilities = result?.[1]?.result as Eligibility[] || mockEligibility;

        // User profile for the selected campaign
        const filtered = profiles?.filter(({campaignHash}) => campaignHash.toLowerCase() === requestedHash.toLowerCase());
        const found = filtered?.[0]?.profile || mockProfile;

        //Reward eligibility for the selected campaign
        const eligibleIndex = campaignHashes.indexOf(requestedHash); 
        const sorted = eligibilities[eligibleIndex].canClaim;

        // Reward claim criteria
        const claim = result?.[2]?.result as Eligibility || mockEligibility;
        const showWithdrawalButton = claim.isVerified && !claim.isClaimed;

        // Eligibility criteria
        const { other: { claimed, amountClaimedInERC20, amountClaimedInNative }, quizResults } = found;
        const showVerificationButton = !claimed && (amountClaimedInERC20 > 0n || amountClaimedInNative > 0n) && sorted;

        // Total points earned in a campaign
        const totalPointsForACampaign = quizResults.reduce((total, quizResult) => total + quizResult.other.score, 0);
        
        // Search campaign campaignData 
        const fcd = campaignData.filter(({campaignHash}) => campaignHash.toLowerCase() === requestedHash.toLowerCase());
        const cmd : CampaignDatum = fcd[0] || mockProfileReturn.campaignDatum;

        // Search campaign
        const filteredWk = weekData?.[wkId]?.campaigns?.filter(({hash_}) => hash_.toLowerCase() === requestedHash.toLowerCase());
        const foundCampaign = filteredWk[0] || mockCampaign;
       
        return {
            claimable: claim,
            profile: found,
            campaign: foundCampaign,
            campaignDatum: cmd,
            showWithdrawalButton,
            showVerificationButton,
            totalPointsForACampaign,
            claimed: claimed && claim.isClaimed
       };

   }, [result, campaignHashes, requestedHash, weekData, campaignData, requestedWkId]);

    // Update the campaignHash in state whenever the inHash or requested weekId changes
    React.useEffect(() => {
        if(requestedHash !== inHash){
            setCampaignHash(inHash);
            refetch()
            .then(() => {
                console.log("Data refetched")
            })
        }

        if(requestedWkId !== wkId){
            setRequestedId(wkId);
            refetch()
            .then(() => {
                console.log("Data refetched");
            })
        }

    }, [inHash, refetch, wkId, requestedWkId, requestedHash]);

 
    return { ...getCampaignObj }

}