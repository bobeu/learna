import { ONE_HUNDRED_TOKEN, } from "../utilities";
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

  describe("Testing Token Logic", function () {
    it("Should increase allowance", async () => {
      const { collateralAsset, signers: { alc1Addr, deployer, deployerAddr, }, } = await loadFixture(deployContractsFixcture);

      await collateralAsset.connect(deployer).approve(alc1Addr, ONE_HUNDRED_TOKEN);
      expect(await collateralAsset.allowance(deployerAddr, alc1Addr)).to.be.equal(ONE_HUNDRED_TOKEN);
    });
  });
});


