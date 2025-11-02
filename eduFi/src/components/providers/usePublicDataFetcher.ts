/* eslint-disable */
import { useCallback, useEffect } from 'react';
import { 
    CampaignTemplateReadData,
    FormattedCampaignTemplate,
    InterfacerReadData,
    mockCampaignTemplateReadData,
    type Address, 
    type ReadData, 
} from '../../../types';
import { useAccount, useChainId } from "wagmi";
import { celoSepolia } from 'wagmi/chains';
import { zeroAddress } from 'viem';
import { 
    filterTransactionData, 
    formatAddr, 
    formatCampaignsTemplateReadData,
    formattedMockCampaignsTemplate
} from '../utilities';
import { getPublicClient } from './publicClientConfig';
import campaignTemplateArtifacts from "../../../contractsArtifacts/template.json";
import { readContract } from "viem/actions";

interface UsePublicDataFetcherProps {
    set_FactoryData: (data: ReadData) => void;
    set_Owner: (owner: Address) => void;
    set_HasApproval: (hasApproval: boolean) => void;
    set_VerificationStatus: (status: boolean) => void;
    set_InterfacerData: (data: InterfacerReadData) => void;
    set_CampaignsData: (data: FormattedCampaignTemplate[]) => void;
    set_IsLoadingCampaigns: (loading: boolean) => void;
    factoryData: ReadData;
}

export function usePublicDataFetcher({
    set_FactoryData,
    set_Owner,
    set_HasApproval,
    set_VerificationStatus,
    set_InterfacerData,
    set_CampaignsData,
    set_IsLoadingCampaigns,
    factoryData,
}: UsePublicDataFetcherProps) {
    // Get chainId from wagmi if connected, otherwise default to celoSepolia
    const wagmiChainId = useChainId();
    const chainId = wagmiChainId || celoSepolia.id; // Default to celoSepolia if not connected
    const publicClient = getPublicClient(chainId);
    
    // Get user address if connected, otherwise use zeroAddress
    const { address, isConnected } = useAccount();
    const account = formatAddr(address) || zeroAddress;

    // Function to read contracts using public client
    // const readContracts = useCallback(async () => {
    //     if(isConnected) {
    //         return; // Only run when user is NOT connected
    //     }

       
    // }, [chainId, account, publicClient, isConnected, set_FactoryData, set_Owner, set_HasApproval, set_VerificationStatus, set_InterfacerData]);

    // Initial fetch and periodic refetch for factory data
    useEffect(() => {
        if(isConnected) {
            return; // Only run when user is NOT connected
        }

        const readContracts = async () => {
            try {
                const { transactionData: td, contractAddresses: ca } = filterTransactionData({
                    chainId,
                    filter: true,
                    functionNames: ['owner', 'getFactoryData', 'hasApproval', 'isVerified', 'getInterfacerData'],
                });
                
                const contractAddresses = [
                    td[0].contractAddress as Address,
                    ca.CampaignFactory as Address,
                    ca.ApprovalFactory as Address,
                    ca.IdentityVerifier as Address,
                    ca.Interfacer as Address,
                ];

                const readArgs = [[], [], [account], [account], []];

                // Read all contracts in parallel
                const results = await Promise.allSettled([
                    readContract(publicClient, {
                        abi: td[0].abi,
                        functionName: td[0].functionName as string,
                        address: contractAddresses[0],
                        args: readArgs[0] as any[],
                    }),
                    readContract(publicClient, {
                        abi: td[1].abi,
                        functionName: td[1].functionName as string,
                        address: contractAddresses[1],
                        args: readArgs[1] as any[],
                    }),
                    readContract(publicClient, {
                        abi: td[2].abi,
                        functionName: td[2].functionName as string,
                        address: contractAddresses[2],
                        args: readArgs[2] as any[],
                    }),
                    readContract(publicClient, {
                        abi: td[3].abi,
                        functionName: td[3].functionName as string,
                        address: contractAddresses[3],
                        args: readArgs[3] as any[],
                    }),
                    readContract(publicClient, {
                        abi: td[4].abi,
                        functionName: td[4].functionName as string,
                        address: contractAddresses[4],
                        args: readArgs[4] as any[],
                    }),
                ]);

                // Process results and update states via callbacks
                if(results[0].status === 'fulfilled') {
                    set_Owner(results[0].value as Address);
                }
                if(results[1].status === 'fulfilled') {
                    set_FactoryData(results[1].value as ReadData);
                }
                if(results[2].status === 'fulfilled') {
                    set_HasApproval(results[2].value as boolean);
                }
                if(results[3].status === 'fulfilled') {
                    set_VerificationStatus(results[3].value as boolean);
                }
                if(results[4].status === 'fulfilled') {
                    set_InterfacerData(results[4].value as InterfacerReadData);
                }
            } catch (error) {
                console.error('Error reading factory contracts:', error);
            }
        }
        
        // Set up interval for periodic refetch (every 5 seconds)
        const interval = setInterval(() => {
            readContracts();
        }, 5000);

        return () => clearInterval(interval);
    }, [account, isConnected]);

    // Read campaign data
    useEffect(() => {
        if(isConnected) {
            return; // Only run when user is NOT connected
        }

        const fetchCampaignData = async () => {
            if(!factoryData.campaigns || factoryData.campaigns.length === 0) {
                set_CampaignsData(formattedMockCampaignsTemplate);
                return;
            }

            set_IsLoadingCampaigns(true);
            try {
                const campaignDataTrxns = factoryData.campaigns.map(({identifier}) => ({
                    abi: campaignTemplateArtifacts.abi as any,
                    functionName: 'getCampaignData' as const,
                    address: identifier as Address,
                    args: [account, zeroAddress] as [Address, Address],
                }));

                // Read all campaign contracts in parallel
                const campaignResults = await Promise.allSettled(
                    campaignDataTrxns.map((trxn) =>
                        readContract(publicClient, {
                            abi: trxn.abi,
                            functionName: trxn.functionName,
                            address: trxn.address,
                            args: trxn.args,
                        })
                    )
                );

                const campaignsData_ = campaignResults.map((result, i) => {
                    let campaignData_: CampaignTemplateReadData = mockCampaignTemplateReadData;
                    if(result.status === 'fulfilled') {
                        campaignData_ = result.value as CampaignTemplateReadData;
                    }
                    return formatCampaignsTemplateReadData(
                        campaignData_, 
                        campaignDataTrxns[i].address, 
                        i
                    );
                });

                set_CampaignsData(campaignsData_);
            } catch (error) {
                console.error('Error reading campaign contracts:', error);
                set_CampaignsData(formattedMockCampaignsTemplate);
            } finally {
                set_IsLoadingCampaigns(false);
            }
        };

        fetchCampaignData();

        // Set up interval for periodic refetch (every 5 seconds)
        const interval = setInterval(() => {
            fetchCampaignData();
        }, 5000);

        return () => clearInterval(interval);
    }, [factoryData, account, publicClient, isConnected, set_CampaignsData, set_IsLoadingCampaigns]);
}

