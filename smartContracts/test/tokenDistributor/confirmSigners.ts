import { deployContracts } from "../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Token distributor", function () {
  async function deployContractsFixcture() {
    return { 
        ...await deployContracts(ethers.getSigners),
    };
  }

    describe("A list of addresses are parsed during construction", function () {
        it("Confirm each address is truly a signer", async function () {
        const { signers_distributor, distributor } = await loadFixture(deployContractsFixcture);
        
        // Test case for each signer
        signers_distributor.forEach(async(signer) => {
            const isSigner = await distributor.signers(signer);
            expect(isSigner).to.be.true;
        })
        }); 
    });

})

