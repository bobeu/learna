import { deployContracts, } from "../../deployments";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  UNIT_LIQUIDITY,
  COLLATER_COVERAGE_RATIO,
  DURATION_IN_HOURS,
  ZERO,
  INTEREST_RATE,
  formatAddr,
  DURATION_IN_SECS,
  ONE_HOUR_ONE_MINUTE,
} from "../../utilities";
import { createPermissionlessPool, getFinance, joinEpoch, liquidate, payback, withdraw } from "../../utils";

describe("Permissionless: Go as intended", function () {
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

      const create = await createPermissionlessPool(
        {
          asset: baseAsset,
          colCoverage: COLLATER_COVERAGE_RATIO,
          durationInHours: DURATION_IN_HOURS,
          factory: flexpool,
          intRate: INTEREST_RATE,
          quorum: 2,
          signer: signer1,
          unitLiquidity: UNIT_LIQUIDITY,
          deployer,
          collateralToken: collateralAsset
        }
      );

      await joinEpoch({
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        factoryAddr: formatAddr(flexpoolAddr),
        signers: [signer2],
        testAsset: baseAsset,
        collateral: collateralAsset
      });

      const quoted = await flexpool.connect(signer1).getCollateralQuote(create.pool.pool.big.unit);
      const gf = await getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer1],
        colQuote: quoted,
        collateral: collateralAsset,
        deployer,
        asset: baseAsset
      });

      // Fastrack block time
      const future = BigInt((await time.latest()) + DURATION_IN_SECS + ONE_HOUR_ONE_MINUTE);
      await time.increaseTo(future);

      const debtToDate = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer1Addr);
      await liquidate({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer3],
        debt: debtToDate,
        collateral: collateralAsset
      });

      const quote2 = await flexpool.getCollateralQuote(create.pool.pool.big.unit);
      const gf_2 = await getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer2],
        colQuote: quote2,
        collateral: collateralAsset,
        deployer,
        asset: baseAsset
      });
      
      const durOfChoiceInSec_2 = await time.latest() + DURATION_IN_SECS;
      await time.increaseTo(durOfChoiceInSec_2);
      const debtToDate_2 = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer2Addr);
      const pay_2 = await payback({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
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

      // Checking that the slot for the just-concluded epoch is empty
      const _p = await flexpool.getPoolData(create.pool.pool.big.unitId);
      expect(_p.pool.low.allGh).to.be.eq(ZERO);
      expect(_p.pool.low.colCoverage).to.be.eq(ZERO);
      expect(_p.pool.low.duration).to.be.eq(ZERO);
      expect(_p.pool.big.unit).to.be.eq(ZERO);
      expect(_p.pool.big.unitId).to.be.eq(ZERO);
      expect(_p.pool.big.currentPool).to.be.eq(ZERO);

      // Checking record
      const recordEpoches = (await flexpool.getFactoryData()).currentEpoches;
      expect(recordEpoches).to.be.eq(1n);
      const { pastPools } = (await flexpool.getFactoryData());
      const filteredRecord = pastPools.filter(({pool: {big}}) => big.unit === create.pool.pool.big.unit);
      const record = filteredRecord?.[0];
      expect(record.pool.big.unit).to.be.eq(gf_2.pool.pool.big.unit);
      expect(record.cData.length).to.be.eq(2n);
      
    });
  })
})