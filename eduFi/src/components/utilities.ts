/* eslint-disable */
import { formatEther, zeroAddress } from "viem";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import globalContractData from "../../contractsData/global.json";
import assert from "assert";
import { getStepData } from "../../stepsData";
import { getDataSuffix as getDivviDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { CAST_MESSAGES } from "~/lib/constants";
import { Answer, Data, QuizDatum, SelectedData } from "~/dummyData";

export const TOTAL_WEIGHT = 100;
export type Address = `0x${string}`;
export type FunctionName = '' | 'checkligibility' | 'recordPoints' | 'removeUsersForWeeklyEarning' | 'approve' | 'claimWeeklyReward' | 'sortWeeklyReward' | 'tip' | 'getTippers' | 'getUserData' | 'generateKey' | 'getData' | 'owner';
export interface SelectedQuizData {category: string, data: QuizDatum}
interface Values {
  totalAllocated: bigint;
  totalClaimed: bigint;
}

export interface Claim {
  native: Values;
  erc20: Values;
  erc20Addr: Address;
  claimActiveUntil: number;
  transitionDate: number;
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

interface Tipper {
  totalTipped: bigint;
  points: number;
  lastTippedDate: bigint;
  id: Address;
}

export interface State {
  minimumToken: bigint;
  weekCounter: bigint;
  transitionInterval: number; 
}

export interface WeekData {
  tippers: Readonly<Tipper[]>;
  claim: Claim;
  activeLearners: bigint; 
  totalPoints: bigint;
  transitionInterval: number;
} 

export interface ReadData {
  state: State;
  wd: Readonly<WeekData[]>;
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

export interface HandleSelectAnswerProps {
  userAnswer?: Answer; 
  correctAnswer: Answer; 
  question: string;
  userSelect: boolean;
  options: Array<Answer>;
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

export interface ScoresParam {
  category: string;
  difficultyLevel: string;
  totalScores: number;
  questionSize: number;
  weightPerQuestion: number;
  totalAnsweredCorrectly: Data[];
  noAnswer: number;
  totalAnsweredIncorrectly: number;
}

export const mockSelectedData : SelectedData = {
  category: '',
  difficultyLevel: '',
  data: [],
  totalQuestions: 0
};

export const mockScoresParam : ScoresParam =  {
  category: '',
  difficultyLevel: '',
  totalScores: 0,
  questionSize: 0,
  weightPerQuestion: 0,
  noAnswer: 0,
  totalAnsweredCorrectly: [],
  totalAnsweredIncorrectly: 0
}

export type ScoresReturn = () => ScoresParam;

export const mockReadData : ReadData = {
  state: {
    minimumToken: 0n,
    weekCounter: 0n,
    transitionInterval: 0
  },
  wd: [
    {
      activeLearners: 0n,
      totalPoints: 0n,
      transitionInterval: 0,
      claim: {
        native: { totalAllocated: 0n, totalClaimed: 0n},
        erc20: { totalAllocated: 0n, totalClaimed: 0n}, 
        erc20Addr: zeroAddress,
        claimActiveUntil: 0,
        transitionDate: 0
      },
      tippers: [
        {
          id: zeroAddress,
          lastTippedDate: 0n,
          points: 0,
          totalTipped: 0n,
        },
        {
          id: `0x${'0'.repeat(41)}1`,
          lastTippedDate: 0n,
          points: 0,
          totalTipped: 0n,
        },
      ]
    },
    {
      activeLearners: 0n,
      totalPoints: 0n,
      transitionInterval: 0,
      claim: {
        native: { totalAllocated: 0n, totalClaimed: 0n},
        erc20: { totalAllocated: 0n, totalClaimed: 0n}, 
        erc20Addr: zeroAddress,
        claimActiveUntil: 0,
        transitionDate: 0
      },
      tippers: [
        {
          id: zeroAddress,
          lastTippedDate: 0n,
          points: 0,
          totalTipped: 0n,
        },
        {
          id: `0x${'0'.repeat(41)}1`,
          lastTippedDate: 0n,
          points: 0,
          totalTipped: 0n,
        },
      ]
    },
  ] 
}

export const emptyQuizData : SelectedQuizData = {
  category: '', 
  data: {
    category: '',
    id: 0,
    difficultyLevel: '',
    taken: false,
    questions: [],
    identifier: ""
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
 * @dev Converts onchain timestamp to a date object
 * @param arg : onchain time in seconds;
 * @returns Date string object
*/
export function getTimeFromEpoch(onchainUnixTime: number | bigint) {
  const toNumber = toBN(onchainUnixTime.toString()).toNumber()
  var date = new Date(toNumber * 1000);
  return (toNumber === 0? 'Not Set' : `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-US")}`);
}


/**
 * @dev Converts an argument to a Big Number value
 * @param arg : Argument to convert;
 * @returns BigNumber
*/
export const toBN = (x: string | number | BigNumber | any) => {
  return new BigNumber(x);
}

// consumer is your Divvi Identifier
// providers are the addresses of the Rewards Campaigns that you signed up for on the previous page
export function getDivviReferralUtilities() {
  const getDataSuffix = () => {
    const consumer = process.env.NEXT_PUBLIC_DIVVI_IDENTIFIER as Address;
    const campaign1 = process.env.NEXT_PUBLIC_CAMPAIGN_1 as string;
    const campaign2 = process.env.NEXT_PUBLIC_CAMPAIGN_2 as string;
    const providers = Array.from([campaign1, campaign2]) as Address[];
    return getDivviDataSuffix({
      consumer,
      providers,
    }) as Address;
  }
  const submitReferralData = async(txHash:`0x${string}`, chainId: number) => {
    return await submitReferral({
      txHash,
      chainId,
    })
  }
  return {
    getDataSuffix,
    submitReferralData
  }
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
    }
}

export function getCastText(task: FunctionName, weekId: number) {
  const filtered = CAST_MESSAGES.filter(({key}) => key === task);
  return filtered?.[0]?.handler(weekId) || '';
}