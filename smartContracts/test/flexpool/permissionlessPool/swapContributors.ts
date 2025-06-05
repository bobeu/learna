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
  QUORUM,
} from "../../utilities";
import { createPermissionlessPool, getFinance, joinEpoch, payback } from "../../utils";

describe("Permissionless: Swap contributors", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Since time is of essence, when a contributor delay to get Finance, another contributor can take their position", function () {
    it("Should swap participant successfully", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, signer3, deployer, signer2Addr, signer3Addr },
        flexpoolAddr 
      } = await loadFixture(deployContractsFixcture);

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

      await joinEpoch({
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        factoryAddr: formatAddr(flexpoolAddr),
        signers: [signer2, signer3],
        testAsset: baseAsset,
        collateral: collateralAsset
      });

      /**
       * Revert. 
      */
      const quoted1 = await flexpool.connect(signer1).getCollateralQuote(create.pool.pool.big.unit);
      console.log("quoted1",quoted1)
      await expect(getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer3],
        colQuote: quoted1,
        collateral: collateralAsset,
        deployer,
        asset: baseAsset
      })).to.be.revertedWith("16");
      
      /**
       * NOTE: IN THE FACTORY CONTRACT, WHEN THE REQUIRED QUORUM IS ACHIEVED, GETFINANCE IS OPENED 
       * TO THE NEXT BORROWER IN THE CONTRACT. IT HAPPENS ON FIRST-COME-FIRST-SERVED BASIS USING THE
       * SELECTOR. EXPECTED BORROWER HAVE AT LEAST ONE HOUR FROM THE TIME QUORUM IS ACHIEVED TO GF
       * OTHERWISE THEY CAN BE LIQUIDATED.
      */

      const futureGthanTurnTime = await time.latest() +  ONE_HOUR_ONE_MINUTE;
      await time.increaseTo(futureGthanTurnTime);

    //   const safeContract = await retrieveContract(formatAddr(pool.pool.addrs.safe));
      const quoted = await flexpool.connect(signer1).getCollateralQuote(create.pool.pool.big.unit);

      /**
       * Signer3 takes advantage of signer1 procastination.
       */
      const gf = await getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer3],
        colQuote: quoted,
        collateral: collateralAsset,
        deployer,
        asset: baseAsset
      });
      
      /**
       * We need to fastrack the block time to near the duration of choice of the borrower
       * to avoid being liquidated.
       * Note: DURATION_OF_CHOICE_IN_SEC is same as DURATION_OF_CHOICE_IN_HR but we 
       * reduce DURATION_OF_CHOICE_IN_SEC by 2sec to account for execution time.
       */
      const durOfChoiceInSec = BigInt((await time.latest()) + (DURATION_IN_SECS));
      await time.increaseTo(durOfChoiceInSec);
      const debtToDate = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer3Addr);

      /**
       * We increase the time to give 3 sec for execution which is why we multiply interest per sec
       * by the number of seconds we increased by. This is to enable us give enough allowance to the 
       * factory contract since factory will always reply on the interest up to the current block. 
       */
      // const debt = BigInt(bn(debtToDate).plus(bn(gf.pool.pool.interest.intPerSec).times(bn(3))).toString());
      const pay = await payback({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        debt: debtToDate,
        signers: [signer3],
        collateral: collateralAsset,
      }); 

      expect(pay.profile.colBals).to.be.equal(ZERO);
      const prof = (await flexpool.getProfile(create.pool.pool.big.unit, signer3Addr)).profile;
      expect(prof.colBals).to.be.equal(ZERO);
      const quoted_2 = await flexpool.connect(signer1).getCollateralQuote(create.pool.pool.big.unit);
      /**
       * Signer2 Borrow and payback
       */
      const gf_2 = await getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer2],
        colQuote: quoted_2,
        collateral: collateralAsset,
        deployer,
        asset: baseAsset
      });
      
      const durOfChoiceInSec_2 = BigInt((await time.latest()) + (DURATION_IN_SECS));
      await time.increaseTo(durOfChoiceInSec_2);
      const debtToDate_2 = await flexpool.getCurrentDebt(create.pool.pool.big.unit, signer2Addr);

      /**
       * We increase the time to give 3 sec for execution which is why we multiply interest per sec
       * by the number of seconds we increased by. This is to enable us give enough allowance to the 
       * factory contract since factory will always reply on the interest up to the current block. 
       */
      const pay_2 = await payback({
        asset: baseAsset,
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        debt: debtToDate_2,
        signers: [signer2],
        collateral: collateralAsset,
      }); 

      expect(pay_2.profile.colBals).to.be.equal(ZERO);
      expect(pay_2.pool.pool.big.currentPool).to.be.equal(pay.pool.pool.big.currentPool);
    });
  })
})