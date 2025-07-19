/* eslint-disable */
import { formatEther, Hex, keccak256, stringToBytes, stringToHex, zeroAddress } from "viem";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import globalContractData from "../../contractsArtifacts/global.json";
import assert from "assert";
import { getFunctionData } from "../../functionData";
import { getDataSuffix as getDivviDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { APP_ICON_URL, APP_NAME, CAST_MESSAGES } from "~/lib/constants";
import quizRawData from "../../quizData.json";
import { Address, Campaign, Category, CData, DifficultyLevel, Eligibility, FilterTransactionDataProps, FunctionName, Profile, Question, Quiz, QuizResultInput, ReadData, ReadProfile, ScoresParam, SelectedData, SelectedQuizData, TransactionData } from "../../types/quiz";
import { SelfAppBuilder } from "@selfxyz/qrcode";
import { IConfigStorage, VerificationConfig } from '@selfxyz/core';

export const TOTAL_WEIGHT = 100;

export const mockCampaign : Campaign = {
  fundsNative: 0n,
  fundsERC20: 0n,
  totalPoints: 0n,
  lastUpdated: 0,
  activeLearners: 0n,
  transitionDate: 0,
  claimActiveUntil: 0,
  operator: zeroAddress,
  token: zeroAddress,
  hash_: zeroAddress,
  canClaim: false,
  data: {
    campaignHash: keccak256(stringToBytes('solidity'), 'hex'),
    encoded: stringToHex("solidity")
  }
}

export const mockReadData : ReadData = {
  state: {
    minimumToken: 0n,
    weekCounter: 0n,
    transitionInterval: 0
  },
  wd: [{campaigns: [mockCampaign,]}],
}

export const mockCData : CData = [
  {
    campaignHash: `0x${''}`,
    encoded: `0x${''}`
  }
];

export const mockEligibility : Eligibility[] = [
  {
    campaignHash: `0x${''}`,
    value: false
  }
]

export const mockProfile : Profile = {
  other: {
    amountClaimedInNative: 0n,
    amountClaimedInERC20: 0n,
    claimed: false,
    passKey: "0x",
    haskey: false,
    totalQuizPerWeek: 0,
    amountMinted: 0n
  },
  quizResults: [
    {
      answers: [
        {
          isUserSelected: false,
          questionHash: '',
          selected: 0
        }
      ],
      other: {
        completedAt: '',
        id: '',
        title: '',
        percentage: 0,
        quizId: '',
        score: 0,
        timeSpent: 0,
        totalPoints: 0
      }
    }
  ]
}

export const mockReadProfile : ReadProfile = {
  campaignHash: `0x${''}`,
  profile: mockProfile
}

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

export const mockSelectedData : SelectedData = {
  category: '',
  selectedLevel: '',
  data: [],
  scoreParam: mockScoresParam,
  id: 0
};

export const emptyQuizData : SelectedQuizData = {
  category: "",
  level: "",
  questions: []
}

export const mockQuiz : Quiz = {
  id: "",
  title: "",
  description: "",
  questions: [],
  totalPoints: 0,
  timeLimit: 0,
  difficulty: 'easy',
  category: "",
  imageUrl: "",
  createdAt: new Date()
}

export const mockQuizResult : QuizResultInput = {
  answers: [],
  other: {
    quizId: "",
    score: 0,
    title: '',
    totalPoints: 0,
    percentage: 0,
    timeSpent: 0,
    completedAt: new Date().toString(),
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
 * @dev Accept an array of string. The result is the hashed version of each content in the data object
 * @param data : An Array of string to hash
 * @returns Hashed values
*/
export function getCampaignHashes(data: string[]) {
  let result : Hex[] = [];
  data.forEach((item, i) => {
    const hash = keccak256(stringToBytes(item));
    result.push(hash);
  })
  console.log("Result", result);
  return result;
}
  
/**
 * @dev Converts a string to a hexadecimal representation. If no parameter was parsed, the default return 
 * value is a hex with length 42 compatible with an Ethereum address type padded with zero value.
 * @param x : string or undefined;
 * @returns Address
 */
export const formatAddr = (x: string | undefined) : Address => {
    if(!x || x === "") return `0x${'0'.repeat(40)}`;
    return `0x${x.substring(2, x.length)}`;
};

/**
 * @dev Filter transaction data such as abis, contract addresses, inputs etc. If the filter parameter is true, it creates transaction data for 
 * the parsed function names. Default to false.
 * @param param0 : Parameters
 * @returns object containing array of transaction data and approved functions
 */
export function filterTransactionData({chainId, filter, functionNames = [], callback}: FilterTransactionDataProps) {
    const { approvedFunctions, chainIds, contractAddresses } = globalContractData;
    let transactionData : TransactionData[] = [];
    const index = chainIds.indexOf(chainId || chainIds[0]);
    if(filter) {
      functionNames.forEach((functionName) => {
        transactionData.push(getFunctionData(functionName, chainId));
      })
    }
  
    return {
      transactionData,
      approvedFunctions,
      contractAddresses: contractAddresses[index],
    }
}

/**
 * @dev Fetch and format cast messages or text
 * @param task : This is the function name that was performed
 * @param weekId : WeekId, perhaps the current week
 * @returns 
 */
export function getCastText(task: FunctionName, weekId: number) {
  const filtered = CAST_MESSAGES.filter(({key}) => key === task);
  return filtered?.[0]?.handler(weekId) || '';
}

/**
 * @dev Load and prepare data from the JSON API
 * @returns : Formatted data and categories
 */
export function loadQuizData({totalPoints, timePerQuestion}: {totalPoints: number, timePerQuestion: number}) : {categories: Category[], quizData: Quiz[] | null} {
  const d = quizRawData;
  // const difficultyLevels : DifficultyLevel[] = d.difficulties.split(',') as DifficultyLevel[];
  const categories : Category[] = d.categories.split(',') as Category[];
  // let quizData : {id: number, category: Category, selectedLevel:DifficultyLevel, data: QuizCategory}[] = [];
  const quizData : Quiz[] = [];

  // Loop through the categories
  d.categoryData.forEach(({category, levels, description}) => {
    // Loop through the levels
    levels.forEach(({questions, difficulty, id: levelId}) => {
      let qs : Question[] = [];
      const questionSize = questions.length;
      assert(totalPoints >= questionSize, "Totalpoints is invalid");
      const points = totalPoints / questionSize;
      const timeLimit = Math.ceil(timePerQuestion * questionSize);

      // Run through the questions
      questions.forEach(({answer, options, hash, question, explanation}, id) => {
        let correctAnswer = 0;
        qs.push({
          id,
          question,
          options,
          hash: `0x${hash}`,
          correctAnswer: typeof answer === "number"? answer : options.indexOf(answer),
          difficulty: difficulty as DifficultyLevel,
          category,
          points,
          explanation:explanation === ""? `The answer to ${question} is ${options[correctAnswer]}` : explanation
        })
      });

      quizData.push(
        {
          category,
          description,
          difficulty: difficulty as DifficultyLevel,
          id: keccak256(stringToBytes(category)),
          createdAt: new Date(),
          questions:qs,
          title: category,
          totalPoints,
          imageUrl: `/assets/${category}-${difficulty}.png`,
          timeLimit
        }
      );

    });
  });
  // console.log("QuizData:", quizData);
  return {
    quizData,
    categories
  };
}

function selfConfiguration(chainId: number, account: Address) {
  const { contractAddresses } = filterTransactionData({chainId, filter: false});
  // const config : IConfigStorage = {
  //   getConfig: function (id: string): Promise<VerificationConfig> {
  //     throw new Error("Function not implemented.");
  //   },
  //   setConfig: function (id: string, config: VerificationConfig): Promise<boolean> {
  //     throw new Error("Function not implemented.");
  //   },
  //   getActionId: function (userIdentifier: string, data: string): Promise<string> {
  //     throw new Error("Function not implemented.");
  //   }
  // }
  
  const verificationConfig : VerificationConfig = {
    minimumAge: 16,
    ofac: true,
    excludedCountries: []
  }

  return new SelfAppBuilder({
    appName: APP_NAME,
    scope: process.env.SCOPE as string,
    endpoint: contractAddresses.Claim as Address,
    endpointType: "staging_celo", // "staging_celo" for testnet, "celo" for mainnet
    logoBase64: APP_ICON_URL,
    userId: account,
    userIdType: "hex",
    disclosures: { 
      // Passport data fields
      date_of_birth: true,
      // nationality: true,
      name: true,
      // issuing_state: true,
      // passport_number: true, // Passport number field
      // gender: true,
      // expiry_date: true,
      
      ...verificationConfig,
    },
    devMode: true, // Set to true for development/testing, false for production
  }).build();
}