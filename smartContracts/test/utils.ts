// import { Contract, ContractTransactionResponse } from "ethers";
import { expect } from "chai";
import { Common } from "../typechain-types/contracts/standalone/celo/FlexpoolFactory";
import { Common as CMon } from "../typechain-types/contracts/peripherals/Contributor";
import type { 
    Address, 
    BandParam, 
    JoinABandParam, 
    LiquidateParam, 
    Null, 
    PermissionedBandParam, 
    PermissionLessBandParam, 
    Signer, 
    BaseAsset, 
    SupportedAssetManager, 
    PaybackParam, 
    RemoveLiquidityParam, 
    GetFinanceParam,
    FactoryTxReturn,
    Balances,
    SimpliToken,
    TransferParam,
    TokenDistributor,
    ProvideLiquidityArg,
    RemoveLiquidityArg,
    BorrowArg, } from "./types";
  
  import { bn, formatAddr, TrxnType } from "./utilities";
  
  /**
   * @dev Create public pool
   * @param x : Parameters of type PermissionLessBandParam
   * @returns ContractResponse
  */
  export async function createPermissionlessPool (
    x: PermissionLessBandParam
  ) 
    : Promise<FactoryTxReturn> 
  {
    const factoryAddr = formatAddr(await x.factory.getAddress());
    const signerAddr = await x.signer.getAddress() as Address;
    const users : Address[] = [];
    users.push(signerAddr);
    const isPermissionless = true;
    await transferAsset({
      amount: x.unitLiquidity,
      asset: x.asset,
      recipients: [signerAddr],
      sender: x.deployer
    });
  
    await approve({
      owner: x.signer,
      amount: x.unitLiquidity,
      spender: factoryAddr,
      testAsset: x.asset
    }) 
    await x.factory.connect(x.signer).createPool( users, x.unitLiquidity, x.quorum, x.durationInHours, x.colCoverage, isPermissionless, x.collateralToken);
    const { currentPools, recordEpoches} = (await x.factory.getFactoryData());
    const filtered = currentPools.filter(({pool: {big: { unit}}}) => unit === x.unitLiquidity);
    const pool = filtered?.[0];
    const base = await x.asset.balanceOf(pool.pool.addrs.safe);
    const collateral = await x.collateralToken.balanceOf(pool.pool.addrs.safe);
    const balances : Balances = { base, collateral };
    const profile = (await x.factory.getProfile(x.unitLiquidity, signerAddr)).profile;
    const slot = await x.factory.getSlot(signerAddr, pool.pool.big.unitId);
    return { pool, balances, profile, slot};
  }
  
  /**
   * @dev Create private pool
   * @param x : Parameters of type PermissionedBandParam
   * @returns ContractResponse
   */
  export async function createPermissionedPool(
    x: PermissionedBandParam
  ) 
    : Promise<FactoryTxReturn>
  {
    const factoryAddr = formatAddr(await x.factory.getAddress());
    const signerAddr = await x.signer.getAddress();
    const recipients = await getAddressFromSigners(x.contributors);
    const isPermissionless = false;
    await transferAsset({
      amount: x.unitLiquidity,
      asset: x.asset,
      recipients: recipients,
      sender: x.deployer
    });
    
    await approve({
      owner: x.signer,
      amount: x.unitLiquidity,
      spender: factoryAddr,
      testAsset: x.asset
    }) 
    await x.factory.connect(x.signer).createPool(
      x.contributors,
      x.unitLiquidity, 
      x.contributors.length,
      x.durationInHours, 
      x.colCoverage, 
      isPermissionless,
      x.collateralToken
    );
    const { currentPools } = (await x.factory.getFactoryData());
    const filtered = currentPools.filter(({pool: {big: { unit}}}) => unit === x.unitLiquidity);
    const pool = filtered?.[0];
    const base = await x.asset.balanceOf(pool.pool.addrs.safe);
    const collateral = await x.collateralToken.balanceOf(pool.pool.addrs.safe);
    const balances : Balances = { base, collateral };
    const profile = (await x.factory.getProfile(x.unitLiquidity, signerAddr)).profile;
    const slot = await x.factory.getSlot(signerAddr, pool.pool.big.unitId);
  
    return { pool, balances, profile, slot };
  }
  
  /**
   * @dev Get finance
   * @param x : Parameters of type BandParam
   * @returns ContractResponse
   */
  export async function getFinance(x: GetFinanceParam)
   : Promise<FactoryTxReturn>
  {
    const signer = x.signers[0];
    const signerAddr = await signer.getAddress();
    const recipients = await getAddressFromSigners([signer]);
    const spender = await x.factory.getAddress() as Address;
    await transferAsset({
      amount: x.colQuote * 2n,
      asset: x.collateral,
      recipients: recipients,
      sender: x.deployer
    });
    // console.log("x.colQuote", x.colQuote)
    await approve({
      owner: signer,
      amount: x.colQuote,
      spender,
      testAsset: x.collateral
    });
    await x.factory.connect(signer).getFinance(x.unit);
    const { currentPools } = (await x.factory.getFactoryData());
    const filtered = currentPools.filter(({pool: {big: { unit}}}) => unit === x.unit);
    const pool = filtered?.[0];
    const base = await x.asset.balanceOf(pool.pool.addrs.safe);
    const collateral = await x.collateral.balanceOf(pool.pool.addrs.safe);
    const balances : Balances = { base, collateral };
    const profile = (await x.factory.getProfile(x.unit, signerAddr)).profile;
    const slot = await x.factory.getSlot(signerAddr, pool[0].big.recordId);
  
    return { balances, pool, profile, slot };
  }
  
  /**
   * @dev Payback
   * @param x : Parameters of type BandParam
   * @returns ContractResponse
   */
  export async function payback(
    x: PaybackParam
  ) 
  : Promise<{
      pool: CMon.ReadPoolDataReturnValueStructOutput;
      balances: Balances;
      profile: Common.ContributorStructOutput;
   }>
  {
    const factoryAddr = formatAddr(await x.factory.getAddress());
    const signer = x.signers[0];
    const signerAddr = await signer.getAddress();
    const recipients = await getAddressFromSigners([signer]);
    await x.factory.getCurrentDebt(x.unit, signerAddr);
    const bal = await x.asset.balanceOf(signerAddr);
    if(bn(x.debt).gt(bn(bal))){
      await transferAsset({
        amount: x.debt! - bal,
        asset: x.asset,
        recipients: recipients,
        sender: x.deployer
      });
    }
    await approve({
      owner: signer,
      amount: x.debt!,
      spender: factoryAddr,
      testAsset: x.asset
    });
  
    await x.factory.connect(signer).payback(x.unit);
    let pool: Common.PoolStructOutput | undefined = undefined;
    let currentPools : Common.ReadPoolDataReturnValueStructOutput[] = (await x.factory.getFactoryData()).currentPools;

    if(!x.pool) {
      currentPools = currentPools.filter(({pool: {big: { unit}}}) => unit === x.unit);
      pool = currentPools?.[0].pool;
    } else {
      pool = x.pool;
    }
    const base = await x.asset.balanceOf(pool.addrs.safe);
    const collateral = await x.collateral.balanceOf(pool.addrs.safe);
    const balances : Balances = { base, collateral };
    const profile = (await x.factory.getProfile(x.unit, signerAddr)).profile;
    return {
      pool: currentPools?.[0],
      balances,
      profile
    }
  }
  
  export async function approve(
    {owner, spender, amount, testAsset} 
      : 
        {owner: Signer, spender: Address, testAsset: BaseAsset | SimpliToken, amount: bigint, }) 
  {
    await testAsset.connect(owner).approve(spender, amount);
  }
  
  /**
   * @dev Liquidate
   * @param x : Parameters of type BandParam
   * @returns ContractResponse
   */
  export async function liquidate(x: LiquidateParam)  {
    const factoryAddr = formatAddr(await x.factory.getAddress());
    const signer = x.signers[0];
    const recipients = await getAddressFromSigners([signer]);
    const signerAddr = await signer.getAddress();

    await transferAsset({
      amount: x.debt!,
      asset: x.asset,
      recipients: recipients,
      sender: x.deployer
    });
    const baseBalB4Liq = await x.asset.balanceOf(signerAddr);
    console.log("baseBalB4Liq ", baseBalB4Liq );
    const colBalB4Liq = await x.collateral.balanceOf(signerAddr);
    await approve({
      owner: signer,
      amount: x.debt!,
      spender: factoryAddr,
      testAsset: x.asset
    });
    await x.factory.connect(signer).liquidate(x.unit);
    const { currentPools } = (await x.factory.getFactoryData());
    const filtered = currentPools.filter(({pool: {big: { unit}}}) => unit === x.unit);
    const pool = filtered?.[0];
    const base = await x.asset.balanceOf(pool.pool.addrs.safe);
    const collateral = await x.collateral.balanceOf(pool.pool.addrs.safe);
    const balances : Balances = { base, collateral };
    const profile = (await x.factory.getProfile(x.unit, signerAddr)).profile;
    const slot = await x.factory.getSlot(signerAddr, pool[0].big.recordId); 
    const baseBalAfterLiq = await x.asset.balanceOf(signerAddr);
    const colBalAfterLiq = await x.collateral.balanceOf(signerAddr);
  
    return {
      liq: {
        pool,
        balances,
        profile,
        slot
      },
      baseBalB4Liq,
      baseBalAfterLiq,
      colBalAfterLiq,
      colBalB4Liq
    }
  }
  
  /**
   * @dev Check whether there is a defaulter at a specified `epoch`
   * @param x : Parameters of type BandParam
   * @returns ContractResponse
   */
  export async function enquireLiquidation(
    x: BandParam
  ) 
    : Promise<[Common.ContributorStructOutput, boolean, Common.SlotStructOutput]> 
  {
    return await x.factory.enquireLiquidation(x.unit);
  }
  
  /**
   * @dev Support new asset
   * @param assetMgr : Asset contract
   * @param token : Any ERC20 compatible contract
   * @returns ContractResponse
   */
  
  export const setSupportedToken = async(assetMgr: SupportedAssetManager, asset: Address) => {
    assetMgr.supportAsset(asset, false);
  }
  
  /**
   * @dev Send Collateral or base tokens to the accounts provided as signers in `x`.
   * 
   * @param x : Parameters of type FundAccountParam
   * @returns : Promise<{amtSentToEachAccount: Hex, amtSentToAlc1: Hex}>
   */
  export async function transferAsset(x: TransferParam) : Null {
    for(let i = 0; i < x.recipients.length; i++) {
      x.asset.connect(x.sender).transfer(formatAddr(x.recipients[i]), x.amount);
    }
  }
  
  /**
   * @dev Withdraws loan after getFinance successful.
   * 
   * @param x : Parameters 
   * @returns : Promise<{amtSentToEachAccount: Hex, amtSentToAlc1: Hex}>
   */
  export async function withdraw(
    x: 
    {
      owner: Address,
      asset: BaseAsset,
      safeAddr: Address,
      spender: Signer,
      collateral: SimpliToken
    }
  ){
    const { asset, owner, collateral: collateralToken, safeAddr, spender} = x;
    const spenderAddr = await spender.getAddress();
    const baseBalB4 = await asset.balanceOf(spender);
    const colBalB4 = await collateralToken.balanceOf(spender);
    const baseAllowance = await asset.allowance(owner, spender);
    if(baseAllowance > 0)  await asset.connect(spender).transferFrom(owner, spenderAddr, baseAllowance);
    const collateralAllowance = await collateralToken.allowance(owner, spender);
    if(collateralAllowance > 0)  await collateralToken.connect(spender).transferFrom(owner, spenderAddr, collateralAllowance);
    const baseBalAfter = await asset.balanceOf(spender);
    const colBalAfter = await collateralToken.balanceOf(spender);

    const base = await asset.balanceOf(safeAddr);
    const collateral = await collateralToken.balanceOf(safeAddr);
    const balances : Balances = { base, collateral };
    return { balances, baseBalB4, colBalB4, colBalAfter, baseBalAfter };
  }
  
  /**
   * @dev Remove a pool
   * @param x : Remove liquidity parameter.
  */
  export async function removeLiquidityPool(
    x: RemoveLiquidityParam
  ) {
    await x.factory.connect(x.signer).closePool(x.unit);
  }
  
  export async function getAddressFromSigners(signers: Signer[]) {
    let addrs : Address[] = [];
    for(let i = 0; i < signers.length; i++) {
      const addr = await signers[i].getAddress() as Address;
      addrs.push(addr);
    }
    return addrs;
  }
  
  /**
   * @dev Join a band
   * @param x : Parameters of type JoinABandParam
   * @returns void
  */
  export async function joinEpoch(
    x: JoinABandParam
  ) 
    : Promise<{
      pool: CMon.ReadPoolDataReturnValueStructOutput;
      balances: Balances;
      profiles: Common.ContributorStructOutput[];
    }>
  {
    // const testAssetAddr = formatAddr(await x.testAsset.getAddress());
    const recipients = await getAddressFromSigners(x.signers);
    await transferAsset({
      amount: x.unit,
      asset: x.testAsset,
      recipients: recipients,
      sender: x.deployer
    });
    let profiles : Common.ContributorStructOutput[] = [];
    for(let i= 0; i < x.signers.length; i++) {
      const signer = x.signers[i];
      await approve({
        amount: x.unit,
        owner: signer,
        spender: x.factoryAddr,
        testAsset: x.testAsset
      });
      await x.factory.connect(signer).contribute(x.unit);
      const signerAddr = await signer.getAddress();
      const profile = (await x.factory.getProfile(x.unit, signerAddr)).profile;
      profiles.push(profile);
    }
    const { currentPools } = (await x.factory.getFactoryData());
    const filtered = currentPools.filter(({pool: {big: { unit}}}) => unit === x.unit);
    const pool = filtered?.[0];
    const base = await x.testAsset.balanceOf(pool.pool.addrs.safe);
    const collateral = await x.collateral.balanceOf(pool.pool.addrs.safe);
    const balances : Balances = { base, collateral };

    return {
      pool,
      balances,
      profiles
    }
  }

  // Propose a new transaction
