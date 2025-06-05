import { bn } from "../utilities";
import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "viem";

describe("Collateral asset", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners), };
  }

  describe("Balance minted", function () {
    it("Check that the total amount minted to initial token receiver is correct.", async () => {
      const { signers: { deployerAddr }, collateralAsset, distributorAddr} = await loadFixture(deployContractsFixcture);
      const bals = await collateralAsset.accountBalances(distributorAddr); 
      const totalSupply = await collateralAsset.totalSupply()
      const deployerBal = await collateralAsset.balanceOf(deployerAddr);
      const balOfDistributor = await collateralAsset.balanceOf(distributorAddr);
      const totalBalOfDistributor = bals.locked.value + bals.spendable;
      expect(bn(totalBalOfDistributor).gt(bn(bals.spendable))).to.be.true;
      expect(balOfDistributor).to.be.equal(bals.spendable);
      expect(deployerBal).to.be.equal(parseEther('200000000'));
      expect(bals.spendable).to.be.equal(totalSupply - (bals.locked.value + deployerBal));
      expect(bals.locked.value).to.be.equal(totalSupply - (bals.spendable + deployerBal));
    });
  });
});


