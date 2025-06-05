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

  describe("When users lost access to their token, provided they had previously set up a lock, they can retrieve the locked token via the attorney contract", function () {
    it("Should revert if value is less than expected fee", async () => {
      const { collateralAsset, attorney, signers: { signer1: escapeToAddr, deployer, deployerAddr,}, } = await loadFixture(deployContractsFixcture);
      const lockedAmt = 10000n;
      const fee = 1000000000000000n
      await collateralAsset.connect(deployer).lockToken(escapeToAddr, lockedAmt);
      await expect(attorney.connect(deployer).panicUnlock(deployerAddr, {value: fee}))
      .to.be.revertedWith("Insufficient value for fee");
    });
  });
});


