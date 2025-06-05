import { TEN_THOUSAND_TOKEN, TrxnType, Status_Dist, DURATION_IN_HOURS } from "../utilities";
import { executeTransaction, proposeTransaction, signTransaction } from "../utils"
import { deployContracts } from "../deployments";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
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

  describe("When a transaction is proposed, signing and executing it have deadlines after which they become stale", function () {
    it("Request should expire if not executed within appropriate time", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, alc1Addr, signer3, deployer} } = await loadFixture(deployContractsFixcture);
      const { id } = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: TEN_THOUSAND_TOKEN, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.ERC20,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      const sign = await signTransaction({signer: deployer, requestId: id, contract: distributor});
      const expirationTime = BigInt((await time.latest()) + (((60 * 60) * DURATION_IN_HOURS) * 15));
      await time.increaseTo(expirationTime);
      const exec = await executeTransaction({contract: distributor, reqId: id, signer: signer3});
      expect(sign.status).to.be.eq(Status_Dist.PENDING);
      expect(exec.status).to.be.eq(Status_Dist.EXPIRED);
    });
  })
})

