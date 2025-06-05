import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { COLLATER_COVERAGE_RATIO, DURATION_IN_HOURS, DURATION_IN_SECS, INTEREST_RATE, QUORUM, } from "../utilities";
import { borrow, createPermissionedPool, provideLiquidity,} from "../utils";
import { parseEther } from "viem";

describe("Providers", function () {
  const amount = parseEther('500');
  const rate = 0.02 * 100;
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners), amount, rate };
  }
  
  describe("Contributors are able to finance unit contribution through external providers", function () {
    it("Signer should borrow. This should successfully add user to existing flexpool if it exist and user meet requirements", async function () {
      const {
        baseAsset,
        rate,
        collateralAsset,
        flexpool,
        amount,
        signers : { signer1, deployer, signer3, alc1, alc2, signer3Addr, signer1Addr },
        providers,
        providersAddr
      } = await loadFixture(deployContractsFixcture);
      
      await createPermissionedPool(
        {
          asset: baseAsset,
          colCoverage: COLLATER_COVERAGE_RATIO,
          durationInHours: DURATION_IN_HOURS,
          factory: flexpool,
          intRate: INTEREST_RATE,
          signer: alc1,
          unitLiquidity: amount,
          contributors: [alc1, alc2, signer3],
          deployer,
          collateralToken: collateralAsset
        }
      );
      const prov = await provideLiquidity({deployer, signer: signer1, amount, asset: baseAsset, contract: providers, contractAddr: providersAddr, rate, signerAddr: signer1Addr});
      const { pool, } = await borrow({amount, contract:providers, flexpool, providersSlots: [prov.profile.slot], signer: signer3, signerAddr: signer3Addr});
      expect(pool.pool.big.unit).to.be.eq(amount);
      expect(pool.pool.big.currentPool).to.be.eq(amount * 2n);
      expect(pool.pool.low.maxQuorum).to.be.eq(QUORUM);
      expect(pool.pool.low.duration).to.be.eq(DURATION_IN_SECS);
      expect(pool.pool.low.colCoverage).to.be.eq(COLLATER_COVERAGE_RATIO);
    });
  })
})