import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount, } from 'wagmi';
import { filterTransactionData, formatAddr } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types/quiz';
import { zeroAddress } from 'viem';

export default function SetUpCampaign({nativeValue, openDrawer, fundsErc20, token, campaignString, toggleDrawer }: SetUpCampaignProps) {
    const { chainId, address } = useAccount();
    const { callback } = useStorage();
    const account = formatAddr(address);

    const { mutate, approveArgs, setupArgs, learna } = React.useMemo(() => {
        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['approve', 'setUpCampaign'],
            callback
        });

        const setupArgs = [campaignString, fundsErc20, token];
        const learna = mutate.contractAddresses.Learna as Address;
        const approveArgs = [learna, fundsErc20];

        return { mutate, setupArgs, approveArgs, learna };

    }, [chainId, account, campaignString, fundsErc20, token, callback]);

    const getTransactions = React.useCallback(() => {
        const getArgs = (functionName: FunctionName) => {
            let args : any[] = [];
            let contractAddress = zeroAddress as Address;
            let value  : bigint | undefined = nativeValue;

            switch (functionName) {
                case 'setUpCampaign':
                    args = setupArgs;
                    contractAddress = learna;
                    break;

                case 'approve':
                    args = approveArgs;
                    contractAddress = token;
                    value = undefined;
                    break;
                default:
                    break;
            }
            return { args, value, contractAddress: contractAddress as Address}
        }

        const transactions = mutate.transactionData.map((txObject) => {
            const { args, contractAddress, value } = getArgs(txObject.functionName as FunctionName);
            const transaction : Transaction = {
                abi: txObject.abi,
                args,
                contractAddress,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: false,
                value
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
            lastStepInList='setUpCampaign'
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