import { deployContracts, } from "../../deployments";
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
  ONE_HOUR_ONE_MINUTE,
} from "../../utilities";
import { createPermissionedPool, getFinance, joinEpoch, liquidate, payback, withdraw } from "../../utils";

describe("Permissioned: Go as intended", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Process should go as intended after liquidation", function () {
    it("Should complete an epoch successfully and begin another one", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, signer3, deployer, signer1Addr, signer2Addr, },
        flexpoolAddr 
      } = await loadFixture(deployContractsFixcture);

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

      await joinEpoch({
        deployer,
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        factoryAddr: formatAddr(flexpoolAddr),
        signers: [signer2],
        testAsset: baseAsset,
        collateral: collateralAsset
      });

      const quoted = await flexpool.connect(signer2).getCollateralQuote(create.pool.pool.big.unit);
      const gf = await getFinance({
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        signers: [signer1],
        colQuote: quoted,
        collateral: collateralAsset,
        asset: baseAsset,
        deployer
      });

      // Fastrack block time
      const future = BigInt((await time.latest()) + DURATION_IN_SECS + ONE_HOUR_ONE_MINUTE);
      await time.increaseTo(future);

      // Note that Signer1 is the debtor in this case, we're yet to swap the profiles in the contract,
      // If we use signer3Addr, the debt will read 0, and liquidation will fail.
      const debtToDate = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer1Addr);
      
      await liquidate({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        signers: [signer3],
        debt: debtToDate,
        collateral: collateralAsset
      });

      const quote2 = await flexpool.getCollateralQuote(create.pool.pool.big.unit);
      const gf_2 = await getFinance({
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        signers: [signer2],
        colQuote: quote2,
        collateral: collateralAsset,
        asset: baseAsset,
        deployer
      });
      
      const duration = BigInt((await time.latest()) + (DURATION_IN_SECS));
      await time.increaseTo(duration);
      const debtToDate_2 = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer2Addr);
      const pay_2 = await payback({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        debt: debtToDate_2,
        signers: [signer2],
        collateral: collateralAsset,
        pool: create.pool.pool
      }); 

      // Before withdrawing collateral, the balance should be intact.
      expect(pay_2.profile.colBals).to.be.equal(ZERO);
      const prof_2 = (await flexpool.getProfile(create.pool.pool.big.unit, signer2Addr)).profile;

      // Before withdrawing collateral, the balance should be intact.
      expect(prof_2.colBals).to.be.equal(ZERO);

      // Checking record
      const { recordEpoches, pastPools } = (await flexpool.getFactoryData());
      expect(recordEpoches).to.be.eq(1n);
      const filteredRecord = pastPools.filter(({pool: {big}}) => big.unit === create.pool.pool.big.unit);
      const record = filteredRecord?.[0];
      expect(record.pool.big.unit).to.be.eq(gf_2.pool.pool.big.unit);
      expect(record.cData.length).to.be.eq(2n);
    });
  })
})