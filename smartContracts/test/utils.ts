import { Hex, parseUnits } from "viem";
import type { Address, GrowToken, Learna, Null, Signer } from "./types";
import { Learna as Learn,   } from "../typechain-types";
import { Campaigns } from "../typechain-types/contracts/Learna";
  
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
  campaignHashes: Hex[];
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
  points: number[];
  deployer: Signer;
  token: Address;
  campaignHashes: Hex[];
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
  campaigns: string[];
  value: bigint;
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
  await learna.connect(deployer).sortWeeklyReward(growTokenAddr, amountInERC20, campaigns);
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
  const { learna, signer, weekId, growToken, campaignHashes } = x;
  const signerAddr = await signer.getAddress();
  const learnaAddr = await learna.getAddress();
  const erc20balanceOfSignerB4Claim = await growToken.balanceOf(signerAddr);
  const erc20balanceInLearnaB4Claim = await growToken.balanceOf(learnaAddr);
  const nativeBalOfSignerB4Claim = await signer.provider?.getBalance(signerAddr) as bigint;
  for(let i = 0; i < campaignHashes.length; i++){
    await learna.connect(signer).claimReward(weekId, campaignHashes[i]);
  }
  const erc20balanceOfSignerAfterClaim = await growToken.balanceOf(signerAddr);
  const nativeBalOfSignerAfterClaim = await signer.provider?.getBalance(signerAddr) as bigint;
  const erc20balanceInLearnaAfterClaim = await growToken.balanceOf(learnaAddr);
  const profile = await learna.getProfile(signerAddr, weekId, campaignHashes);

  return {
    erc20balanceOfSignerB4Claim,
    erc20balanceInLearnaB4Claim,
    nativeBalOfSignerB4Claim,
    erc20balanceOfSignerAfterClaim,
    nativeBalOfSignerAfterClaim,
    erc20balanceInLearnaAfterClaim,
    profile
  };
}

/**
 * @dev Get passkey for the current key
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function getPassKey(x: GenerateKey) {
  const { learna, signer, growToken, campaignHashes } = x;
  const address = await signer.getAddress();
  await learna.connect(signer).generateKey(growToken, campaignHashes, {value: parseUnits('1', 16) * BigInt(campaignHashes.length)});
  const data = await learna.getData();
  return await learna.getProfile(address, data.state.weekCounter, campaignHashes);
}

/**
 * @dev Get passkey for the current key
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function recordPoints(x: RecordPoints) {
  const { user, learna, deployer, points, token, campaignHashes } = x;
  await learna.connect(deployer).recordPoints(user, points, token, campaignHashes);
  const data = await learna.getData();
  return await learna.getProfile(user, data.state.weekCounter, campaignHashes);
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function banUserFromCampaig(x: Ban) {
  const { user, learna, deployer, weekId, campaignHashes } = x;
  await learna.connect(deployer).banUserFromCampaign([user], campaignHashes);
  return await learna.getProfile(user, weekId, campaignHashes);
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function setUpCampaign(x: SetUpCampaign) {
  const { signer, learna, fundERC20, campaigns, token, value } = x;
  const learnaAddr = await learna.getAddress();
  const balanceOfLeanerB4Tipped = await signer.provider?.getBalance(learnaAddr);
  for(let i = 0; i < campaigns.length; i++) {
    await learna.connect(signer).setUpCampaign(campaigns[i], fundERC20, token, {value});
  }
  const balanceOfLeanerAfterTipped = await signer.provider?.getBalance(learnaAddr);
  const campaigns_ = await getCampaigns(learna);
  return {
    campaigns: campaigns_,
    balanceOfLeanerB4Tipped,
    balanceOfLeanerAfterTipped 
  }
}

export async function getCampaigns(learna: Learna) {
  let campaigns : Campaigns.CampaignStructOutput[] = [];
  let wd : Learn.WeekDataStructOutput[] = [];
  const data = await learna.getData();
  // console.log("Data", data)
  wd = data.wd;
  if(wd && wd.length > 0) campaigns = wd[0].campaigns;
  return {
    campaigns,
    campaignData: data.cData
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
