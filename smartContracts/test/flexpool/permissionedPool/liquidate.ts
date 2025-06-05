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
  ONE_HOUR_ONE_MINUTE,
} from "../../utilities";
import { createPermissionedPool, getFinance, joinEpoch, liquidate, withdraw } from "../../utils";

describe("Permissioned: Liquidate", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Liquidation is when a contributor getFinance and did not pay back the loan within due date", function () {
    it("If the payback date has passed, liquidation should succeed", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, signer3, deployer, signer1Addr, signer3Addr },
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

      const join = await joinEpoch({
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

      const debtToDate = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer1Addr);
      // const defaulter = await flexpool.getProfile(create.pool.pool.big.unit, signer1Addr);
      const safeContract = await retrieveSafeContract(formatAddr(gf.pool.pool.addrs.safe));
      const s3BfLiq = await safeContract.getUserData(signer3Addr, create.pool.pool.big.recordId);
      expect(s3BfLiq.access).to.be.false;
      const { liq: {pool: pl, profile: pr }, baseBalAfterLiq, colBalAfterLiq, colBalB4Liq} = await liquidate({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory:flexpool,
        signers: [signer3],
        debt: debtToDate,
        collateral: collateralAsset
      });
      const s3AfterLiq = await safeContract.getUserData(signer3Addr, create.pool.pool.big.recordId);
      expect(s3AfterLiq.access).to.be.false;
      expect(s3AfterLiq.collateralBalance).to.be.eq(ZERO);

      expect(pr.id).to.be.equal(signer3Addr);
      expect(pr.colBals).to.be.equal(ZERO);
      expect(bn(pr.paybackTime).gte(bn(gf.profile.paybackTime))).to.be.true;
      expect(bn(baseBalAfterLiq).gte(bn(ZERO))).to.be.true;
      expect(colBalAfterLiq > colBalB4Liq).to.be.true;
      
      expect(pl.pool.big.currentPool).to.be.equal(join.pool.pool.big.currentPool);
      const s1 = await safeContract.getUserData(signer1Addr, create.pool.pool.big.recordId);
      const s3AfterWit = await safeContract.getUserData(signer3Addr, create.pool.pool.big.recordId);

      expect(s1.access).to.be.false;
      expect(s1.collateralBalance).to.be.eq(ZERO);
      
      expect(s3AfterWit.access).to.be.false;
      expect(s3AfterWit.collateralBalance).to.be.eq(ZERO);
    });
  })
})