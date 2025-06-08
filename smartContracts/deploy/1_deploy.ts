import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";

dotconfig();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;
	let {deployer, reserve } = await getNamedAccounts();

	/**
	 * Deploy Ownership Manager
	*/
	const learna = await deploy("Learna", {
		from: deployer,
		args: [],
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
