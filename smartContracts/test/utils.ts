import { Hex, parseEther } from "viem";
import type { Address, GrowToken, Learna, Null, Signer } from "./types";
import { ILearna } from "../typechain-types";
import { ILearna as IL } from "../typechain-types/contracts/ILearna"

export const campaigns = ['solidity'];
// export const campaignHash = '0xa477d97b122e6356d32a064f9ee824230d42d04c7d66d8e7d125a091a42b0b25' as Hex;
  
interface SortEarnings {
  learna: Learna; 
  growToken: GrowToken;
  deployer: Signer;
  amountInERC20: bigint;
  campaigns: string[];
}

interface ClaimReward {
  learna: Learna; 
  weekId: bigint;
  signer: Signer;
  growToken: GrowToken;
  campaignHash: Hex;
}

interface GenerateKey {
  learna: Learna;
  signer: Signer;
  growToken: Address;
  campaignHashes: Hex[];
}

interface RecordPoints {
  user: Address;
  learna: Learna;
  quizResult: QuizResultInput;
  deployer: Signer;
  token: Address;
  campaignHash: Hex;
}

interface Ban {
  user: Address;
  weekId: bigint;
  learna: Learna;
  deployer: Signer;
  campaignHashes: Hex[];
}

interface SetUpCampaign {
  signer: Signer;
  fundERC20: bigint;
  token: Address;
  learna: Learna;
  campaign: string;
  value: bigint;
}

interface QuizResultOtherInput {
  id: string;
  title: string;
  quizId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
}

interface AnswerInput {
  questionHash: string;
  isUserSelected: boolean;
  selected: number;
}

export interface QuizResultInput {
  answers: AnswerInput[];
  other: QuizResultOtherInput;
}

/**
 * @dev Sort weekly earning i.e Set amount to distribute for the week with all necessary paramters
 * @param x : Paramaters
 * @returns : {
*   balanceInGrowReserveAfterAllocation,
    balanceOfLearnaAfterAllocation,
    balanceOfLearnaB4Allocation,
    balanceInGrowReserveB4Allocation,
    data
 * }
*/
export async function sortWeeklyEarning(x: SortEarnings) {
  const { learna, campaigns, amountInERC20, deployer, growToken } = x;
  const learnaAddr = await learna.getAddress();
  const growTokenAddr = await growToken.getAddress();
  const balanceOfLearnaB4Allocation = await growToken.balanceOf(learnaAddr);
  const balanceInGrowReserveB4Allocation = await growToken.balanceOf(growTokenAddr);
  await learna.connect(deployer).sortWeeklyReward(growTokenAddr, amountInERC20, campaigns, 0);
  const balanceOfLearnaAfterAllocation = await growToken.balanceOf(learnaAddr);
  const balanceInGrowReserveAfterAllocation = await growToken.balanceOf(growTokenAddr);
  const data = await learna.getData();

  return {
    balanceInGrowReserveAfterAllocation,
    balanceOfLearnaAfterAllocation,
    balanceOfLearnaB4Allocation,
    balanceInGrowReserveB4Allocation,
    data
  };
}

/**
 * @dev Sort weekly earning i.e Set amount to distribute for the week with all necessary paramters
 * @param x : Paramaters
 * @returns : {
*   erc20balanceOfSignerB4Claim,
    erc20balanceInLearnaB4Claim,
    nativeBalOfSignerB4Claim,
    erc20balanceOfSignerAfterClaim,
    nativeBalOfSignerAfterClaim,
    erc20balanceInLearnaAfterClaim,
    profile
 * }
*/
export async function claimReward(x: ClaimReward) {
  const { learna, signer, weekId, growToken, campaignHash } = x;
  const signerAddr = await signer.getAddress();
  const learnaAddr = await learna.getAddress();
  const erc20balanceOfSignerB4Claim = await growToken.balanceOf(signerAddr);
  const erc20balanceInLearnaB4Claim = await growToken.balanceOf(learnaAddr);
  const nativeBalOfSignerB4Claim = await signer.provider?.getBalance(signerAddr) as bigint;
  const eligibility = await learna.checkEligibility(signerAddr, campaignHash);

  const erc20balanceOfSignerAfterClaim = await growToken.balanceOf(signerAddr);
  const nativeBalOfSignerAfterClaim = await signer.provider?.getBalance(signerAddr) as bigint;
  const erc20balanceInLearnaAfterClaim = await growToken.balanceOf(learnaAddr);
  const profile = await learna.getProfile(signerAddr, weekId, campaignHash);

  return {
    erc20balanceOfSignerB4Claim,
    erc20balanceInLearnaB4Claim,
    nativeBalOfSignerB4Claim,
    erc20balanceOfSignerAfterClaim,
    nativeBalOfSignerAfterClaim,
    erc20balanceInLearnaAfterClaim,
    eligibility,
    profile
  };
}

