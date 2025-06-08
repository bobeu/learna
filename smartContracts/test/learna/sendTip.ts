import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { sendTip,} from "../utils";
import { parseEther } from "viem";

describe("ProofOfLearningNFT", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners)};
  }
  
  describe("Tip function", function () {
    it("Should tip the Learna successfully", async function () {
      const { learna, signers : { signer1 }, } = await loadFixture(deployContractsFixcture);
      const tipAmount = parseEther('55');
      const base = parseEther('50');
      const {
        tippers,
        balanceOfLeanerB4Tipped,
        balanceOfLeanerAfterTipped 
      } = await sendTip({learna, signer: signer1, tipAmount});
      expect(tippers.length === 1).to.be.true;
      expect(tippers?.[0].points).to.be.eq(tipAmount % base);
      if(balanceOfLeanerAfterTipped && balanceOfLeanerB4Tipped) {
        expect(balanceOfLeanerAfterTipped > balanceOfLeanerB4Tipped).to.be.true;
      }
    });
  })
})