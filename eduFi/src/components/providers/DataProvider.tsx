/* eslint-disable */
import { StorageContextProvider } from "../StorageContextProvider";
import React from 'react';
import { 
    CampaignTemplateReadData,
    FormattedCampaignTemplate,
    mockCampaignTemplateReadData,
    type Address, 
    type ReadData, 
} from '../../../types';
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import { zeroAddress } from 'viem';
import { 
    filterTransactionData, 
    mockReadData, 
    formatAddr, 
    formatCampaignsTemplateReadData,
    formattedMockCampaignsTemplate
} from '../utilities';

import campaignTemplateArtifacts from "../../../contractsArtifacts/template.json";

export default function DataProvider({children} : {children: React.ReactNode}) {
    const [factoryData, setData] = React.useState<ReadData>(mockReadData);
    const [hasApproval, setHasApproval] = React.useState<boolean>(false);
    const [owner, setOwner] = React.useState<Address>(zeroAddress);
    const [verificationStatus, setVerificationStatus] = React.useState<boolean>(false);
    const [campaignsData, setCampaignsData] = React.useState<FormattedCampaignTemplate[]>([mockCampaignTemplateReadData]);

    const chainId = useChainId();
    const config = useConfig();
    const { isConnected, address } = useAccount();
    const account = formatAddr(address);

    const { td, readArgs, contractAddresses } = React.useMemo(() => {
        // Build read transactions data
        const { transactionData: td, contractAddresses: ca } = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['owner', 'getData', 'hasApproval', 'getVerificationStatus'],
        });
        const readArgs = [[], [], [account], [account]];
        const contractAddresses = [
            td[0].contractAddress as Address,
            ca.CampaignFactory as Address,
            ca.ApprovalFactory as Address,
            ca.VerifierV2 as Address,
        ];

        return { td, readArgs, contractAddresses };
    }, [account, chainId]);


    const readTxObject = td.map((item, i) => {
        return{
            abi: item.abi,
            functionName: item.functionName,
            address: contractAddresses[i],
            args: readArgs[i]
        }
    });

    // Read data from the CampaignFactory contact 
    const { data: factoryReadData, } = useReadContracts({
        config,
        account,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
        }
    });

    // Update the state with the result  of the read action
    React.useEffect(() => {
        let data : ReadData = mockReadData;
        let owner_ : Address = zeroAddress;
        let hasApproval_ : boolean = false;
        let verificationStatus_ : boolean = false;

        if(factoryReadData && factoryReadData[0].status === 'success' && factoryReadData[0].result !== undefined) {
            owner_ = factoryReadData[0].result as Address;
        }
        if(factoryReadData && factoryReadData[1].status === 'success' && factoryReadData[1].result !== undefined) {
            data = factoryReadData[1].result as ReadData;
        }
        if(factoryReadData && factoryReadData[2].status === 'success' && factoryReadData[2].result !== undefined) {
            hasApproval_ = factoryReadData[2].result as boolean;
        }
        if(factoryReadData && factoryReadData[3].status === 'success' && factoryReadData[3].result !== undefined) {
            verificationStatus_ = factoryReadData[3].result as boolean;
        }
        
        setOwner(owner_);
        setData(data);
        setVerificationStatus(verificationStatus_);
        setHasApproval(hasApproval_);
    }, [factoryReadData]);

    // Prepare to read data from the CampaignTemplate with the results fetched from the CampaignFactory
    const { campaignDataTrxns, rest } = React.useMemo(() => {
        const { campaigns, ...rest } = factoryData;
        const campaignDataTrxns = campaigns.map(({identifier}) => {
            return {
                abi: campaignTemplateArtifacts.abi as any,
                functionName: 'getData',
                address: identifier as Address,
                args: [account, zeroAddress], // Pass zero address in place of token address for now  
            }
        });

        return { campaignDataTrxns, rest }
    }, [factoryData]);
    
    // Read data from the campaign addresses
    const { data: campaignsReadData, isLoading: isLoadingCampaigns } = useReadContracts({
        config,
        account,
        contracts: campaignDataTrxns,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
        }
    });
    
    // Update the state with the result  of the read action
    React.useEffect(() => {
        let campaignsData_ = formattedMockCampaignsTemplate;
        if(campaignsReadData && campaignsReadData.length > 0) {
            campaignsData_ = campaignsReadData.map((data_: any, i: number) => {
                const {result, status} = data_;
                let campaignData_ : CampaignTemplateReadData = mockCampaignTemplateReadData;
                if(status === 'success') {
                    campaignData_ = result as CampaignTemplateReadData;
                }
                return formatCampaignsTemplateReadData(campaignData_, campaignDataTrxns[i].address);
            });
        }
        setCampaignsData(campaignsData_);
    }, [campaignsReadData]);

    const { builderCampaigns, creatorCampaigns } = React.useMemo(() => {
        const userAddress = account.toLowerCase();
        const builderCampaigns = campaignsData.filter((c) => {
            const anyLearner = c.epochData?.some((e) => e.learners?.some((l) => l.id.toLowerCase() === userAddress));
            return anyLearner;
        });

        const creatorCampaigns = campaignsData.filter(({owner}) => owner.toLowerCase() === userAddress);
        return {
            builderCampaigns,
            creatorCampaigns
        }
    }, [campaignsData, account]);

    return (
        <StorageContextProvider
            value={{
            ...rest,
                isLoading: isLoadingCampaigns,
                hasApproval,
                owner,
                campaignsData,
                verificationStatus,
                builderCampaigns,
                creatorCampaigns
            }}
        >
            { children }
        </StorageContextProvider>
    );
}