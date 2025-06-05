import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { bn, ZERO } from "../utilities";
import { provideLiquidity, removeLiquidity } from "../utils";
import { parseEther } from "viem";

describe("Providers", function () {
  const amount = parseEther('500');
  const rate = 0.02 * 100;
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners), amount, rate };
  }
  
  describe("Users can utilize idle stable assets by providing to help finance unit contribution", function () {
    it("Signer should remove liquidty successfully", async function () {
      const {
        baseAsset,
        rate,
        amount,
        signers : { signer1, deployer, signer1Addr },
        providers,
        providersAddr
      } = await loadFixture(deployContractsFixcture);
    
      await provideLiquidity({deployer, signer: signer1, amount, asset: baseAsset, contract: providers, contractAddr: providersAddr, rate, signerAddr: signer1Addr});
      const { profile, size } = await removeLiquidity({contract: providers, signer: signer1, signerAddr: signer1Addr});
      expect(size).to.be.equal(1);
      expect(profile.account).to.be.eq(signer1Addr);
      expect(profile.rate).to.be.eq(BigInt(rate));
      expect(profile.amount).to.be.eq(ZERO);
      expect(profile.accruals.intPerSec).to.be.eq(ZERO);
      expect(profile.accruals.fullInterest).to.be.eq(ZERO);
      expect(profile.earnStartDate).to.be.eq(ZERO);
      expect(profile.slot).to.be.eq(ZERO);
    });
  })
})