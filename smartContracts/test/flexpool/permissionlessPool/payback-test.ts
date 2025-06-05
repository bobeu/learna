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
  QUORUM,
} from "../../utilities";
import { createPermissionlessPool, getFinance, joinEpoch, payback, withdraw } from "../../utils";
import { Address } from "../../types";

describe("Permissionless: Payback", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("When a contributor get finance, they must return the loan before the duration elapse", function () {
    it("Signer1 should payback successfully", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, signer3, deployer, signer1Addr, },
        flexpoolAddr 
      } = await loadFixture(deployContractsFixcture);

      const signers = [signer2, signer3];
      const create = await createPermissionlessPool(
        {
          asset: baseAsset,
          colCoverage: COLLATER_COVERAGE_RATIO,
          durationInHours: DURATION_IN_HOURS,
          factory: flexpool,
          intRate: INTEREST_RATE,
          quorum: QUORUM,
          signer: signer1,
          unitLiquidity: UNIT_LIQUIDITY,
          deployer,
          collateralToken: collateralAsset
        }
      );

      const join = await joinEpoch({
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        factoryAddr: formatAddr(flexpoolAddr),
        signers,
        testAsset: baseAsset,
        collateral: collateralAsset
      });

      // GetFinance should be unlocked
      const quoted = await flexpool.connect(signer1).getCollateralQuote(create.pool.pool.big.unit);
      const gf = await getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer1],
        colQuote: quoted,
        asset: baseAsset,
        collateral: collateralAsset,
        deployer
      });

      expect(gf.pool.pool.big.currentPool).to.be.equal(ZERO);
      
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
       * factory contract since factory will always reply on the interest up to the current block. 
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

      // After borrower repaid loan, the pool balance should be replenished.
      expect(pay.pool.pool.big.currentPool).to.be.equal(join.pool.pool.big.currentPool);
      
      // Collateral balances.
      expect(bn(pay.profile.colBals).isZero()).to.be.true;

      // We check the user's collateral balances with the bank are intact
      const bankContract = await retrieveSafeContract(formatAddr(gf.pool.pool.addrs.safe));
      const { access, collateralBalance} = await bankContract.getUserData(signer1Addr, create.pool.pool.big.recordId);
      expect(access).to.be.false;
      expect(collateralBalance).to.be.eq(0n);
      expect(bn(pay.balances?.collateral).lt(bn(gf.balances?.collateral))).to.be.true;

      const rs = await bankContract.getUserData(signer1Addr, create.pool.pool.big.recordId);
      expect(rs.collateralBalance).to.be.eq(0n);
      
      const prof = (await flexpool.getProfile(create.pool.pool.big.unit, signer1Addr)).profile;
      expect(prof.colBals).to.be.equal(ZERO);
      expect(await signer1.provider?.getBalance(pay.pool.pool.addrs.safe)).to.be.equal(ZERO);
    });
  })
})