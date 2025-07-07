import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { getCampaignHashes  } from "../hashes";

dotconfig();
enum Mode { LOCAL, LIVE }
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts, network} = hre;
	const {deploy} = deployments;
	let {deployer, reserve, routeTo, admin, admin2 } = await getNamedAccounts();
	let mode = Mode.LOCAL;
	const transitionInterval = 7 * (24 * 60 * 60); //7 days 
	const networkName = network.name
	if(networkName !== 'hardhat') mode = Mode.LIVE;

	console.log("Mode", mode);
	console.log("deployer", deployer);

	/**
	 * Deploy Fee Manager
	*/
	const feeManager = await deploy("FeeManager", {
		from: deployer,
		args: [routeTo],
		log: true,
	});
	console.log(`Learna contract deployed to: ${feeManager.address}`);

	/**
	 * Deploy Learna contract
	*/
	//  address[] memory _admins, 
    //     uint64 transitionInterval, 
    //     Mode _mode, 
    //     address _feeManager,
    //     bytes32[] memory campaignHashes
	const campaignHashes = getCampaignHashes();
	const learna = await deploy("Learna", {
		from: deployer,
		args: [[admin, admin2, deployer], transitionInterval, mode, feeManager.address, campaignHashes],
		log: true,
	});
	console.log(`Learna contract deployed to: ${learna.address}`);

	/**
	 * Deploy Ownership Manager
	 */
	  const growToken = await deploy("GrowToken", {
		from: deployer,
		args: [reserve, learna.address],
		log: true,
	  });
	  console.log(`GrowToken deployed to: ${growToken.address}`);
	
}
export default func;

func.tags = ['ProofOfLearning', 'Learna', 'GrowToken'];
