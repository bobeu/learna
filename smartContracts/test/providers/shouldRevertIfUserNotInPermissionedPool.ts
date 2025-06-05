import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { COLLATER_COVERAGE_RATIO, DURATION_IN_HOURS, INTEREST_RATE, } from "../utilities";
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
        flexpoolAddr,
        amount,
        signers : { signer1, alc1, alc1Addr, deployer, signer2, signer3, signer2Addr, signer3Addr },
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
          signer: signer1,
          unitLiquidity: amount,
          contributors: [signer1, signer2],
          deployer,
          collateralToken: collateralAsset
        }
      );
      const prov = await provideLiquidity({deployer, signer: signer3, amount, asset: baseAsset, contract: providers, contractAddr: providersAddr, rate, signerAddr: signer3Addr});
      await expect(
        borrow({
          amount, 
          contract:providers, 
          flexpool, 
          providersSlots: [prov.profile.slot], 
          signer: alc1, 
          signerAddr: alc1Addr
        })
      ).to.be.revertedWith("9")
    });
  })
})