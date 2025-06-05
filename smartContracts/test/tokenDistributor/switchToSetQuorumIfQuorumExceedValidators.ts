import { TrxnType, } from "../utilities";
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
  describe("At any point in time, quorum should not exceed valid executors, but if a signer propose a set-quorum transaction, and the parameter exceeds valid executor, the logic should change", function () {
    it("Create a set quorum request if quorum exceeds valid executors", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, signer3, alc1Addr, deployer}, signers_distributor } = await loadFixture(deployContractsFixcture);
      const newQuorum = signers_distributor.length + 1;
  
      if(newQuorum > signers_distributor.length) {
        // Firstly, add new signer to increase the valid executors list
        const { txType, id } = await proposeTransaction({
          signer: signer1, 
          recipient: alc1Addr as Address, 
          amount: 0n, 
          contract: distributor, 
          delayInHrs: 0, trxType: 
          TrxnType.ADDSIGNER,
          safe: zeroAddress,
          token: collateralAssetAddr
        });
        await signTransaction({signer: deployer, requestId: id, contract: distributor});
        await executeTransaction({signer: signer3, contract: distributor, reqId: id});
        expect(txType).to.be.eq(TrxnType.ADDSIGNER);
      }
      
      // Propose a new transaction to set quorum
      const prop = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: BigInt(newQuorum), 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.SETQUORUM,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      expect(prop.txType).to.be.eq(TrxnType.SETQUORUM);
      await signTransaction({signer: deployer, requestId: prop.id, contract: distributor});
      await executeTransaction({signer: signer3, contract: distributor, reqId: prop.id});
      const quorum = await distributor.quorum();
      expect(quorum).to.be.eq(newQuorum);
    });
  });
})

