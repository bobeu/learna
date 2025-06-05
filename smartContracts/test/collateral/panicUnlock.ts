import { ZERO, FEE, } from "../utilities";
import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "viem";

describe("Collateral asset", function () {
  async function deployContractsFixcture() {
    return { 
      ...await deployContracts(ethers.getSigners),
    };
  }

  describe("When users lost access to their token, provided they had previously set up a lock, they can retrieve the locked token via the attorney contract", function () {
     it("Panic unlock throught the token Attorney assuming the user lost access to their private keys", async () => {
      const { collateralAsset, attorney, signers: { signer1: escapeToAddr, deployer, deployerAddr,}, } = await loadFixture(deployContractsFixcture);
      const lockedAmt = parseEther('100000');
      await collateralAsset.connect(deployer).lockToken(escapeToAddr, lockedAmt);
      const balsOfEscapeB4UnLocked = await collateralAsset.accountBalances(escapeToAddr);
      const balOfEscapeB4Unlocked = await collateralAsset.balanceOf(escapeToAddr);
      const balOfDeployer = await collateralAsset.accountBalances(deployerAddr);
      await attorney.connect(deployer).panicUnlock(deployerAddr, {value: FEE});
      const balOfDeployerAfterUnlocked = await collateralAsset.accountBalances(deployerAddr);
      const balsOfEscapeAfterUnLocked = await collateralAsset.accountBalances(escapeToAddr);
      expect(balsOfEscapeB4UnLocked.locked.value).to.be.eq(ZERO);
      expect(balsOfEscapeB4UnLocked.spendable).to.be.eq(ZERO);
      expect(balsOfEscapeAfterUnLocked.locked.value).to.be.eq(ZERO);
      expect(balsOfEscapeAfterUnLocked.spendable).to.be.eq(balOfDeployer.spendable + balOfDeployer.locked.value);
      expect(balOfEscapeB4Unlocked).to.be.eq(balsOfEscapeB4UnLocked.spendable);
      expect(balOfDeployerAfterUnlocked.spendable).to.be.eq(ZERO);
      expect(balOfDeployerAfterUnlocked.locked.value).to.be.eq(ZERO);
    });
  });
});


