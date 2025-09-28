import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { toBigInt } from 'ethers';
import { formatUnits, parseEther, parseUnits, zeroAddress } from 'viem';

dotconfig();
enum Mode { LOCAL, LIVE }

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts,  network} = hre;
	const {deploy, read, execute } = deployments;
	let { 
		deployer,
		routeTo, dev, 
		admin3,  
		admin,  
		admin2,  
		admin4, 
		identityVerificationHub 
	} = await getNamedAccounts();

	let mode = Mode.LOCAL;
	// const minimumToken = parseUnits('0.00001', 18);
	const networkName = network.name;
	// const deployer = networkName === 'sepolia'? admin2 : admin4;
	// const transitionInterval = networkName === 'alfajores'? 6 : 10; //6 mins for testnet : 1hr for mainnet 
	const scopeValue = (networkName === 'alfajores' || networkName === 'sepolia')? BigInt('20799336930628592874674157055357186694905720289678945318700937265906333634412') : BigInt('9186502517255327601873870048821518942839570257762675244524402438880947571356');
	const verificationConfig = '0x8475d3180fa163aec47620bfc9cd0ac2be55b82f4c149186a34f64371577ea58'; // Accepts all countries. Filtered individuals from the list of sanctioned countries using ofac1, 2, and 3
	if(networkName !== 'hardhat') mode = Mode.LIVE;
	const newAdmins = [admin4, admin, admin2];
	// const approvers = [admin4, admin3, admin2];

	console.log("NewAdmins: ", newAdmins);
	console.log("deployer", deployer);
	console.log("identityVerificationHub", identityVerificationHub);
	console.log("admin", admin);
	console.log("admin2", admin2);
	console.log("networkName", networkName);
	console.log("mode", mode);

	const feeManager = await deploy("FeeManager", {
		from: deployer,
		args: [routeTo],
		log: true,
	});
	console.log(`Fee Manager contract deployed to: ${feeManager.address}`);

	const verifier = await deploy("VerifierV2", {
		from: deployer,
		args: [identityVerificationHub],
		log: true,
	});
	console.log(`Verifier contract deployed to: ${verifier.address}`);
	
	const approvalFactory = await deploy("ApprovalFactory", {
		from: deployer,
		args: [],
		log: true,
	});
	console.log(`ApprovalFactory deployed to: ${approvalFactory.address}`);
	
	const CREATION_FEE = parseUnits('0.001',18);

	const campapaignFactory = await deploy("CampaignFactory", {
		from: deployer,
		args: [dev, CREATION_FEE, approvalFactory.address],
		log: true,
	});
	console.log(`campapaignFactory deployed to: ${campapaignFactory.address}`);

	try {
		console.log(`Setting fee receiver on CampaignFactory`);
		await execute('CampaignFactory', {from: deployer}, 'setFeeTo', feeManager.address);
	} catch (error) {
		const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
		console.error("Error executing setFeeTo:", errorMessage?.stack || errorMessage?.slice(0, 100));
	}

	try {
		console.log(`Setting verifier on CampaignFactory`);
		await execute('CampaignFactory', {from: deployer}, 'setVerifier', verifier.address);
	} catch (error) {
		const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
		console.error("Error executing setVerifier:", errorMessage?.stack || errorMessage?.slice(0, 100));
	}

	try {
		console.log(`Setting factory on ApprovalFactory`);
		await execute('ApprovalFactory', {from: deployer}, 'setFactory', campapaignFactory.address);
	} catch (error) {
		const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
		console.error("Error executing setFactory:", errorMessage?.stack || errorMessage?.slice(0, 100));
	}

	// try {
	// 	// await execute('Verifier', {from: deployer}, 'toggleUseWalletVerification');
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setPermission:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	await execute('VerifierV2', {from: deployer}, 'setConfigId', verificationConfig);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setConfigId:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	await execute('VerifierV2', {from: deployer}, 'setScope', scopeValue);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setScope:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }


	// Read actions
	const isWalletVerificationRequired = await read('VerifierV2', 'isWalletVerificationRequired');
	const config = await read('VerifierV2', 'configId');
	const scope = await read('VerifierV2', 'scope');

	console.log("scope", toBigInt(scope.toString()));
	console.log("isWalletVerificationRequired", isWalletVerificationRequired);
	console.log("config", config);
	
}
export default func;

func.tags = ['FeeManager', 'VerifierV2'];
func.dependencies = [
	'2_deploy_feeManager',
	'3_deploy_verifier',
];
