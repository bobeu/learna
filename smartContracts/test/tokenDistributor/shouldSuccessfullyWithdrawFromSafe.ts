import { COLLATER_COVERAGE_RATIO, DURATION_IN_HOURS, formatAddr, INTEREST_RATE, QUORUM, TrxnType, UNIT_LIQUIDITY, } from "../utilities";
import {createPermissionlessPool, executeTransaction, joinEpoch, proposeTransaction, signTransaction } from "../utils"
import { deployContracts } from "../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Address } from "../types";
import { zeroAddress } from "viem";

describe("Token distributor", function () {
  async function deployContractsFixcture() {
    return { 
      ...await deployContracts(ethers.getSigners),
    };
  }
  describe("We're introducing a method that mitigate against indefinite locking of funds in the event such a bug occurs, our multiSig account should be able to access safe and smoothly withdraw assets", function () {
    it("Create a set quorum request if quorum exceeds valid executors", async function () {
      const { 
        distributor,
        baseAsset,
        baseAssetAddr,
        flexpool,
        flexpoolAddr,
        collateralAsset,
        signers: { signer1, signer3, signer2, alc1Addr, deployer}, 
        signers_distributor } = await loadFixture(deployContractsFixcture);
      const newQuorum = signers_distributor.length + 1;

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

      const {balances, } = await joinEpoch({
        deployer,
        unit: create.pool.pool.big.unit,
        factory: flexpool,
        factoryAddr: formatAddr(flexpoolAddr),
        signers: [signer2, signer3],
        testAsset: baseAsset,
        collateral: collateralAsset
      });
      
      // Balances before emergency withdrawal
      const initBalancesInSafe = await baseAsset.balanceOf(create.pool.pool.addrs.safe);
      const initBalanceOfAlc1 = await baseAsset.balanceOf(alc1Addr);

      /**
       * At this the quorum is completed. We will asssume there is a bug in safe contract, and initiate 
       * an emergency withdrawal transaction
       */
  
      if(newQuorum > signers_distributor.length) {
        // Firstly, add new signer to increase the valid executors list
        const { txType, id } = await proposeTransaction({
          signer: signer1, 
          recipient: alc1Addr as Address, 
          amount: 0n, 
          contract: distributor, 
          delayInHrs: 0, trxType: 
          TrxnType.SAFEWITHDRAWAL,
          safe: create.pool.pool.addrs.safe as Address,
          token: baseAssetAddr
        });
        await signTransaction({signer: deployer, requestId: id, contract: distributor});
        await executeTransaction({signer: signer3, contract: distributor, reqId: id});

        // Balances after emergency withdrawal
        const balancesInSafeAfter = await baseAsset.balanceOf(create.pool.pool.addrs.safe);
        const balanceOfAlc1After = await baseAsset.balanceOf(alc1Addr);

        expect(balanceOfAlc1After > initBalanceOfAlc1).to.be.true;
        expect(initBalancesInSafe > 0n).to.be.true;
        expect(balancesInSafeAfter === 0n).to.be.true;
      }

    });
  });
})

