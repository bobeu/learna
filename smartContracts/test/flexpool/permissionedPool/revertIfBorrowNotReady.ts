import { deployContracts, } from "../../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  UNIT_LIQUIDITY,
  COLLATER_COVERAGE_RATIO,
  DURATION_IN_HOURS,
  INTEREST_RATE,
  formatAddr,
} from "../../utilities";
import { createPermissionedPool, getFinance, removeLiquidityPool, withdraw } from "../../utils";

describe("Permissioned: Reverts", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("", function () {
    it("Permissioned: Testing for reverts", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, deployer, }, 
      } = await loadFixture(deployContractsFixcture);

      const f = await createPermissionedPool({
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

      // Remove liquidity
      await removeLiquidityPool({
        factory: flexpool,
        unit: UNIT_LIQUIDITY,
        signer: signer1
      });

      // After removing liquidity, we should be able to resuse the current spot
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

      // await flexpool.getPoolData(create.pool.pool.big.unitId);

      // Calling getFinance should fail
      const quoted_2 = await flexpool.connect(signer2).getCollateralQuote(create.pool.pool.big.unit);
      await expect(getFinance({
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        signers: [signer2],
        colQuote: quoted_2,
        collateral: collateralAsset,
        asset: baseAsset,
        deployer
      })).to.be.revertedWith("14")

      /**
       * This is an indication that a pool was removed.
       */
      expect((await flexpool.getPoolData(create.pool.pool.big.unitId)).pool.low.maxQuorum).to.be.equal(signers.length);
    });
  })
})