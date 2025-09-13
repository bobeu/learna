/* eslint-disable */
import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount, useConfig, useReadContracts } from 'wagmi';
import { filterTransactionData, formatAddr, mockReadData } from '../utilities';
import { Address, CreateCampaignInput, FunctionName, ReadData } from '../../../types';
// import { Hex } from 'viem';
// import useStorage from '../hooks/useStorage';

export default function CreateCampaign({openDrawer, params, toggleDrawer }: RecordPointsProps) {
    const { chainId, address, isConnected } = useAccount();
    const account = formatAddr(address);
    const config = useConfig();
    // const { creationFee } = useStorage();

    const { transactionData: td1, contractAddresses: ca } = filterTransactionData({
        chainId,
        filter: true,
        functionNames: ['getData'],
    });
    const readArgs = [[]];
    const contractAddresses = [ca.CampaignFactory as Address];
    const readTxObject = td1.map((item, i) => {
        return{
            abi: item.abi,
            functionName: item.functionName,
            address: contractAddresses[i],
            args: readArgs[i]
        }
    });
    
    // Read data from the CampaignFactory contact 
    const { data } = useReadContracts({
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

    const { transactionData: td, args, creationFee } = React.useMemo(() => {
        const result = data?.[0].result as ReadData || mockReadData;
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['createCampaign']
        });
        const args = [[params]];
        return { ...filtered, args, creationFee: result.creationFee };
    }, [chainId, params, data]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject, i) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: args[i],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: false,
                value: creationFee
            };
            return transaction;
        });
        return transactions;
    
   }, [td, account, args, creationFee]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='createCampaign'
        />
    )
}

type RecordPointsProps = {
    params: CreateCampaignInput;
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
};