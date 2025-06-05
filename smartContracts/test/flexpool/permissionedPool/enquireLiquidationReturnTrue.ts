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
import { createPermissionedPool, enquireLiquidation, getFinance, joinEpoch, withdraw } from "../../utils";

describe("Permissioned: Enquire Liquidation Success", function () {
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
        colQuote: quoted ,
        collateral: collateralAsset,
        asset: baseAsset,
        deployer
      });
      
      // Increase the duration
      const currentTime = await time.latest();
      const duration = currentTime + DURATION_IN_SECS + ONE_HOUR_ONE_MINUTE;
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