import { deployContracts, } from "../../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  bn,
  UNIT_LIQUIDITY,
  COLLATER_COVERAGE_RATIO,
  DURATION_IN_HOURS,
  ZERO,
  INTEREST_RATE,
  FuncTag,
} from "../../utilities";
import { createPermissionedPool, removeLiquidityPool, withdraw } from "../../utils";

describe("Permissioned: Remove a pool", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("The creator of a pool can remove the liquidity and cancel the pool based on a certain condition", function () {
    it("Should cancel pool and remove liqudity successfully", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, deployer, signer1Addr,}, } = await loadFixture(deployContractsFixcture);

      const create = await createPermissionedPool({
        asset: baseAsset,
        colCoverage: COLLATER_COVERAGE_RATIO,
        durationInHours: DURATION_IN_HOURS,
        factory: flexpool,
        intRate: INTEREST_RATE,
        signer: signer1,
        unitLiquidity: UNIT_LIQUIDITY,
        contributors: [signer1, signer2],
        deployer,
        collateralToken: collateralAsset
      });

      const balB4Removal = await baseAsset.balanceOf(signer1Addr);
      
      await removeLiquidityPool({
        factory:flexpool,
        unit: create.pool.pool.big.unit,
        signer: signer1
      });
      
      const signerBalAfterRemoval = await baseAsset.balanceOf(signer1Addr);
      
      // Balances after removal should remain intact
      expect(signerBalAfterRemoval > balB4Removal).to.be.true;
      const { pastPools } = (await flexpool.getFactoryData());
      const filteredRecord = pastPools.filter(({pool: {big}}) => big.unit === create.pool.pool.big.unit);
      const record = filteredRecord?.[0];
      expect(record.pool.stage).to.be.eq(FuncTag.CANCELED);

      /**
       * This is an indication that a pool was removed.
       */
      expect((await flexpool.getPoolData(create.pool.pool.big.unit)).pool.low.maxQuorum).to.be.equal(ZERO);
    });
  })
})