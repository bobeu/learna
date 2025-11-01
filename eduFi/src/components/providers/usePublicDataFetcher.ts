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
    setFactoryData: (data: ReadData) => void;
    setOwner: (owner: Address) => void;
    setHasApproval: (hasApproval: boolean) => void;
    setVerificationStatus: (status: boolean) => void;
    setInterfacerData: (data: InterfacerReadData) => void;
    setCampaignsData: (data: FormattedCampaignTemplate[]) => void;
    setIsLoadingCampaigns: (loading: boolean) => void;
    factoryData: ReadData;
}

export function usePublicDataFetcher({
    setFactoryData,
    setOwner,
    setHasApproval,
    setVerificationStatus,
    setInterfacerData,
    setCampaignsData,
    setIsLoadingCampaigns,
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
    const readContracts = useCallback(async () => {
        if (isConnected) {
            return; // Only run when user is NOT connected
        }

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
            if (results[0].status === 'fulfilled') {
                setOwner(results[0].value as Address);
            }
            if (results[1].status === 'fulfilled') {
                setFactoryData(results[1].value as ReadData);
            }
            if (results[2].status === 'fulfilled') {
                setHasApproval(results[2].value as boolean);
            }
            if (results[3].status === 'fulfilled') {
                setVerificationStatus(results[3].value as boolean);
            }
            if (results[4].status === 'fulfilled') {
                setInterfacerData(results[4].value as InterfacerReadData);
            }
        } catch (error) {
            console.error('Error reading factory contracts:', error);
        }
    }, [chainId, account, publicClient, isConnected, setFactoryData, setOwner, setHasApproval, setVerificationStatus, setInterfacerData]);

    // Initial fetch and periodic refetch for factory data
    useEffect(() => {
        if (isConnected) {
            return; // Only run when user is NOT connected
        }

        readContracts();
        
        // Set up interval for periodic refetch (every 5 seconds)
        const interval = setInterval(() => {
            readContracts();
        }, 5000);

        return () => clearInterval(interval);
    }, [readContracts, isConnected]);

    // Read campaign data
    useEffect(() => {
        if (isConnected) {
            return; // Only run when user is NOT connected
        }

        const fetchCampaignData = async () => {
            if (!factoryData.campaigns || factoryData.campaigns.length === 0) {
                setCampaignsData(formattedMockCampaignsTemplate);
                return;
            }

            setIsLoadingCampaigns(true);
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
                    if (result.status === 'fulfilled') {
                        campaignData_ = result.value as CampaignTemplateReadData;
                    }
                    return formatCampaignsTemplateReadData(
                        campaignData_, 
                        campaignDataTrxns[i].address, 
                        i
                    );
                });

                setCampaignsData(campaignsData_);
            } catch (error) {
                console.error('Error reading campaign contracts:', error);
                setCampaignsData(formattedMockCampaignsTemplate);
            } finally {
                setIsLoadingCampaigns(false);
            }
        };

        fetchCampaignData();

        // Set up interval for periodic refetch (every 5 seconds)
        const interval = setInterval(() => {
            fetchCampaignData();
        }, 5000);

        return () => clearInterval(interval);
    }, [factoryData, account, publicClient, isConnected, setCampaignsData, setIsLoadingCampaigns]);
}

