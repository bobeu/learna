import { TrxnType, } from "../utilities";
import { proposeTransaction, signTransaction } from "../utils"
import { deployContracts } from "../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Address } from "../types";
import { zeroAddress } from "viem";

describe("Token distributor", function () {
  async function deployContractsFixcture() {
    return { 
      ...await deployContracts(ethers.getSigners),
    };
  }

  describe("When signers propose and signed a set-quorum transaction, during execution, the proposed quorum parameter is checked against valid executors, if greater, the transaction must not pass", function () {
    it("Revert if quorum exceed valid executors", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, deployer, alc1Addr, signer3}, signers_distributor } = await loadFixture(deployContractsFixcture);
      const newQuorum = BigInt(signers_distributor.length + 1);
      const { txType, id } = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: newQuorum, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.SETQUORUM,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      await signTransaction({signer: deployer, requestId: id, contract: distributor});
      await expect( 
        distributor.connect(signer3).executeTransaction(id)
      ).to.be.revertedWith("Quorum exceeds valid executors");
      // ).to.be.revertedWith("Quorum exceed valid executors"); // swap this if the test failed
  
      expect(txType).to.be.eq(TrxnType.SETQUORUM);
    });
  })
})

