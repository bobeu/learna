import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount, useConfig, useReadContracts } from 'wagmi';
import { filterTransactionData, formatAddr } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types/quiz';

export default function SetUpCampaign({nativeValue, openDrawer, fundsErc20, token, campaignString, toggleDrawer }: SetUpCampaignProps) {
    const { chainId, address } = useAccount();
    const { callback } = useStorage();
    const account = formatAddr(address);
    const config = useConfig();

    const { readTxObject, mutate, setupArgs, learna } = React.useMemo(() => {
        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['approve', 'setUpCampaign'],
            callback
        });
        const { contractAddresses: ca, transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['allowance'],
            callback
        });
        
        const setupArgs = [campaignString, fundsErc20, token];
        const learna = ca.Learna as Address;
        const readArgs = [[account, learna]];
        const addresses = [learna];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: addresses[i],
                args: readArgs[i]
            }
        });

        return { readTxObject, mutate, setupArgs, learna };

    }, [chainId, account, campaignString, fundsErc20, token, callback]);

    const { refetch } = useReadContracts({
        config,
        contracts: readTxObject
    });

    const getTransactions = React.useCallback(() => {
         const refetchArgs = async(funcName: FunctionName) => {
            let args : any[] = [];
            const value : bigint = 0n;
            let proceed = 1;
            const result = await refetch();
            const allowance = result?.data?.[0].result as bigint;
            
            switch (funcName) {
                case 'approve':
                    if(allowance >= fundsErc20){
                        proceed = 0;
                    } else {
                        args = [account, learna, fundsErc20];
                    }
                    break;
                default:
                    break;
            }                

            return {args, value, proceed};
        };

        const getArgs = (functionName: FunctionName) => {
            let args : any[] = [];
            let contractAddress = token;
            switch (functionName) {
                case 'setUpCampaign':
                    args = setupArgs;
                    contractAddress = learna;
                    break;
                default:
                    break;
            }
            return { args, contractAddress: contractAddress as Address}
        }

        const transactions = mutate.transactionData.map((txObject) => {
            const { args, contractAddress } = getArgs(txObject.functionName as FunctionName);
            const transaction : Transaction = {
                abi: txObject.abi,
                args,
                contractAddress,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate,
                refetchArgs,
                value: nativeValue
            };
            return transaction;
        })
        return transactions;
    
   }, [account, fundsErc20, mutate, setupArgs, learna, nativeValue]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
        />
    )
}

interface SetUpCampaignProps {
    nativeValue: bigint;
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    campaignString: string;
    fundsErc20: bigint;
    token: Address;
};