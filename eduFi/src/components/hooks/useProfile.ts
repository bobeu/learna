import React from 'react';
import useStorage from "./useStorage";
import { filterTransactionData, formatAddr, mockEligibility, mockReadProfile } from '../utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import { Address, Eligibility, ReadProfile } from '../../../types/quiz';

export default function useProfile({campaignHash} : {campaignHash?: Address}){
    const [readProfile, setReadProfile] = React.useState<ReadProfile>(mockReadProfile);
    const { weekId, campaignHashes, campaignData, callback } = useStorage();
    const chainId = useChainId();
    const config = useConfig();
    const { address, isConnected } = useAccount();
    const account = formatAddr(address);

    /**
     * @dev Fetches the profile for the connected account for all the campaigns in the current week
     * It also fetches the claim eligibility for the same week. This can be used in any of the components inside 
     * this app. 
     */
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

    // Fetch the data 
    const { data, refetch } = useReadContracts({
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

    React.useEffect(() => {
        if(campaignHash){
            refetch().then((result) => {
                const newProfilesData = result?.data?.[0]?.result as ReadProfile[] || [mockReadProfile];
                const filtered = newProfilesData.filter(({campaignHash: hash}) => hash.toLowerCase() === campaignHash.toLowerCase());
                if(filtered.length > 0) {
                    setReadProfile(filtered[0]);
                }
            })
        }
    }, [campaignHash]);
    
    /**
     * @dev Fetches a single profile from the list of readProfiles using a mapped campaignHash
     * @param campaignHash : Hash of a campaign e.g keccak256(bytes('solidity'))
     * @returns Formatted profile contents
     */
    const result = React.useMemo(() => {
        const profiles = data?.[0]?.result as ReadProfile[] || [mockReadProfile];
        const eligibilities = data?.[1]?.result as Eligibility[] || mockEligibility;
        const eligibleIndex = campaignHashes.indexOf(campaignHash || `0x${''}`); 
        const isElibigleToClaimForTheWeek = eligibilities[eligibleIndex]?.value || false;
        
        const { other: { claimed, haskey, ...rest }, quizResults } = readProfile.profile;
        const disableClaimButton = claimed || !haskey || !isElibigleToClaimForTheWeek;
        const totalPointsForACampaign = quizResults.reduce((total, quizResult) => total + quizResult.other.score, 0);
        const getCampaign = (hash_: Address) => {
            const filtered = campaignData.filter(({campaignHash: hash}) => hash.toLowerCase() === hash_.toLowerCase());
            return filtered?.[0]?.campaign || '';
        }
    
        return {
            getCampaign,
            profiles,
            eligibilities,
            ...rest,
            haskey,
            quizResults,
            disableClaimButton,
            totalPointsForACampaign,
            isElibigleToClaimForTheWeek
        }
    }, [data, campaignData, readProfile]);

    return { ...result }

}