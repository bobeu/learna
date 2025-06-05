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
    it("Should revert if caller does not have any locked amount", async () => {
      const { attorney, signers: { deployer, deployerAddr}, } = await loadFixture(deployContractsFixcture);
      const fee = 1000000000000000n
      await expect(attorney.connect(deployer).panicUnlock(deployerAddr, {value: fee}))
      .to.be.revertedWith("No lock detected");
    });
  });
});


