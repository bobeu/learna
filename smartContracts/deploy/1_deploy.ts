import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { buildQuizInput, CAMPAIGNS  } from "../hashes";
import { toBigInt } from 'ethers';
import { formatUnits, parseEther, parseUnits, zeroAddress } from 'viem';
import { DifficultyLevel, ReadData } from '../types';
import { recordPoints, setUpCampaign, sortWeeklyPayment, verifyAndClaim } from "../test";

dotconfig();
enum Mode { LOCAL, LIVE }
const NAME = "Grow Token";
const SYMBOL = "BRAIN";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts,  network} = hre;
	const {deploy, read, execute} = deployments;
	let {
		// t1, t2, t3, t4, t5, t6, t7, t8, t9,
		// recorder,
		t10,
		deployer, 
		reserve, 
		routeTo, 
		admin, 
		admin2, 
		identityVerificationHub 
	} = await getNamedAccounts();

	let mode = Mode.LOCAL;
	const answerCount = [3, 2, 3, 1, 3, 3, 2, 1, 3, 2, 3];
	// const selectedCategories = ['celo', 'reactjs', 'wagmi', 'solidity', 'wagmi', 'reactjs', 'reactjs', 'celo', 'solidity', 'celo', 'self-protocol-sdk'];
	// const selectedCategories = ['reactjs', 'wagmi', 'solidity', 'wagmi', 'celo', 'solidity', 'celo', 'solidity', 'celo', 'self-protocol-sdk', 'celo'];
	// const selectedCategories = ['celo', 'reactjs', 'wagmi', 'solidity', 'divvi', 'self-protocol-sdk', 'wagmi', 'wagmi', 'reactjs', 'wagmi', 'solidity'];
	// const selectedCategories = ['self-protocol-sdk', 'solidity', 'reactjs', 'self-protocol-sdk', 'solidity', 'celo', 'wagmi', 'wagmi', 'celo', 'wagmi', 'solidity'];
	// const selectedCategories = ['solidity', 'wagmi', 'solidity', 'self-protocol-sdk', 'celo', 'solidity', 'celo', 'reactjs', 'divvi', 'solidity', 'self-protocol-sdk'];

	// const selectedDifficulties : DifficultyLevel[] = ['medium', 'easy', 'medium', 'hard', 'easy', 'easy', 'hard', 'easy', 'hard', 'hard', 'hard'];
	// const selectedDifficulties : DifficultyLevel[] = ['easy', 'medium', 'hard', 'easy', 'medium', 'hard', 'medium', 'hard', 'medium', 'easy', 'medium'];
	// const selectedDifficulties : DifficultyLevel[] = ['hard', 'hard', 'easy', 'medium', 'hard', 'medium', 'easy', 'medium', 'easy', 'medium', 'easy'];

	// const testers = [t1, t2, t3, t4, t5, t6, t7, t8, t9, deployer, routeTo].map((account, i) => {
	// 	return{
	// 		account,
	// 		correctAnswerCount: answerCount[i],
	// 		selectedCategory: selectedCategories[i],
	// 		selectedDifficulty: selectedDifficulties[i]
	// 	}
	// });
	// const minimumToken = parseUnits('15', 15);
	const minimumToken = parseUnits('0.0001', 18);
	const networkName = network.name;
	const transitionInterval = networkName === 'alfajores'? 6 : 10; //6 mins for testnet : 1hr for mainnet 
	const scopeValue = (networkName === 'alfajores' || networkName === 'sepolia')? BigInt('20799336930628592874674157055357186694905720289678945318700937265906333634412') : BigInt('8526642646275752306877819506814919028594783120156594744948169605204397623642');
	const verificationConfig = '0x8475d3180fa163aec47620bfc9cd0ac2be55b82f4c149186a34f64371577ea58'; // Accepts all countries. Filtered individuals from the list of sanctioned countries using ofac1, 2, and 3
	if(networkName !== 'hardhat') mode = Mode.LIVE;
	const accounts = [admin, admin2, t10];
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
	const verifier = await deploy("Verifier", {
		from: deployer,
		args: [identityVerificationHub],
		log: true,
	});
	console.log(`Verifier contract deployed to: ${verifier.address}`);

	/**
	 * Deploy Ownership Manager
	 */
	const GrowToken = await deploy("GrowToken", {
		from: deployer,
		args: [reserve, learna.address, NAME, SYMBOL],
		log: true,
	});
	console.log(`GrowToken deployed to: ${GrowToken.address}`);
	// await execute('Verifier', {from: deployer}, 'toggleUseWalletVerification');
	
	try {
		// await execute('Verifier', {from: deployer}, 'withdraw', deployer, parseEther('11'), GrowToken.address, 0n);
		// await execute('Learna', {from: deployer}, 'setPermission', verifier.address);
		// await execute('Learna', {from: deployer}, 'setVerifierAddress', verifier.address);
		// await execute('Learna', {from: deployer}, 'setToken', GrowToken.address);
		// await execute('Learna', {from: deployer}, 'setMinimumToken', minimumToken);
		// await execute('Verifier', {from: deployer}, 'setPermission', learna.address);
		// await execute('Verifier', {from: deployer}, 'setConfigId', verificationConfig);
		// await execute('Verifier', {from: deployer}, 'setScope', scopeValue);

		// for(let i = 0; i < newAdmins.length; i++) {
		// 	await execute('Verifier', {from: deployer}, 'setPermission', newAdmins[i]);
		// }
	} catch (error) {
		console.error("Error executing post-deployment setup:", error);
	}
	///////////////////////// Withdraw from the fee manager ///////////////////////////////////////
	// const amount = parseUnits('0.0479', 18)
	// const tokenAmount = parseUnits('50', 18)
	// await execute('FeeManager', {from: deployer}, 'withdraw', amount, deployer);
	// await execute('Verifier', {from: deployer}, 'withdraw', deployer, amount, GrowToken.address, tokenAmount);

	// await setUpCampaign({networkName, run: true});
	await recordPoints({networkName, run: true , recordPoints: true, runDelegate: true});
	// await sortWeeklyPayment({networkName, run: true});
	// await verifyAndClaim({networkName, run: true});

	/////////////////// Set up and fund campaign /////////////////////////////////////
	// for(let i = 0; i < selectedCategories.length; i++) {
	// 	const unit = 100 / 1;
	// 	const amount = parseUnits(unit.toString(), 18);
	// 	const celoValue = parseUnits('0.001', 18).toString();
	// 	const campaign = selectedCategories[i];
	// 	if(campaign !== ''){
	// 		try {
	// 			await execute('Learna', {from: deployer, value: celoValue}, 'setUpCampaign', campaign, amount, zeroAddress);
	//  		console.log("Campaign set up successfully:", campaign);
	// 		} catch (error) {
	// 			console.log("Error executing setUpCampaign for campaign:", campaign, error?.message || error?.reason || error?.data?.message || error?.data?.reason);
	// 		}
			
	// 	}
	// }

	//////////////////////////// Take quizzes and record scores/////////////////////////////////
	// for(let i = 0; i < testers.length; i++){
	// 	const tester = testers[i];
	// 	const { quizResult, hash_ } = await buildQuizInput(tester.selectedCategory, tester.selectedDifficulty, tester.correctAnswerCount);
	// 	console.log("tester", tester.account, `account ${i + 1}`);
	// 	try {
	// 		await execute('Learna', {from: tester.account, value: minimumToken.toString()}, 'delegateTransaction');
	// 		await execute('Learna', {from: networkName === 'alfajores'? recorder : farc}, 'recordPoints', tester.account, quizResult, hash_);
	// 	} catch (error) {
	// 		console.log("Error executing transactions for tester:", tester.account, error?.message || error?.reason || error?.data?.message || error?.data?.reason);
	// 	}
		
	// }
	
	// Sort weekly reward
	// const amountInGrowToken = parseEther('50'); // 10 KNOW tokens
	// const newIntervalInMin = networkName === 'alfajores'? 25 : 1440; // 25 mins for testnet : 1 day for mainnet
	// await execute('Learna', {from: deployer}, 'sortWeeklyReward', amountInGrowToken, newIntervalInMin);

	/////////////////////////// Verify identity and verifier reward ////////////////////////////
	// const verificationStatuses : {account: string, isVerified: boolean, isBlacklisted: boolean}[] = [];
	// const users = testers.slice(0, testers.length/2);
	// // const users = testers.slice(testers.length/2);
	// for(let i = 0; i < users.length; i++) {
	// 	const user = users[i];
	// 	const [isVerified, isBlacklisted] = await read("Claim", "getVerificationStatus", user.account) as boolean[];
	// 	verificationStatuses.push({
	// 		account: user.account,
	// 		isVerified,
	// 		isBlacklisted
	// 	})
	// 	try {
	// 		if(!isVerified && !isBlacklisted) {
	// 			await execute('Claim', {from: user.account}, 'verify');
	//			console.log("Verification sucsess from:", user.account);
	// 		}
	// 		await execute('Claim', {from: user.account}, 'verifierReward');
	// 	} catch (error) {
	// 		console.log("Error executing transactions for user:", user.account, error?.message || error?.reason || error?.data?.message || error?.data?.reason);
	// 	}

	// }

	// Read actions
	const admins = await read("Learna", "getAdmins");
	const isWalletVerificationRequired = await read('Verifier', 'isWalletVerificationRequired');
	const config = await read('Verifier', 'configId');
	const scope = await read('Verifier', 'scope');
	const stateData = await read('Learna', 'getData', deployer) as ReadData;

	console.log("scope", toBigInt(scope.toString()));
	console.log("isWalletVerificationRequired", isWalletVerificationRequired);
	console.log("config", config);
	console.log("isAdmin1", admins?.[0].active);
	console.log("isAdmin2", admins?.[1].active);
	console.log("Minimum token", formatUnits(BigInt(stateData?.state?.minimumToken?.toString()), 18));
	
}
export default func;

func.tags = ['Learna', 'GrowToken', 'FeeManager', 'Verifier'];
func.dependencies = [
	'1_deploy_learna',
	'2_deploy_feeManager',
	'3_deploy_verifier',
	'4_deploy_GrowToken'
];
