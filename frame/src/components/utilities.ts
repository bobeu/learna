import { formatEther, zeroAddress } from "viem";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import globalContractData from "../../contractsData/global.json";
import assert from "assert";
import { getStepData } from "../../stepsData";

export type Address = `0x${string}`;
export type FunctionName = 'checkligibility' | 'recordPoints' | 'unregisterUsersForWeeklyEarning' | 'claimWeeklyReward' | 'sortWeeklyReward' | 'tip' | 'getTippers' | 'getUserData' | 'generateKey' | 'getData';
// export type TxnStatus = "Pending" | "Confirming" | "Confirmed" | "Reverted" | "Failed";

interface Values {
  totalAllocated: bigint;
  totalClaimed: bigint;
}

export interface Claims {
  native: Values;
  erc20: Values;
  erc20Addr: Address;
  totalPoints: bigint;
  active: boolean;
}

export interface Profile {
  amountClaimedInNative: bigint;
  amountClaimedInERC20: bigint;
  claimed: boolean;
  points: number;
  passKey: string;
  haskey: boolean;
  totalQuizPerWeek: number;
}

export interface State {
  tippers: Readonly<Tipper[]>;
  activeLearners: bigint; 
  totalPoints: bigint;
  minimumToken: bigint;
  weekCounter: bigint;
}

interface Tipper {
  totalTipped: bigint;
  points: number;
  lastTippedDate: bigint;
}

export interface ReadData {
  state: State;
  claims: Readonly<Claims[]>;
}

export type TransactionCallback = (arg: TrxState) => void;
export type TransactionData = {
    contractAddress: string;
    inputCount: number;
    functionName: string;
    abi: any;
    requireArgUpdate: boolean;
};

export interface TrxState {
    message?: string;
    errorMessage?: any;
}

export type FilterTransactionDataProps = {
    chainId: number | undefined;
    functionNames?: FunctionName[];
    callback?: TransactionCallback;
    filter: boolean;
}

export const mockProfile : Profile = {
  amountClaimedInNative: 0n,
  amountClaimedInERC20: 0n,
  claimed: false,
  points: 0,
  passKey: "0x",
  haskey: false,
  totalQuizPerWeek: 0
}

export const mockReadData : ReadData = {
  state: {
    activeLearners : 0n,
    minimumToken: 0n,
    totalPoints: 0n,
    weekCounter: 0n,
    tippers: []
  },
  claims: [
    {
      active: false,
      erc20: {totalAllocated: 0n, totalClaimed: 0n},
      erc20Addr: zeroAddress,
      native: {totalAllocated: 0n, totalClaimed: 0n},
      totalPoints: 0n
    }
  ]
}

export const emptyQuizData = {
  category: '', 
  data: {
    category: '',
    id: 0,
    difficultyLevel: '',
    questions: []
  }
}
/**
 * @dev Converts an argument to a bigInt value
 * @param arg : Argument to convert;
 * @returns BigInt
*/
export const toBigInt = (x: string | number | ethers.BigNumberish | bigint | undefined) : bigint => {
  if(!x) return 0n;
  return BigInt(toBN(x).toString());
} 

/**
 * @dev Converts an argument to a Big Number value
 * @param arg : Argument to convert;
 * @returns BigNumber
*/
export const toBN = (x: string | number | BigNumber | any) => {
  return new BigNumber(x);
}

/**
 * Converts value of their string representation.
 * @param value : Value to convert.
 * @returns Formatted value.
 */
export const formatValue = (arg: string | number | ethers.BigNumberish | bigint | undefined) => {
    const valueInBigNumber = toBN(formatEther(toBigInt(arg))).decimalPlaces(4)
    return {
      toStr: valueInBigNumber.toString(),
      toNum: valueInBigNumber.toNumber()
    }
  }
  
/**
 * @dev Formats an undefined address type object to a defined one
 * @param arg : string or undefined;
 * @returns Address
 */
export const formatAddr = (x: string | (Address | undefined)) : Address => {
    if(!x || x === "") return `0x${'0'.repeat(40)}`;
    return `0x${x.substring(2, 42)}`;
};

/**
 * @dev Filter transaction data such as abis, contract addresses, inputs etc. If the filter parameter is true, it creates transaction data for 
 * the parsed function names. Default to false.
 * @param param0 : Parameters
 * @returns object containing array of transaction data and approved functions
 */
export function filterTransactionData({chainId, filter, functionNames, callback}: FilterTransactionDataProps) {
    const { approvedFunctions, chainIds, contractAddresses } = globalContractData;
    let transactionData : TransactionData[] = [];
    const index = chainIds.indexOf(chainId || chainIds[0]);
    const isCelo = chainId === chainIds[0];
    if(filter) {
      assert(functionNames !== undefined, "FunctionNames not provided");
      functionNames.forEach((functionName) => {
        if(!approvedFunctions.includes(functionName)) {
          const errorMessage = `Operation ${functionName} is not supported`;
          callback?.({errorMessage});
          throw new Error(errorMessage);
        }
        const data = getStepData(functionName);
        transactionData.push(data);
      })
    }
  
    return {
      transactionData,
      approvedFunctions,
      contractAddresses: contractAddresses[index],
      isCelo  
    }
}