/**
 * @dev Get passkey for the current key
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function recordPoints(x: RecordPoints) {
  const { user, learna, deployer, quizResult, token, campaignHash } = x;
  await learna.connect(deployer).recordPoints(user, quizResult, token, campaignHash, {value: parseEther('1')});
  const data = await learna.getData();
  return await learna.getProfile(user, data.state.weekCounter, campaignHash);
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function banUserFromCampaig(x: Ban) {
  const { user, learna, deployer, weekId, campaignHashes } = x;
  await learna.connect(deployer).banUserFromCampaign([user], campaignHashes);
  return await learna.getProfile(user, weekId, campaignHashes[0]);
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function unbanUserFromCampaig(x: Ban) {
  const { user, learna, deployer, weekId, campaignHashes } = x;
  await learna.connect(deployer).unbanUserFromCampaign([user], campaignHashes);
  return await learna.getProfile(user, weekId, campaignHashes[0]);
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function setUpCampaign(x: SetUpCampaign) {
  const { signer, learna, fundERC20, campaign, token, value } = x;
  const learnaAddr = await learna.getAddress();
  const balanceOfLeanerB4Tipped = await signer.provider?.getBalance(learnaAddr);
  await learna.connect(signer).setUpCampaign(campaign, fundERC20, token, {value});

  const balanceOfLeanerAfterTipped = await signer.provider?.getBalance(learnaAddr);
  const campaigns_ = await getCampaigns(learna);
  // console.log("campaigns_", campaigns_.campaignData)
  return {
    campaigns: campaigns_,
    balanceOfLeanerB4Tipped,
    balanceOfLeanerAfterTipped 
  }
}

export async function getCampaigns(learna: Learna) {
  let campaigns : ILearna.CampaignStructOutput[] = [];
  let wd : any[] = [];
  const data = await learna.getData();
  wd = data.wd;
  campaigns = wd[0].campaigns;
  return {
    campaigns,
    campaignData: campaigns[0].data
  };
}

/**
 * @dev Send token from one account to another.
 * 
 * @param x : Parameters of type FundAccountParam
 * @returns : Promise<{amtSentToEachAccount: Hex, amtSentToAlc1: Hex}>
 */
export async function transferToken(x: {recipients: Address[], asset: GrowToken, sender: Signer, amount: bigint}) : Null {
  for(let i = 0; i < x.recipients.length; i++) {
    await x.asset.connect(x.sender).transfer(x.recipients[i], x.amount);
  }
}

/**
 * @dev Send Collateral or base tokens to the accounts provided as signers in `x`.
 * 
 * @param x : Parameters of type FundAccountParam
 * @returns : Promise<{amtSentToEachAccount: Hex, amtSentToAlc1: Hex}>
 */
export async function balanceOf({accounts, asset}: {accounts: Address[], asset: GrowToken}) {
  let result : bigint[] = [];
  for(let i = 0; i < accounts.length; i++) {
    const balance = await asset.balanceOf(accounts[i]);
    result.push(balance);
  }
}

export const getQuizResult = (hash: Address, score: number): QuizResultInput => {
  return {
    other: {
      completedAt: new Date().toString(),
      id: '1',
      title: "solidity",
      percentage: 20,
      quizId: 'solidity',
      score,
      timeSpent: 70,
      totalPoints: 100
    },
    answers: [
      {
        isUserSelected: false,
        questionHash: hash,
        selected: 0
      },
      {
        isUserSelected: false,
        questionHash: hash,
        selected: 1
      },
      {
        isUserSelected: false,
        questionHash: hash,
        selected: 2
      },
    ]
  }
}
