/* eslint-disable */
import { StorageContextProvider } from "../StorageContextProvider";
import React from 'react';
import { 
    CampaignTemplateReadData,
    FormattedCampaignTemplate,
    InterfacerReadData,
    mockCampaignTemplateReadData,
    mockInterfacerReadData,
    type Address, 
    type ReadData, 
} from '../../../types';
import { useAccount, useChainId } from "wagmi";
import { celoSepolia } from 'wagmi/chains';
import { zeroAddress } from 'viem';
import { 
    filterTransactionData, 
    mockReadData, 
    formatAddr, 
    formatCampaignsTemplateReadData,
    formattedMockCampaignsTemplate
} from '../utilities';
import { getPublicClient } from './publicClientConfig';
import campaignTemplateArtifacts from "../../../contractsArtifacts/template.json";
import { readContract } from "viem/actions";

export default function PublicDataProvider({children} : {children: React.ReactNode}) {
    const [factoryData, setData] = React.useState<ReadData>(mockReadData);
    const [hasApproval, setHasApproval] = React.useState<boolean>(false);
    const [owner, setOwner] = React.useState<Address>(zeroAddress);
    const [verificationStatus, setVerificationStatus] = React.useState<boolean>(false);
    const [interfacerData, setInterfacerData] = React.useState<InterfacerReadData>(mockInterfacerReadData);
    const [campaignsData, setCampaignsData] = React.useState<FormattedCampaignTemplate[]>([mockCampaignTemplateReadData]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = React.useState<boolean>(false);

    // Get chainId from wagmi if connected, otherwise default to celoSepolia
    const wagmiChainId = useChainId();
    const chainId = wagmiChainId || celoSepolia.id; // Default to celoSepolia if not connected
    const publicClient = getPublicClient(chainId);
    
    // Get user address if connected, otherwise use zeroAddress
    const { address } = useAccount();
    const account = formatAddr(address) || zeroAddress;

    // Function to read contracts using public client
    const readContracts = React.useCallback(async () => {
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

            // Process results
            let data: ReadData = mockReadData;
            let owner_: Address = zeroAddress;
            let hasApproval_: boolean = false;
            let verificationStatus_: boolean = false;
            let interfacerData_: InterfacerReadData = mockInterfacerReadData;

            if (results[0].status === 'fulfilled') {
                owner_ = results[0].value as Address;
            }
            if (results[1].status === 'fulfilled') {
                data = results[1].value as ReadData;
            }
            if (results[2].status === 'fulfilled') {
                hasApproval_ = results[2].value as boolean;
            }
            if (results[3].status === 'fulfilled') {
                verificationStatus_ = results[3].value as boolean;
            }
            if (results[4].status === 'fulfilled') {
                interfacerData_ = results[4].value as InterfacerReadData;
            }
            
            setOwner(owner_);
            setData(data);
            setVerificationStatus(verificationStatus_);
            setHasApproval(hasApproval_);
            setInterfacerData(interfacerData_);

            return data;
        } catch (error) {
            console.error('Error reading factory contracts:', error);
            return mockReadData;
        }
    }, [chainId, account, publicClient]);

    // Initial fetch and periodic refetch
    React.useEffect(() => {
        readContracts();
        
        // Set up interval for periodic refetch (every 5 seconds)
        const interval = setInterval(() => {
            readContracts();
        }, 5000);

        return () => clearInterval(interval);
    }, [readContracts]);

    // Read campaign data
    React.useEffect(() => {
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
    }, [factoryData, account, publicClient]);

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

    // Extract rest from factoryData
    const { campaigns, ...rest } = factoryData;

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
                creatorCampaigns,
                interfacerData
            }} 
        >
            { children }
        </StorageContextProvider>
    );
}