export async function proposeTransaction (
  {signer, contract, recipient, amount, delayInHrs, trxType, safe, token} 
  : 
  {contract: TokenDistributor, signer: Signer, recipient: Address, amount: bigint, delayInHrs: number, trxType: TrxnType, token: Address, safe: Address}
)
{
  await contract.connect(signer).proposeTransaction(token, safe, recipient, amount, delayInHrs, trxType);
  const reqId = await contract.requestIDs();
  const request = await contract.getTransactionRequest(reqId);
  expect(reqId).to.be.eq(request.id);
  return request;
}

// Sign transaction
export async function signTransaction (
  {signer, contract, requestId} 
    : 
    {contract: TokenDistributor, signer: Signer, requestId: bigint}
)
{
    await contract.connect(signer).signTransaction(requestId);
    const request = await contract.getTransactionRequest(requestId);
    return request;
}

/**
 * Execute pending transactions
 */
export async function executeTransaction(
  { contract, signer, reqId } 
    : 
  {contract: TokenDistributor, signer: Signer, reqId: bigint}) 
{
  // Execute transaction
  await contract.connect(signer).executeTransaction(reqId);
  const request = await contract.getTransactionRequest(reqId);
  return request; 
}

/**
 * @dev Utility to call provideLiquidity on the provides contract
 * @param args : Required Aarguments
 * @returns Object showing signer's profile and its size
 */
