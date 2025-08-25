import { Hex, parseEther, zeroAddress } from "viem";
import type { Address, GrowToken, Learna, Null, Signer } from "./types";
import { ILearna } from "../typechain-types";
import { toNumber } from "ethers";

export const campaigns = ['solidity'];
  
interface SortEarnings {
  learna: Learna; 
  GrowToken: GrowToken;
  deployer: Signer;
  amountInERC20: bigint;
  // campaigns: string[];
}

interface ClaimReward {
  learna: Learna; 
  signer: Signer;
  GrowToken: GrowToken;
  campaignHash: Hex;
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
  learna: Learna;
  deployer: Signer;
  campaignHashes: Hex[];
}

interface SetUpCampaign {
  signer: Signer;
  fundERC20: bigint;
  token: GrowToken;
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
  const { learna, amountInERC20, deployer, GrowToken } = x;
  const learnaAddr = await learna.getAddress();
  const GrowTokenAddr = await GrowToken.getAddress();
  const balanceOfLearnaB4Allocation = await GrowToken.balanceOf(learnaAddr);
  const balanceInGrowReserveB4Allocation = await GrowToken.balanceOf(GrowTokenAddr);
  await learna.connect(deployer).sortWeeklyReward(amountInERC20, 0);
  const balanceOfLearnaAfterAllocation = await GrowToken.balanceOf(learnaAddr);
  const balanceInGrowReserveAfterAllocation = await GrowToken.balanceOf(GrowTokenAddr);
  const data = await learna.getData(zeroAddress);

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
  const { learna, signer, GrowToken, campaignHash } = x;
  const signerAddr = await signer.getAddress();
  const learnaAddr = await learna.getAddress();
  const erc20balanceOfSignerB4Claim = await GrowToken.balanceOf(signerAddr);
  const erc20balanceInLearnaB4Claim = await GrowToken.balanceOf(learnaAddr);
  const nativeBalOfSignerB4Claim = await signer.provider?.getBalance(signerAddr) as bigint;
  const eligibility = await learna.checkEligibility(signerAddr);

  const erc20balanceOfSignerAfterClaim = await GrowToken.balanceOf(signerAddr);
  const nativeBalOfSignerAfterClaim = await signer.provider?.getBalance(signerAddr) as bigint;
  const erc20balanceInLearnaAfterClaim = await GrowToken.balanceOf(learnaAddr);
  const data = await learna.getData(signerAddr);
  const profile = data.profileData[toNumber(data.state.weekId)];
  // console.log("Profile", profile)

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
  const { user, learna, deployer, quizResult, token, campaignHash,  } = x;
  await learna.connect(deployer).recordPoints(user, quizResult, campaignHash, {value: parseEther('1')});
  const data = await learna.getData(user);
  const profile = data.profileData[toNumber(data.state.weekId)];
  // const data = await learna.getData();
  return profile;
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
// export async function banUserFromCampaig(x: Ban) {
//   const { user, learna, deployer, campaignHashes } = x;
//   // First call will blacklist user
//   await learna.connect(deployer).banOrUnbanUser([user], campaignHashes);
//   const profile = await learna.getProfile(user);
//   return profile;
// }

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
// export async function unbanUserFromCampaig(x: Ban) {
//   const { user, learna, deployer, campaignHashes } = x;
//   await learna.connect(deployer).banOrUnbanUser([user], campaignHashes);
//   return await learna.getProfile(user);
// } 

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function setUpCampaign(x: SetUpCampaign) {
  const { signer, learna, fundERC20, campaign, token, value } = x;
  const learnaAddr = await learna.getAddress();
  const tokenAddr = await token.getAddress();
  const balanceOfLeanerB4Tipped = await signer.provider?.getBalance(learnaAddr);
  await token.connect(signer).approve(learnaAddr, fundERC20);
  await learna.connect(signer).setUpCampaign(campaign, fundERC20, tokenAddr, {value});

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
  const data = await learna.getData(zeroAddress);
  wd = data.wd;
  campaigns = wd[0].campaigns;
  return {
    allCampaign: data.approved,
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
