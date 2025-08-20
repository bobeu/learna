import { Hex, keccak256, stringToBytes } from 'viem';
import type { QuizData, Quiz, Question, CategoryType, DifficultyLevel, QuizResultInput, AnswerInput, QuizResultOtherInput } from "./types";
import assert from 'assert';
import _d_ from "./_d_.json";
// import { Campaigns } from "./typechain-types/contracts/Learna";

const TOTAL_POINTS = 100;
const TIME_PER_QUESTION = 0.4;
export const campaignHashes = [
  '0xa477d97b122e6356d32a064f9ee824230d42d04c7d66d8e7d125a091a42b0b25',
  '0x443e20e50db22e9d9b71d12d2d6e67a50096909698e387edd5a38f71707fb1d4',
  '0xaec58be7280ec68718c1d52948607abe5ef6f39b52457bd25e1a814ee3f0f11a',
  '0x48442a8a51170277e58c2f127672caf31dfb57f7a7914ef20cf436d4ef407324',
  '0x6b32c8bb24ac5e6b7aff504c13a3c39668ac1e1680044ffc7d5a4ce29e1e814a',
  '0x9452ff95c35084a621480c446a9c9f7ecf5d9acd4e7ab96ab223b9441d428106',
  '0x41d010e4d55c1f680ac8d1df51d62770f05ab44e7687503f884ef0629dbf7ab0',
  '0x8f4a077c54990defb65aed283b6a506325a7c60c1c6050490be01bed1180ed61',
  '0x14e210d380b3737084ebc5dba0408b8b983a9bcbb0838673abca542fcbb1018b',
  '0x87ef372fa0bc18c38f3c64ff4da209c8dac3db34cdaf2b35aa10008cbe46579f',
  '0x2ab2bf4c5cabc3000e2502e33470a863db2755809d7561237424a0eb373154c2',
  '0xcadd78318b85a28f2345a8559022d48031a1284da0d85635036169cc29465562',
  '0xc162469c13e9be46edb3d505b604b45100194a04c826d2f4a55f3ab391fb8267'
] as Hex[];

export const CAMPAIGNS = [
  'solidity',
  'wagmi',
  'reactjs',
  'ethersjs',
  'javascript',
  'typescript',
  'hardhat',
  'farcaster',
  'sdk',
  'defi',
  'celo',
  'self-protocol-sdk',
  'cryptocurrency'
];

/**
 * @dev Load and prepare data from the JSON API
 * @returns : Formatted data and categories
 */
export function loadData({totalPoints, timePerQuestion}: {totalPoints: number, timePerQuestion: number}) : {categories: CategoryType[], quizData: Quiz[] | null} {
  const d : QuizData = { categories: _d_.categories, difficulties: _d_.difficulties, categoryData: _d_.categoryData } ;
  const categories : CategoryType[] = d.categories.split(',') as CategoryType[];
  const quizData : Quiz[] = [];

  // Loop through the categories
  d.categoryData.forEach(({category, levels, description}) => {
    // Loop through the levels
    levels.forEach(({questions, difficulty,}) => {
      const qs : Question[] = [];
      const questionSize = questions.length;
      assert(totalPoints >= questionSize, "Totalpoints is invalid");
      const points = totalPoints / questionSize;
      const timeLimit = Math.ceil(timePerQuestion * questionSize);

      // Run through the questions
      questions.forEach(({answer, options, hash, question, explanation}, id) => {
        const correctAnswer = 0;
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
  return {
    quizData,
    categories
  };
}

export async function buildQuizInput(selectedCategory: string, selectedDifficulty: DifficultyLevel, correctAnswerCount: number) {
  const startTime = Date.now();
  const hashIndex = CAMPAIGNS.indexOf(selectedCategory);

  const quizResult : QuizResultInput[] | undefined = loadData({timePerQuestion: TIME_PER_QUESTION, totalPoints: TOTAL_POINTS})
    .quizData?.filter(
      ({category, difficulty}) => category.toLowerCase() === selectedCategory.toLowerCase() && difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
    ).map((quiz) => {
    
    const answers : AnswerInput[] = [];
    let score = 0;
    quiz.questions.forEach(
      ({correctAnswer, points, hash}, i) => {
        const userAnswer = i === correctAnswerCount? correctAnswer < 3? correctAnswer + 1 : correctAnswer - 1 : correctAnswer;
        if(userAnswer === correctAnswer) score += points;
        answers.push(
            {
            isUserSelected: true,
            questionHash: hash,
            selected: userAnswer
          }
        );
      }
    );
    // console.log("Answers", answers);
    // console.log("Score", score);

    return {
      other: {
        score: Math.ceil(score),
        totalPoints: quiz.totalPoints,
        percentage: Math.round((score / quiz.totalPoints) * 100),
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        completedAt: new Date().toString(),
        quizId: quiz.id,
        title: quiz.title,
      },
      answers
    }
  });

  assert(quizResult !== undefined && quizResult?.length > 0)
  const result = quizResult[0];
  const resultOtherInput : QuizResultOtherInput = {
    ...result.other,
    id: Date.now().toString()
  }
  
  const newResult: QuizResultInput= {
    answers: result.answers,
    other: resultOtherInput
  };
  // console.log("New result", newResult);

  return {
    quizResult: newResult,
    hash_: campaignHashes[hashIndex]
  };
} 

// /**
//  * @dev Dummy points data earned for each campaign
//  * @param startPoint : Start amount
//  * @returns result
//  */
// export const getPoints = (startPoint: number) => {
//     let points = startPoint;
//     const result =  CAMPAIGNS.map((_, index) => {
//         if(points > index) points -= index;
//         return points;
//     });
//     return result;
// }


// export function getCampaignHashes(campaignData: Campaigns.CampaignDataStructOutput[]) {
//     let campaignHashes = campaignData.map(({campaignHash}) => campaignHash) as Hex[];
//     // console.log("campaignData.lenght", campaignData.length)
//     // console.log("CAMPAIGNSa.lenght", CAMPAIGNS.length)
//     let localHashed : Hex[] = [];
//     CAMPAIGNS.forEach((item, i) => {
//         const hash = keccak256(stringToBytes(item));
//         if(hash !== campaignHashes[i]){
//             localHashed.push(hash);
//         }
//     })
//     // console.log("campaignHashes",campaignHashes);
//     // console.log("Localhashed", localHashed);
//     return {
//         campaignHashes,
//         localHashed
//     };
// }