export async function provideLiquidity(args: ProvideLiquidityArg) {
  const { asset, signer, contract, rate, contractAddr, deployer, signerAddr, amount } = args;
  await transferAsset({amount, asset, recipients: [signerAddr], sender: deployer});
  await approve({owner: signer, amount, spender: contractAddr, testAsset: asset});
  await contract.connect(signer).provideLiquidity(rate);
  const profile = await contract.getProviders();
  return {
    size: profile.length,
    profile: profile.filter((item) => item.account.toLocaleLowerCase() === signerAddr.toString().toLocaleLowerCase())?.[0]
  }
}

/**
 * @dev Utility to call removeLiquidity on the provides contract
 * @param args : Required Aarguments
 * @returns Object showing signer's profile and its size
 */
export async function removeLiquidity(args: RemoveLiquidityArg) {
  const { signer, contract, signerAddr, } = args;
  await contract.connect(signer).removeLiquidity();
  const profile = await contract.getProviders();
  return {
    size: profile.length,
    profile: profile.filter((item) => item.account.toLocaleLowerCase() === signerAddr.toString().toLocaleLowerCase())?.[0]
  }
}

/**
 * @dev Utility to call removeLiquidity on the provides contract
 * @param args : Required Aarguments
 * @returns Object showing signer's profile and its size
 */
export async function borrow(args: BorrowArg) {
  const { signer, contract, signerAddr, providersSlots, amount, flexpool } = args;
  await contract.connect(signer).borrow(providersSlots, amount);
  const profile = await flexpool.getProfile(amount, signerAddr);
  const { currentPools } = (await flexpool.getFactoryData());
  const filtered = currentPools.filter(({pool: {big: { unit}}}) => unit === amount);
  const pool = filtered?.[0];
  return {
    size: profile.length,
    profile,
    pool
  }
}

