import { deployContracts, retrieveSafeContract } from "../../deployments";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  bn,
  UNIT_LIQUIDITY,
  COLLATER_COVERAGE_RATIO,
  DURATION_IN_HOURS,
  ZERO,
  INTEREST_RATE,
  formatAddr,
  DURATION_IN_SECS,
} from "../../utilities";
import { createPermissionedPool, getFinance, joinEpoch, payback, withdraw } from "../../utils";
import { Address } from "../../types";

describe("Permissioned: Payback", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("When a contributor get finance, they must return the loan before the duration elapse", function () {
    it("Signer1 should payback successfully", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, deployer, signer1Addr, },
        flexpoolAddr } = await loadFixture(deployContractsFixcture);

      const signers = [signer1, signer2];
      const create = await createPermissionedPool({
        asset: baseAsset,
        colCoverage: COLLATER_COVERAGE_RATIO,
        durationInHours: DURATION_IN_HOURS,
        factory: flexpool,
        intRate: INTEREST_RATE,
        signer: signer1,
        unitLiquidity: UNIT_LIQUIDITY,
        contributors: signers,
        deployer,
        collateralToken: collateralAsset
      });

      const join = await joinEpoch({
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        factoryAddr: formatAddr(flexpoolAddr),
        signers: [signer2],
        testAsset: baseAsset,
        collateral: collateralAsset
      });

      const quoted = await flexpool.connect(signer2).getCollateralQuote(create.pool.pool.big.unit);
      const gf = await getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer1],
        colQuote: quoted,
        collateral: collateralAsset,
        asset: baseAsset,
        deployer
      });

      /**
       * We need to fastrack the block time to near the duration of choice of the borrower
       * to avoid being liquidated.
       * Note: DURATION_OF_CHOICE_IN_SEC is same as DURATION_OF_CHOICE_IN_HR but we 
       * reduce DURATION_OF_CHOICE_IN_SEC by 2sec to account for execution time.
       */
      const durOfChoiceInSec = BigInt((await time.latest()) + (DURATION_IN_SECS));
      await time.increaseTo(durOfChoiceInSec);
      const debtToDate = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer1Addr);

      /**
       * We increase the time to give 3 sec for execution which is why we multiply interest per sec
       * by the number of seconds we increased by. This is to enable us give enough allowance to the 
       * flexpool contract since flexpool will always reply on the interest up to the current block. 
       */
      const pay = await payback({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        debt: debtToDate,
        signers: [signer1],
        collateral: collateralAsset
      });
      
      expect(pay.pool.pool.big.currentPool).to.be.equal(join.pool.pool.big.currentPool);
      expect(bn(pay.profile.colBals).isZero()).to.be.true;
      const safeContract = await retrieveSafeContract(formatAddr(gf.pool.pool.addrs.safe));
      const { access, collateralBalance} = await safeContract.getUserData(signer1Addr, create.pool.pool.big.recordId);
      expect(access).to.be.false;
      expect(collateralBalance).to.be.eq(0n);

      expect(pay.balances?.collateral).to.be.equal(ZERO);
      // const { colBalAfter, colBalB4 } = await withdraw({
      //   owner: pay.pool.pool.addrs.safe as Address, 
      //   asset: baseAsset, 
      //   factory: flexpool, 
      //   spender: signer1, 
      //   collateral: collateralAsset,
      //   unit: create.pool.pool.big.unit
      // });
      const rs = await safeContract.getUserData(signer1Addr, create.pool.pool.big.recordId);
      expect(rs.collateralBalance).to.be.eq(0n);
      
      const prof = (await flexpool.getProfile(create.pool.pool.big.unit, signer1Addr)).profile;
      expect(prof.colBals).to.be.equal(ZERO);
      expect(await signer1.provider?.getBalance(pay.pool.pool.addrs.safe)).to.be.equal(ZERO);
      // expect(bn(colBalAfter).gt(bn(colBalB4))).to.be.true;
    });
  })
})