import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { CAMPAIGNS  } from "../hashes";

dotconfig();
enum Mode { LOCAL, LIVE }
const NAME = "LEARNA Token";
const SYMBOL = "GROT";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts,  network} = hre;
	const {deploy, read, execute} = deployments;
	let {deployer, reserve, routeTo, admin, admin2, identityVerificationHub } = await getNamedAccounts();
	let mode = Mode.LOCAL;
	const networkName = network.name;
	const transitionInterval = networkName === 'alfajores'? 60 * 5 : (24 * 60 * 60); //1 day 
	const scopeValue = process.env.SCOPE_VALUE as string;
	if(networkName !== 'hardhat') mode = Mode.LIVE;
	const merkleRoot = '0x';
	// const merkleRoot = '0x';

	console.log("scope", scopeValue);
	console.log("admin", admin);
	console.log("admin2", admin2);
	console.log("networkName", networkName);
	console.log("mode", mode);
	console.log("transitionInterval", transitionInterval);

	/**
	 * Deploy Fee Manager
	*/
	const feeManager = await deploy("FeeManager", {
		from: deployer,
		args: [routeTo],
		log: true,
	});
	console.log(`Learna contract deployed to: ${feeManager.address}`);
	// console.log("CAMPAIGNS", CAMPAIGNS.length)

	/**
	 * Deploy Learna contract
	*/
	const learna = await deploy("Learna", {
		from: deployer,
		args: [[admin, admin2, deployer], transitionInterval, mode, feeManager.address, CAMPAIGNS],
		log: true,
	});
	console.log(`Learna contract deployed to: ${learna.address}`);

	/**
	 * Deploy Learna contract
	*/
	const claim = await deploy("Claim", {
		from: deployer,
		args: [identityVerificationHub, scopeValue],
		log: true,
	});
	console.log(`Learna contract deployed to: ${claim.address}`);

	/**
	 * Deploy Ownership Manager
	 */
	  const growToken = await deploy("GrowToken", {
		from: deployer,
		args: [reserve, learna.address, NAME, SYMBOL],
		log: true,
	  });
	  console.log(`GrowToken deployed to: ${growToken.address}`);

	  const isAdmin1 = await read("Learna", "getAdminStatus", admin);
	  const isAdmin2 = await read("Learna", "getAdminStatus", admin2);
	  await execute('Learna', {from: deployer}, 'approve', [claim.address]);
	  await execute('Claim', {from: deployer}, 'setLearna', [learna.address]);
	  await execute('Claim', {from: deployer}, 'setMerkleRoot', [merkleRoot]);
	//   await execute('Claim', {from: deployer}, 'setMerkleRoot', [merkleRoot]);
	//   await execute('Claim', {from: deployer}, 'setScope', [merkleRoot]);

	  console.log("isAdmin1", isAdmin1);
	  console.log("isAdmin2", isAdmin2);
	
}
export default func;

func.tags = ['Learna', 'GrowToken', 'FeeManager', 'Claim'];