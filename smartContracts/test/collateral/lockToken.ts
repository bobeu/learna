import { ZERO, } from "../utilities";
import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Collateral asset", function () {
  async function deployContractsFixcture() {
    return { 
      ...await deployContracts(ethers.getSigners),
    };
  }

  describe("Holders can set up an instruction to lock specific amount in their standard ledger to the protected ledger. This ensures full protection on the locked amount in the event user lost access to their account", function () {
    it("Should successfully lock token to the protected ledger", async () => {
      const { collateralAsset,signers: { signer1Addr, deployer, deployerAddr,}, } = await loadFixture(deployContractsFixcture);
      //   Note: After deployment, an amount of INITIAL_MINT = 200000 was minted to the deployer account.
      const initBalOfSender = await collateralAsset.balanceOf(deployerAddr);
      const balsB4Locked = await collateralAsset.accountBalances(deployerAddr);
      const lockedAmt = 10000n;
      await collateralAsset.connect(deployer).lockToken(signer1Addr, lockedAmt);
      const balsAfterLocked = await collateralAsset.accountBalances(deployerAddr);
      const balOfSenderAfterLocked = await collateralAsset.balanceOf(deployerAddr);
      expect(balOfSenderAfterLocked).to.be.equal(initBalOfSender - lockedAmt);
      expect(balsB4Locked.locked.value).to.be.eq(ZERO);
      expect(balsAfterLocked.locked.value).to.be.eq(lockedAmt);
      expect(balsB4Locked.spendable).to.be.eq(initBalOfSender);
      expect(balsAfterLocked.locked.escapeTo).to.be.eq(signer1Addr);
    });
  });
});


