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
import { createPermissionedPool, enquireLiquidation, getFinance, joinEpoch, withdraw } from "../../utils";
import { ZeroAddress } from "ethers/constants";

describe("Permissioned: Enquire Liquidation", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Liquidation is when a contributor getFinance and did not pay back the loan within due date", function () {
    it("If the due date has not passed, enquiring liquidation should return empty profile", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, deployer,},
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
        collateralToken:collateralAsset
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

      const currentTime = await time.latest();
      const durationInSec = currentTime + (DURATION_IN_SECS - ONE_HOUR_ONE_MINUTE);
      await time.increaseTo(durationInSec);
      const [profile, isDefaulted, value] = await enquireLiquidation({
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        signers: []
      });
      expect(profile.id).to.be.equal(ZeroAddress);
      expect(isDefaulted).to.be.false;
      expect(value.value).to.be.eq(ZERO);
    });
  })
})