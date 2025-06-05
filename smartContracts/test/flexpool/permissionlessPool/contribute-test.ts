import { deployContracts, retrieveSafeContract } from "../../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  UNIT_LIQUIDITY,
  COLLATER_COVERAGE_RATIO,
  DURATION_IN_HOURS,
  ZERO,
  INTEREST_RATE,
  formatAddr,
  TOTAL_LIQUIDITY,
  QUORUM,
} from "../../utilities";
import { createPermissionlessPool, joinEpoch } from "../../utils";

describe("Permissionless: Contribute", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
    describe("Contribute liquidity to existing pool", function () {
         it("Should add users and contribute quota to the pool successfully", async function () {
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
    
          const {
            balances: { base, collateral }, 
            pool: { pool: {big: { currentPool,}}},
            profiles: [s1, s2]
          } = await joinEpoch({
            deployer,
            unit: create.pool.pool.big.unit,
            factory: flexpool,
            factoryAddr: formatAddr(flexpoolAddr),
            signers: [signer2, signer3],
            testAsset: baseAsset,
            collateral: collateralAsset
          });
    
          expect(currentPool).to.be.equal(TOTAL_LIQUIDITY);
          expect(base).to.be.equal(TOTAL_LIQUIDITY);
          expect(collateral).to.be.equal(ZERO);
          expect(s1.id).to.be.equal(signer2Addr);
          expect(s2.id).to.be.equal(signer3Addr);
    
          const safeContract = await retrieveSafeContract(formatAddr(create.pool.pool.addrs.safe));
          const safeData = await safeContract.getData();
          // Assertions
          expect(safeData.aggregateFee).to.be.eq(ZERO);
          expect(safeData.totalClients).to.be.eq(3n);
        });
    })
})