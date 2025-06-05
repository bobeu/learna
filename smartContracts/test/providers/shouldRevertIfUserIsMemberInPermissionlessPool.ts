import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { COLLATER_COVERAGE_RATIO, DURATION_IN_HOURS, INTEREST_RATE, QUORUM, } from "../utilities";
import { borrow, createPermissionlessPool, joinEpoch, provideLiquidity,} from "../utils";
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
        flexpoolAddr,
        amount,
        signers : { signer1, deployer, signer2, signer2Addr, signer1Addr },
        providers,
        providersAddr
      } = await loadFixture(deployContractsFixcture);
      
      await createPermissionlessPool(
        {
          asset: baseAsset,
          colCoverage: COLLATER_COVERAGE_RATIO,
          durationInHours: DURATION_IN_HOURS,
          factory: flexpool,
          intRate: INTEREST_RATE,
          quorum: QUORUM,
          signer: signer1,
          unitLiquidity: amount,
          deployer,
          collateralToken: collateralAsset
        }
      );

      await joinEpoch({
        deployer,
        unit: amount,
        factory: flexpool,
        factoryAddr: flexpoolAddr,
        signers: [signer2],
        testAsset: baseAsset,
        collateral: collateralAsset
      });
      const prov = await provideLiquidity({deployer, signer: signer1, amount, asset: baseAsset, contract: providers, contractAddr: providersAddr, rate, signerAddr: signer1Addr});
      await expect(
        borrow({
          amount, 
          contract:providers, 
          flexpool, 
          providersSlots: [prov.profile.slot], 
          signer: signer2, 
          signerAddr: signer2Addr
        })
      ).to.be.revertedWith("10")
    });
  })
})