// import { deployContracts } from "../deployments";
// import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { ethers } from "ethers";
// import { ethers as hardhatEther } from "hardhat";
// import { expect } from "chai";
// import { campaigns, getCampaigns, setUpCampaign } from "../utils";
// import { parseEther, zeroAddress,} from "viem";
// import { Address, metadata, performanceRating, proofAssimilation } from "../types";
// import { parseUnits } from "ethers";
// import { abi } from "../../artifacts/contracts/v3/CampaignTemplate.sol/CampaignTemplate.json";

// describe("CampaignFactory", function () {
//   async function deployContractsFixcture() {
//     return { ...await deployContracts(hardhatEther.getSigners)};
//   }
  
//   describe("Setup campaigns", function () { 
//     it("Should create a campaign successfully", async function () {
//       const { campaignFactory, approvalFactory, createtionFee, approvalFactoryAddr, feeManagerAddr, devAddr, signers : { signer1, deployerAddr, signer1Addr: operatorAddr, deployer }} = await loadFixture(deployContractsFixcture);
//       const operator = signer1;
//       await campaignFactory.connect(deployer).setApprovalFactory(approvalFactoryAddr);
//       await campaignFactory.connect(operator).createCampaign(metadata, {value: createtionFee});
//       const data = await campaignFactory.getData();
//       const campaignAddress = data.campaigns[0].identifier;
//       console.log("campaignAddress", campaignAddress);
//       const contract = new ethers.Contract(campaignAddress, abi, operator);
//       console.log("contract", contract);
//       // const deployed = await contract.waitForDeployment();
//       await contract.proofAssimilation(proofAssimilation, performanceRating);
//       const campaignData = await contract.getData(operatorAddr, zeroAddress);
//       // const hasApproval = await approvalFactory.hasApproval(deployerAddr);
//     // 
//       // console.log("Data", data);
//       // expect(data.campaigns.length).to.be.eq(1);
//       // expect(data.approvalFactory).to.be.eq(approvalFactoryAddr);
//       // expect(hasApproval).to.be.true;
//       // expect(data.dev).to.be.eq(devAddr);
//       // expect(data.feeTo).to.be.eq(feeManagerAddr);
//     });
//   })
// })