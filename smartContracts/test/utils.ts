import type { Address, GrowToken, Learna, Null, Signer } from "./types";
  
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
export async function sortWeeklyEarning(x: {learna: Learna, growToken: GrowToken, owner: Address, deployer: Signer, amountInERC20: bigint}) {
  const { learna, owner, amountInERC20, deployer, growToken } = x;
  const learnaAddr = await learna.getAddress();
  const growTokenAddr = await growToken.getAddress();
  const balanceOfLearnaB4Allocation = await growToken.balanceOf(learnaAddr);
  const balanceInGrowReserveB4Allocation = await growToken.balanceOf(growTokenAddr);
  await learna.connect(deployer).sortWeeklyReward(growTokenAddr, owner, amountInERC20);
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
export async function claimWeeklyReward(x: {learna: Learna, weekId: bigint, signer: Signer, growToken: GrowToken}) {
  const { learna, signer, weekId, growToken } = x;
  const signerAddr = await signer.getAddress();
  const learnaAddr = await learna.getAddress();
  const erc20balanceOfSignerB4Claim = await growToken.balanceOf(signerAddr);
  const erc20balanceInLearnaB4Claim = await growToken.balanceOf(learnaAddr);
  const nativeBalOfSignerB4Claim = await signer.provider?.getBalance(signerAddr) as bigint;
  await learna.connect(signer).claimWeeklyReward(weekId);
  const erc20balanceOfSignerAfterClaim = await growToken.balanceOf(signerAddr);
  const nativeBalOfSignerAfterClaim = await signer.provider?.getBalance(signerAddr) as bigint;
  const erc20balanceInLearnaAfterClaim = await growToken.balanceOf(learnaAddr);
  const profile = await learna.getUserData(signerAddr, weekId);

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
export async function getPassKey(x: {learna: Learna, signer: Signer}) {
  const { learna, signer } = x;
  const address = await signer.getAddress();
  await learna.connect(signer).generateKey();
  const data = await learna.getData();
  return await learna.getUserData(address, data.state.weekCounter);
}

/**
 * @dev Get passkey for the current key
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function recordPoints(x: {user: Address, learna: Learna, points: number, deployer: Signer}) {
  const { user, learna, deployer, points } = x;
  await learna.connect(deployer).recordPoints(user, points);
  const data = await learna.getData();
  return await learna.getUserData(user, data.state.weekCounter);
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function unregisterUsersForWeeklyEarning(x: {user: Address, weekId: bigint, learna: Learna, deployer: Signer}) {
  const { user, learna, deployer, weekId } = x;
  await learna.connect(deployer).removeUsersForWeeklyEarning([user], weekId);
  return await learna.getUserData(user, weekId);
}

/**
 * @dev Add a user to weekly payout
 * @param x : Parameters
 * @returns : User's profile data
*/
export async function sendTip(x: {signer: Signer, tipAmount: bigint, learna: Learna}) {
  const { signer, learna, tipAmount} = x;
  const learnaAddr = await learna.getAddress();
  const balanceOfLeanerB4Tipped = await signer.provider?.getBalance(learnaAddr);
  await learna.connect(signer).tip({value: tipAmount});
  const balanceOfLeanerAfterTipped = await signer.provider?.getBalance(learnaAddr);
  const tippers = (await learna.getData()).state.tippers;
  return {
    tippers,
    balanceOfLeanerB4Tipped,
    balanceOfLeanerAfterTipped 
  }
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
