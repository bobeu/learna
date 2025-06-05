import { TrxnType,} from "../utilities";
import {executeTransaction, proposeTransaction, signTransaction } from "../utils"
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
  describe("A quorum is the minimum number of signatures required to execute a transaction", function () {
    it("Should create a set quorum request successfully", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, signer3, alc1Addr, deployer} } = await loadFixture(deployContractsFixcture);
      const newQuorum = 3n;  
      // Propose a new transaction to set quorum
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
      expect(txType).to.be.eq(TrxnType.SETQUORUM);
      await signTransaction({signer: deployer, requestId: id, contract: distributor});
      await executeTransaction({signer: signer3, contract: distributor, reqId: id});
      const quorum = await distributor.quorum();
      expect(txType).to.be.eq(TrxnType.SETQUORUM);
      expect(quorum).to.be.eq(newQuorum);
    });
  })
})

