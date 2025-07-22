import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { sortWeeklyEarning } from "../utils";
import { parseEther } from "viem";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should allocate weekly payout", function () {
    it("An admin should be able to allocate weekly earning payout with relevant data", async function () {
      const { learna, growToken, signers : { deployer },} = await loadFixture(deployContractsFixcture);
      const amountInERC20 = parseEther('10');
      const { 
        balanceInGrowReserveAfterAllocation,
        balanceInGrowReserveB4Allocation,
        balanceOfLearnaAfterAllocation,
        balanceOfLearnaB4Allocation,
        data
      } = await sortWeeklyEarning({amountInERC20, deployer, growToken, learna});

      expect(balanceInGrowReserveAfterAllocation < balanceInGrowReserveB4Allocation).to.be.true;
      expect(balanceOfLearnaAfterAllocation > balanceOfLearnaB4Allocation).to.be.true;
    });
  })
})