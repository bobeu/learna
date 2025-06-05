import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { bn } from "../utilities";

describe("Collateral asset", function () {
  async function deployContractsFixcture() {
    return { 
        ...await deployContracts(ethers.getSigners),
    };
  }

  describe("Holders can unlock the asset they had previously locked to the protected ledger", function () {
    it("Should successfully unlock token in the protected ledger", async () => {
      const { collateralAsset,signers: { signer1: escapeToAddr, deployerAddr, deployer}, } = await loadFixture(deployContractsFixcture);
      const lockedAmt = 10000n;
      const unlockedAmt = 5000n;
      await collateralAsset.connect(deployer).lockToken(escapeToAddr, lockedAmt);
      const balsAfterLocked = await collateralAsset.accountBalances(deployerAddr);
      const balOfSenderAfterLocked = await collateralAsset.balanceOf(deployerAddr);
      const balOfEscapeToB4UnLocked = await collateralAsset.balanceOf(escapeToAddr);
      await collateralAsset.connect(deployer).unlockToken(unlockedAmt);
      const balsAfterUnLocked = await collateralAsset.accountBalances(deployerAddr);
      const balOfSenderAfterUnLocked = await collateralAsset.balanceOf(deployerAddr);
      const balOfEscapeToAfterUnLocked = await collateralAsset.balanceOf(escapeToAddr);
      expect(balsAfterUnLocked.locked.value).to.be.eq(balsAfterLocked.locked.value - unlockedAmt);
      expect(balOfSenderAfterUnLocked).to.be.eq(balOfSenderAfterLocked);
      expect(balOfEscapeToAfterUnLocked).to.be.eq(unlockedAmt);
      expect(bn(balOfEscapeToAfterUnLocked).gt(bn(balOfEscapeToB4UnLocked))).to.be.true;
    });
  });
});


