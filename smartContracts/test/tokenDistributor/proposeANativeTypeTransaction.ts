import {  bn, TrxnType, Status_Dist } from "../utilities";
import {executeTransaction, proposeTransaction, signTransaction } from "../utils"
import { deployContracts } from "../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Address } from "../types";
import { parseUnits, zeroAddress } from "viem";

describe("Token distributor", function () {
  async function deployContractsFixcture() {
    return { 
        ...await deployContracts(ethers.getSigners),
    };
  }
  describe("Native coin transfer such as Celo is a type of transaction that can be proposed", function () {
    it("Create a native transfer transaction", async function () {
      const { distributor, collateralAssetAddr, distributorAddr, signers: {deployer, signer1, alc2, alc1Addr, signer3, alc2Addr}, collateralAsset, } = await loadFixture(deployContractsFixcture);
      const transferAmt = parseUnits('1', 19);
      await alc2.sendTransaction({from: alc2Addr, to: distributorAddr, value: transferAmt});
      const { txType, id } = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: transferAmt, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.NATIVE,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      expect(txType).to.be.eq(TrxnType.NATIVE);
  
      const balOfAlcB4Exec = await alc2.provider?.getBalance(alc2Addr);
      const balOfDistB4Exec = await alc2.provider?.getBalance(distributorAddr);
      // console.log("balOfAlcB4Exec", balOfAlcB4Exec);
      // console.log("balOfDistB4Exec", balOfDistB4Exec);
      await signTransaction({signer: deployer, requestId: id, contract: distributor});
      const exec = await executeTransaction({signer: signer3, contract: distributor, reqId: id});
      const balOfDistAfterExec = await alc2.provider?.getBalance(distributorAddr);
      const balOfAlcAfterExec = await alc2.provider?.getBalance(alc1Addr);
      expect(bn(balOfAlcAfterExec).gt(bn(balOfAlcB4Exec))).to.be.true;
      expect(bn(balOfAlcAfterExec).gt(bn(balOfAlcB4Exec))).to.be.true;
      expect(bn(balOfDistAfterExec).lt(bn(balOfDistB4Exec))).to.be.true;
      expect(exec.status).to.be.eq(Status_Dist.EXECUTED);
    });
  })
})

