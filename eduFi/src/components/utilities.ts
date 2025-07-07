/* eslint-disable */
import { formatEther, keccak256, stringToHex, zeroAddress } from "viem";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import globalContractData from "../../contractsData/global.json";
import assert from "assert";
import { getStepData } from "../../stepsData";
import { getDataSuffix as getDivviDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { CAST_MESSAGES } from "~/lib/constants";
import quizRawData from "../../quizData.json";
import { Address, Category, DifficultyLevel, FilterTransactionDataProps, FunctionName, Profile, Question, Quiz, QuizCategory, QuizResult, ReadData, ScoresParam, SelectedData, SelectedQuizData, TransactionData } from "../../types/quiz";

export const TOTAL_WEIGHT = 100;

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

export const mockProfile : Profile = {
  amountClaimedInNative: 0n,
  amountClaimedInERC20: 0n,
  claimed: false,
  points: 0,
  passKey: "0x",
  haskey: false,
  totalQuizPerWeek: 0
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

export const mockQuizResult : QuizResult = {
  id: "",
  quizId: "",
  score: 0,
  totalPoints: 0,
  percentage: 0,
  timeSpent: 0,
  answers: {},
  completedAt: new Date()
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
    // console.log("ChainId:", chainId);
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
      questions.forEach(({answer, options, question, explanation}, id) => {
        let correctAnswer = 0;
        qs.push({
          id: id.toString(),
          question,
          options,
          correctAnswer: typeof answer === "number"? answer : options.indexOf(answer),
          difficulty: difficulty as DifficultyLevel,
          category,
          points,
          explanation:explanation === ""? `The answer to ${question} is ${options[correctAnswer]}` : explanation
        })
        // for (let i = 0; i < options.length; i++){
        //   const option = options[i];
        //   if(answer === option) {
        //     console.log("answer === option", answer === option)
        //   }
        //   // console.log("option", option)
        //   if(answer === option) qs[id].correctAnswer = i;
        // }
      });

      quizData.push(
        {
          category,
          description,
          difficulty: difficulty as DifficultyLevel,
          // id: keccak256(stringToHex(category)),
          id: levelId,
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

  // categories.forEach((category, id) => {
  //   switch (category) {
  //     case 'defi':
  //       quizData.push({id, category, selectedLevel: '', data: d.defi});
  //       break;
  //     case 'reactjs':
  //       quizData.push({id, category, selectedLevel: '', data: d.reactjs});
  //       break;
  //     case 'solidity':
  //       quizData.push({id, category, selectedLevel: '', data: d.solidity});
  //       break;
  //     case 'wagmi':
  //       quizData.push({id, category, selectedLevel: '', data: d.wagmi});
  //       break;
  //     default:
  //       break;
  //   }
  // });
  // assert(quizData.length === categories.length, "Data anomally occurred in utilities.ts");
  // return{
  //   difficultyLevels,
  //   categories,
  //   quizData
  // };
}