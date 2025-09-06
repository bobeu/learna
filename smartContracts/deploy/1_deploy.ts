import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { ANSWER_COUNT, buildQuizInput, CAMPAIGNs, CAMPAIGNS, DIFFICULTIES  } from "../hashes";
import { toBigInt } from 'ethers';
import { formatUnits, parseEther, parseUnits, zeroAddress } from 'viem';
import { DifficultyLevel, ReadData } from '../types';
import { recordPoints, setUpCampaign, sortWeeklyPayment, verifyAndClaim } from "../test";
// import feeReceiver from "../deployments/celo/FeeManager.json";
// import learna from "../deployments/celo/LearnaV2.json";
// import verifier from "../deployments/celo/VerifierV2.json";
// import tokenv2 from "../deployments/celo/PlatformToken.json";

dotconfig();
enum Mode { LOCAL, LIVE }
const NAME = "Learn, Assimilate & Integrate Token";
const SYMBOL = "POLE";

interface Admin {
	id: `0x${string}`;
	active: boolean;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts,  network} = hre;
	const {deploy, read, execute, getDeploymentsFromAddress} = deployments;
	let { 
		reserve, 
		deployer: dep, 
		routeTo, dev, 
		admin3,  
		admin,  
		admin2,  
		admin4, 
		identityVerificationHub 
	} = await getNamedAccounts();

	let mode = Mode.LOCAL;
	const minimumToken = 0n;
	// const minimumToken = parseUnits('0.00001', 18);
	const networkName = network.name;
	const deployer = networkName === 'sepolia'? admin2 : admin4;
	// const transitionInterval = networkName === 'alfajores'? 6 : 10; //6 mins for testnet : 1hr for mainnet 
	const scopeValue = (networkName === 'alfajores' || networkName === 'sepolia')? BigInt('20799336930628592874674157055357186694905720289678945318700937265906333634412') : BigInt('12795439251423179418351918761589831883253868888326667545888975468034221072432');
	const verificationConfig = '0x8475d3180fa163aec47620bfc9cd0ac2be55b82f4c149186a34f64371577ea58'; // Accepts all countries. Filtered individuals from the list of sanctioned countries using ofac1, 2, and 3
	if(networkName !== 'hardhat') mode = Mode.LIVE;
	const newAdmins = [admin4, admin, admin2];
	const approvers = [admin4, admin3, admin2];

	console.log("NewAdmins: ", newAdmins);
	console.log("deployer", deployer);
	console.log("identityVerificationHub", identityVerificationHub);
	console.log("admin", admin);
	console.log("admin2", admin2);
	console.log("networkName", networkName);
	console.log("mode", mode);
	// console.log("transitionInterval", transitionInterval);

	const feeManager = await deploy("FeeManager", {
		from: deployer,
		args: [routeTo],
		log: true,
	});
	console.log(`Fee Manager contract deployed to: ${feeManager.address}`);
	// const feeManager = await getDeploymentsFromAddress(feeReceiver.address);
	// const learnaV2 = await getDeploymentsFromAddress(learna.address);
	// const tokenV2 = await getDeploymentsFromAddress(tokenv2.address);

	// console.log("FeeManager", feeManager[0].userdoc)

	const learna = await deploy("LearnaV2", {
		from: deployer,
		args: [newAdmins, mode, feeManager.address, CAMPAIGNS],
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
	
	// const approvalFactory = await deploy("ApprovalFactory", {
	// 	from: deployer,
	// 	args: [],
	// 	log: true,
	// });
	// console.log(`ApprovalFactory deployed to: ${approvalFactory.address}`);
	
	// const CREATION_FEE = parseUnits('0.001',18);

	// const campapaignFactory = await deploy("CampaignFactory", {
	// 	from: deployer,
	// 	args: [dev, CREATION_FEE, approvalFactory.address],
	// 	log: true,
	// });
	// console.log(`campapaignFactory deployed to: ${campapaignFactory.address}`);

	// try {
	// 	console.log(`Setting fee receiver on CampaignFactory`);
	// 	await execute('CampaignFactory', {from: deployer}, 'setFeeTo', feeManager.address);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setFeeTo:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	console.log(`Setting verifier on CampaignFactory`);
	// 	await execute('CampaignFactory', {from: deployer}, 'setVerifier', verifier.address);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setVerifier:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	// await execute('LearnaV2', {from: deployer}, 'setPermission', admin3);
	// 	for(const admin of newAdmins) {
	// 		console.log(`Setting approval: ${admin}`);
	// 		await execute('LearnaV2', {from: deployer}, 'setPermission', admin);
	// 	}
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setPermission:", errorMessage?.stack || errorMessage?.slice(0, 100));
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

	// try {
	// 	await execute('LearnaV2', {from: deployer}, 'setMinimumToken', minimumToken);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setMinimumToken:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	// await execute('Verifier', {from: deployer}, 'toggleUseWalletVerification');
	// 	// await execute('LearnaV2', {from: deployer}, 'withdraw', deployer, parseEther('11'), tokenv2.address, 0n);
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing setPermission:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// try {
	// 	// await execute('Verifier', {from: deployer}, 'toggleUseWalletVerification');
	// 	await execute('LearnaV2', {from: deployer}, 'toggleSkipVerification');
	// } catch (error) {
	// 	const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 	console.error("Error executing toggleSkipVerification:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// }

	// for(const campaign of CAMPAIGNS) {
	// 	for(const approve of approvers) {
	// 		try {
	// 			console.log(`Claiming reward from ${approve} for ${campaign}`);
	// 			await execute('LearnaV2', {from: approve}, 'claimReward', campaign);
	// 		} catch (error) {
	// 			const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 			console.error("Error executing claimReward:", errorMessage?.stack || errorMessage?.slice(0, 100));
	// 		}
	// 	}		
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
	// const amount = parseUnits('0.2780', 18)
	// const tokenAmount = parseUnits('50', 18)
	// await execute('FeeManager', {from: admin4}, 'withdraw', amount, admin4);
	// await execute('Verifier', {from: deployer}, 'withdraw', deployer, amount, GrowToken.address, tokenAmount);

	// const method = 'recordPoints';
	// if(learna === undefined) throw new Error("Learna is not deployed");
	// for(const campaign of CAMPAIGNs) {
	// 	const index = CAMPAIGNs.indexOf(campaign);
	// 	for(const approve of approvers) {
	// 		console.log(`Trxn ${index + 1} from ${approve} for ${campaign}`);
	// 		const { quizResult, hash_ } = buildQuizInput(campaign, DIFFICULTIES[index] as DifficultyLevel, ANSWER_COUNT[index]);
	// 		try {
	// 			await execute('LearnaV2', {from: deployer}, method, approve, quizResult, hash_);
	// 		} catch (error) {
	// 			const errorMessage = error?.message || error?.reason || error?.data?.message || error?.data?.reason;
	// 			console.error(`Error executing ${'recordPoints'} on Learna for Verifier:`, errorMessage?.stack || errorMessage?.slice(0, 100));
	// 		}
	// 	}
	// }

	
	// await setUpCampaign({networkName, run: true});
	// await recordPoints({networkName, run: true , recordPoints: true, runDelegate: true});
	// await sortWeeklyPayment({networkName, run: true});
	// await verifyAndClaim({networkName, run: true});

	// Read actions
	const isWalletVerificationRequired = await read('VerifierV2', 'isWalletVerificationRequired');
	const config = await read('VerifierV2', 'configId');
	const scope = await read('VerifierV2', 'scope');
	const stateData = await read('LearnaV2', 'getData', deployer) as ReadData;
	const token = await read('LearnaV2', 'token') as string;
	const verifierAddr = await read('LearnaV2', 'verifier') as string;
	const skipVerification = await read('LearnaV2', 'skipVerification') as string;

	console.log("skipVerification", skipVerification);
	console.log("Token", token);
	console.log("Verifier", verifierAddr);
	console.log("scope", toBigInt(scope.toString()));
	console.log("isWalletVerificationRequired", isWalletVerificationRequired);
	console.log("config", config);
	console.log("Minimum token", formatUnits(BigInt(stateData?.state?.minimumToken?.toString()), 18));
	
}
export default func;

func.tags = ['LearnaV2', 'GrowTokenV2', 'FeeManager', 'VerifierV2'];
func.dependencies = [
	'1_deploy_learna',
	'2_deploy_feeManager',
	'3_deploy_verifier',
	'4_deploy_GrowToken'
];
