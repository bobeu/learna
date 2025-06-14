import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";

dotconfig();
enum Mode { LOCAL, LIVE }
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts, network} = hre;
	const {deploy} = deployments;
	let {deployer, reserve, admin } = await getNamedAccounts();
	let mode = Mode.LOCAL;
	// const transitionInterval = 24 * 60* 60; // 24 hours
	const transitionInterval = 5 * 60; //5mins 
	const networkName = network.name
	if(networkName !== 'hardhat') mode = Mode.LIVE;

	console.log("Mode", mode);
	console.log("deployer", deployer);
	/**
	 * Deploy Ownership Manager
	*/
	const learna = await deploy("Learna", {
		from: deployer,
		args: [[admin, deployer], transitionInterval, mode],
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
