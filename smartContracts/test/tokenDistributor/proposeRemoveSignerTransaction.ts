import {  TEN_THOUSAND_TOKEN, bn, TrxnType, Status_Dist, } from "../utilities";
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
  describe("Signers can propose to remove a signer, non-signers don't", function () {
    it("Should remove a signer successfully", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, deployer, signer2, alc1Addr, extraAddr, signer2Addr, signer3Addr, signer1Addr, deployerAddr, signer3} } = await loadFixture(deployContractsFixcture);
      const transferAmt = TEN_THOUSAND_TOKEN;
      const { txType, id, executors: exec1 } = await proposeTransaction({
        signer: signer1, 
        recipient: signer2Addr as Address, 
        amount: transferAmt, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.ADDSIGNER,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      expect(txType).to.be.eq(TrxnType.ADDSIGNER);
      await signTransaction({signer: deployer, requestId: id, contract: distributor});
      const {executors} = await executeTransaction({signer: signer3, contract: distributor, reqId: id});
      expect(executors.includes(signer2Addr));
      expect(executors.includes(signer3Addr));
      expect(executors.includes(deployerAddr));
      expect(executors.includes(signer1Addr));
      expect(executors.includes(extraAddr));
      expect(bn(executors.length).gt(bn(exec1.length)));
  
      // Propose remove signer
      const newProp = await proposeTransaction({
        signer: signer2, 
        recipient: signer3Addr as Address, 
        amount: transferAmt, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.REMOVESIGNER,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      await signTransaction({signer: deployer, requestId: newProp.id, contract: distributor});
      const isSignerB4 = await distributor.signers(signer3Addr);
      const exec = await executeTransaction({signer: signer1, contract: distributor, reqId: newProp.id});
      const isSignerAfter = await distributor.signers(alc1Addr);
      
      expect(exec.executors.length).to.be.eq(executors.length);
      expect(isSignerB4).to.be.true;
      expect(isSignerAfter).to.be.false;
      expect(exec.status).to.be.eq(Status_Dist.EXECUTED);
    });
  })
})

