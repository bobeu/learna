import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { buildQuizInput, CAMPAIGNS  } from "../hashes";
import { toBigInt } from 'ethers';
import { formatUnits, parseEther, parseUnits, zeroAddress } from 'viem';
import { DifficultyLevel, ReadData } from '../types';
import { recordPoints, setUpCampaign, sortWeeklyPayment, verifyAndClaim } from "../test";

dotconfig();
enum Mode { LOCAL, LIVE }
const NAME = "Learn, Assimilate & Integrate Token";
const SYMBOL = "POLE";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts,  network} = hre;
	const {deploy, read, execute} = deployments;
	let { reserve, deployer: dep, routeTo,  admin,  admin2, admin3,  admin4, identityVerificationHub } = await getNamedAccounts();

	let mode = Mode.LOCAL;
	const minimumToken = parseUnits('0.00001', 18);
	const networkName = network.name;
	const deployer = networkName === 'sepolia'? admin2 : dep;
	const transitionInterval = networkName === 'alfajores'? 6 : 10; //6 mins for testnet : 1hr for mainnet 
	const scopeValue = (networkName === 'alfajores' || networkName === 'sepolia')? BigInt('20799336930628592874674157055357186694905720289678945318700937265906333634412') : BigInt('4510429615009851896467081293173148658869404264045810605072749514401989338651');
	const verificationConfig = '0x8475d3180fa163aec47620bfc9cd0ac2be55b82f4c149186a34f64371577ea58'; // Accepts all countries. Filtered individuals from the list of sanctioned countries using ofac1, 2, and 3
	if(networkName !== 'hardhat') mode = Mode.LIVE;
	const newAdmins = [admin4 ];

	console.log("NewAdmins: ", newAdmins);
	console.log("deployer", deployer);
	console.log("identityVerificationHub", identityVerificationHub);
	console.log("admin", admin);
	console.log("admin2", admin2);
	console.log("networkName", networkName);
	console.log("mode", mode);
	console.log("transitionInterval", transitionInterval);

	const feeManager = await deploy("FeeManager", {
		from: deployer,
		args: [routeTo],
		log: true,
	});
	console.log(`Fee Manager contract deployed to: ${feeManager.address}`);

	const learna = await deploy("LearnaV2", {
		from: deployer,
		args: [newAdmins, transitionInterval, mode, feeManager.address, CAMPAIGNS],
		log: true,
	});
	console.log(`Learna contract deployed to: ${learna.address}`);

	const verifier = await deploy("VerifierV2", {
		from: deployer,
		args: [identityVerificationHub],
		log: true,
	});
	console.log(`Verifier contract deployed to: ${verifier.address}`);

	const tokenv2 = await deploy("PlatformToken", {
		from: deployer,
		args: [reserve, NAME, SYMBOL],
		log: true,
	});
	console.log(`TokenV2 deployed to: ${tokenv2.address}`);

	// try {
	// 	for(const admin of newAdmins) {
	// 		console.log(`Setting admin: ${admin}`);
	// 		// await execute('LearnaV2', {from: deployer}, 'setAdmin', admin);
	// 	}
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setAdmin:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	await execute('VerifierV2', {from: deployer}, 'setPermission', learna.address);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setPermission:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }
	
	// try {
	// 	await execute('LearnaV2', {from: deployer}, 'setToken', tokenv2.address);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setToken:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	await execute('PlatformToken', {from: deployer}, 'setMain', learna.address);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setMain:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	try {
		await execute('LearnaV2', {from: deployer}, 'setMinimumToken', minimumToken);
	} catch (error) {
		const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
		console.error("Error executing setMinimumToken:", errorMessage?.stack || errorMessage?.slice(0, 100));
	}

	// try {
	// 	// await execute('Verifier', {from: deployer}, 'toggleUseWalletVerification');
	// 	// await execute('LearnaV2', {from: deployer}, 'withdraw', deployer, parseEther('11'), tokenv2.address, 0n);
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

	// try {
	// 	if(learna === undefined) throw new Error("Learna is not deployed");
	// 	await execute('LearnaV2', {from: deployer}, 'setVerifierAddress', verifier.address);

	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setVerifierAddress on Learna for Verifier:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }
	
	
	
	///////////////////////// Withdraw from the fee manager ///////////////////////////////////////
	// const amount = parseUnits('0.0479', 18)
	// const tokenAmount = parseUnits('50', 18)
	// await execute('FeeManager', {from: deployer}, 'withdraw', amount, deployer);
	// await execute('Verifier', {from: deployer}, 'withdraw', deployer, amount, GrowToken.address, tokenAmount);

	// await setUpCampaign({networkName, run: true});
	// await recordPoints({networkName, run: true , recordPoints: true, runDelegate: true});
	// await sortWeeklyPayment({networkName, run: true});
	// await verifyAndClaim({networkName, run: true});

	// Read actions
	// const admins = await read("LearnaV2", "getAdmins");
	// const isWalletVerificationRequired = await read('VerifierV2', 'isWalletVerificationRequired');
	// const config = await read('VerifierV2', 'configId');
	// const scope = await read('VerifierV2', 'scope');
	// const stateData = await read('LearnaV2', 'getData', deployer) as ReadData;

	// console.log("scope", toBigInt(scope.toString()));
	// console.log("isWalletVerificationRequired", isWalletVerificationRequired);
	// console.log("config", config);
	// console.log("isAdmin1", admins?.[0].active);
	// console.log("isAdmin2", admins?.[1].active);
	// console.log("Minimum token", formatUnits(BigInt(stateData?.state?.minimumToken?.toString()), 18));
	
}
export default func;

func.tags = ['LearnaV2', 'GrowTokenV2', 'FeeManager', 'VerifierV2'];
func.dependencies = [
	'1_deploy_learna',
	'2_deploy_feeManager',
	'3_deploy_verifier',
	'4_deploy_GrowToken'
];
