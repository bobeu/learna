import { deployContracts, } from "../../deployments";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  bn,
  UNIT_LIQUIDITY,
  COLLATER_COVERAGE_RATIO,
  DURATION_IN_HOURS,
  INTEREST_RATE,
  formatAddr,
  DURATION_IN_SECS,
  ONE_HOUR_ONE_MINUTE,
} from "../../utilities";
import { createPermissionlessPool, enquireLiquidation, getFinance, joinEpoch, withdraw } from "../../utils";

describe("Permissionless: Enquire Liquidation Success", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Liquidation is when a contributor getFinance and did not pay back the loan within due date", function () {
    it("If the due date has passed, enquiring liquidation should not return empty profile", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, deployer, signer1Addr, },
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
        asset: baseAsset,
        deployer
      });

      // Increase the duration
      const duration = BigInt((await time.latest()) + DURATION_IN_SECS + ONE_HOUR_ONE_MINUTE);
      await time.increaseTo(duration);

      /**
       * When the paydate has passed, enquiry should return defaulter's profile.
      */
      const [prof, defaulted, val] = await enquireLiquidation({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: []
      });
      
      expect(prof.id).to.be.equal(signer1Addr);
      expect(defaulted).to.be.true;
    });
  })
})