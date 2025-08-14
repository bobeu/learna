import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { CAMPAIGNS  } from "../hashes";
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
	const transitionInterval = networkName === 'alfajores'? 6 : 60; //6 mins for testnet : 1hr for mainnet 
	const scopeValue = networkName === 'alfajores'? BigInt('14000655775750890061646252203233631380232591167831633002086193002509521754566') : BigInt('12114867146632761766499564830059671616946370820555069452163170720079989210880');
	const verificationConfig = '0x8475d3180fa163aec47620bfc9cd0ac2be55b82f4c149186a34f64371577ea58'; // Accepts all countries. Filtered individuals from the list of sanctioned countries using ofac1, 2, and 3
	if(networkName !== 'hardhat') mode = Mode.LIVE;
	const accounts = [admin, admin2];
	const newAdmins: string[] = [];
	accounts.forEach((account) => {
		if(account.toLowerCase() !== deployer.toLowerCase()){
			newAdmins.push(account);
		}
	});
	newAdmins.push(deployer);

	console.log("NewAdmins: ", newAdmins);
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
	console.log(`Fee Manager contract deployed to: ${feeManager.address}`);
	// console.log("CAMPAIGNS", CAMPAIGNS.length)

	/**
	 * Deploy Learna contract
	*/
	const learna = await deploy("Learna", {
		from: deployer,
		args: [newAdmins, transitionInterval, mode, feeManager.address, CAMPAIGNS],
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
	// await execute('Claim', {from: deployer}, 'toggleUseWalletVerification');
	
	const admins = await read("Learna", "getAdmins");
	await execute('Learna', {from: deployer}, 'setPermission', claim.address);
	await execute('Learna', {from: deployer}, 'setClaimAddress', claim.address);
	await execute('Learna', {from: deployer}, 'setToken', growToken.address);
	await execute('Claim', {from: deployer}, 'setLearna', learna.address);
	await execute('Claim', {from: deployer}, 'setConfigId', verificationConfig);
	await execute('Claim', {from: deployer}, 'setScope', scopeValue);

	for(let i = 0; i < newAdmins.length; i++) {
		await execute('Claim', {from: deployer}, 'setPermission', newAdmins[i]);
	}

	const isWalletVerificationRequired = await read('Claim', 'isWalletVerificationRequired');
	const config = await read('Claim', 'configId');
	const scope = await read('Claim', 'scope');

	console.log("scope", toBigInt(scope.toString()));
	console.log("isWalletVerificationRequired", isWalletVerificationRequired);
	console.log("config", config);
	console.log("isAdmin1", admins?.[0].active);
	console.log("isAdmin2", admins?.[1].active);
	
}
export default func;

func.tags = ['Learna', 'GrowToken', 'FeeManager', 'Claim'];
func.dependencies = [
	'1_deploy_learna',
	'2_deploy_feeManager',
	'3_deploy_claim',
	'4_deploy_growToken'
];