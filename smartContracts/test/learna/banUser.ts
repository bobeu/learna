// import { deployContracts } from "../deployments";
// import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { ethers } from "hardhat";
// import { expect } from "chai";
// import { banUserFromCampaig, getCampaigns, getQuizResult } from "../utils";
// import { Address } from "../types";

// describe("Learna", function () {
//   async function deployContractsFixcture() {
//     return { ...await deployContracts(ethers.getSigners) };
//   }
  
//   describe("Should ban user from weekly payout", function () {
//     it("An admin should be able to remove user from participating in campaign", async function () {
//       const { learna, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
//       const { allCampaign } = await getCampaigns(learna);
//       const campaignHash = allCampaign[0].hash_ as Address;
//       const quizResult = getQuizResult(campaignHash, 60);
//       const profileInit = await learna.getProfile(signer1Addr);
//       expect(profileInit.length).to.be.eq(1); //There is only one campaign in that week
//       expect(profileInit?.[0].campaigns.length === 0).to.be.true;

//       // When user participate in a campaign, their profile will be visible
//       await learna.connect(deployer).recordPoints(signer1Addr, quizResult, campaignHash);

//       const profileAfterBan = (await banUserFromCampaig({deployer, learna, user: signer1Addr, campaignHashes: [campaignHash]}))?.[0].campaigns.filter(({campaignHash})=> campaignHash.toLowerCase() === campaignHash.toLowerCase())?.[0]?? [];
//       expect(profileAfterBan.profile.other.blacklisted).to.be.true;
//       await expect(learna.connect(deployer).recordPoints(signer1Addr, quizResult, campaignHash))
//       .to.be.revertedWith("Blacklisted");
//     });
//   })
// })