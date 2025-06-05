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
} from "../../utilities";
import { createPermissionlessPool, getFinance, joinEpoch, payback, withdraw } from "../../utils";
import { Address } from "../../types";

describe("Permissionless: Complete An Epoch", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("The process of an epoch starts with creating a pool, contribute, getFinance, and payback", function () {
    it("Should create pool, contribute, get Finance, payback, and distribute quota to participants", async function () {
      const {
        baseAsset,
        flexpool,
        collateralAsset,
        signers : { signer1, signer2, deployer, signer1Addr, signer2Addr, },
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

      /**
       * Signer1 borrow.
       */
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
      
      await withdraw({
        asset: baseAsset,
        owner: formatAddr(gf.pool.pool.addrs.safe),
        spender: signer1,
        collateral: collateralAsset,
        safeAddr: create.pool.pool.addrs.safe as Address
      });

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

      await withdraw({
        asset: baseAsset,
        owner: formatAddr(pay.pool.pool.addrs.safe),
        spender: signer1,
        collateral: collateralAsset,
        safeAddr: create.pool.pool.addrs.safe as Address
      });

      expect(bn(pay.profile.colBals).lt(bn(gf.profile.colBals))).to.be.true;
      const prof = (await flexpool.getProfile(create.pool.pool.big.unit, signer1Addr)).profile;
      expect(prof.colBals).to.be.equal(ZERO);

      /**
       * Signer2 Borrow and payback
       */
      const gf_2 = await getFinance({
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        signers: [signer2],
        colQuote: quoted,
        collateral: collateralAsset,
        asset: baseAsset,
        deployer
      });
      
      await withdraw({
        asset: baseAsset,
        owner: formatAddr(gf_2.pool.pool.addrs.safe),
        spender: signer2,
        collateral: collateralAsset,
        safeAddr: create.pool.pool.addrs.safe as Address
      });

      const durOfChoiceInSec_2 = await time.latest() + DURATION_IN_SECS;
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
        pool: create.pool.pool
      }); 

      await withdraw({
        owner: create.pool.pool.addrs.safe as Address,
        asset: baseAsset,
        collateral: collateralAsset,
        spender: signer2,
        safeAddr: create.pool.pool.addrs.safe as Address
      });

      // When the last participant GF, the epoch is finalized, and th whole pool is wiped out. So collateral balances should read zero.
      const { pastPools } = await flexpool.getFactoryData();
      const filtered = pastPools.filter(({pool: {big: { unit}}}) => unit === create.pool.pool.big.unit);
      const pool = filtered?.[0].pool;
      expect(pay_2.profile.colBals).to.be.equal(ZERO);
      expect(pool.big.currentPool).to.be.equal(ZERO);

      // We check the user's collateral balances with the safe are intact
      const safeContract = await retrieveSafeContract(formatAddr(gf.pool.pool.addrs.safe));
      const s1 = await safeContract.getUserData(signer1Addr, create.pool.pool.big.recordId);
      const s2 = await safeContract.getUserData(signer2Addr, create.pool.pool.big.recordId);
      expect(s1.access).to.be.false;
      expect(s2.access).to.be.false;
      expect(s1.collateralBalance).to.be.eq(ZERO);
      expect(s2.collateralBalance).to.be.eq(ZERO);
      
  
      await withdraw({
        owner: create.pool.pool.addrs.safe as Address,
        asset: baseAsset,
        collateral: collateralAsset,
        spender: signer1,
        safeAddr: create.pool.pool.addrs.safe as Address
      });
      const s1After = await safeContract.getUserData(signer1Addr, create.pool.pool.big.recordId);
      const s2After = await safeContract.getUserData(signer2Addr, create.pool.pool.big.recordId);
      const { aggregateFee, totalClients} = await safeContract.getData();
      const data = await safeContract.getData();
      const safeBalance2 = await baseAsset.balanceOf(gf.pool.pool.addrs.safe);

      expect(s1After.access).to.be.false;
      expect(s2After.access).to.be.false;
      expect(s1After.collateralBalance).to.be.eq(ZERO);
      expect(s2After.collateralBalance).to.be.eq(ZERO);;
      expect(totalClients).to.be.eq(ZERO);
      expect(aggregateFee).to.be.eq(ZERO);
      expect(bn(safeBalance2).gte(bn(data.aggregateFee))).to.be.true;
    });
  })
})