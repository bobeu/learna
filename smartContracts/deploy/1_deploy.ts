import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { CAMPAIGNS  } from "../hashes";
import { keccak256, stringToHex } from 'viem';
import { toBigInt } from 'ethers';

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
	const scopeValue = BigInt(18602360624846318324803160706975563132768650215275175699779958311829163023208n);
	const verificationConfig = '0x8475d3180fa163aec47620bfc9cd0ac2be55b82f4c149186a34f64371577ea58'; // Accepts all countries. Filtered individuals from the list of sanctioned countries using ofac1, 2, and 3
	if(networkName !== 'hardhat') mode = Mode.LIVE;
	const merkleRoot = keccak256(stringToHex('merkleRoot'));
	// const merkleRoot = '0x';

	console.log("deployer", deployer);
	console.log("identityVerificationHub", identityVerificationHub);
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
		args: [identityVerificationHub],
		log: true,
	});
	console.log(`Claim contract deployed to: ${claim.address}`);

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
	await execute('Learna', {from: deployer}, 'approve', claim.address);
	await execute('Claim', {from: deployer}, 'setLearna', learna.address);
	await execute('Claim', {from: deployer}, 'setConfigId', verificationConfig);
	await execute('Claim', {from: deployer}, 'setMerkleRoot', merkleRoot);
	await execute('Claim', {from: deployer}, 'setScope', scopeValue);

	const config = await read('Claim', 'configId');
	const scope = await read('Claim', 'scope');

	console.log("scope", toBigInt(scope.toString()));
	console.log("config", config);
	console.log("isAdmin1", isAdmin1);
	console.log("isAdmin2", isAdmin2);
	
}
export default func;

func.tags = ['Learna', 'GrowToken', 'FeeManager', 'Claim'];





// Frontend: Creating user defined data
// const actionData = {
//   action: "withdraw",
//   amount: 10000,
//   sessionId: "xyz123"
// };

// const userDefinedData = "0x" + Buffer.from(
//   JSON.stringify(actionData)
// ).toString('hex').padEnd(128, '0'); // 128 hex chars = 64 bytes