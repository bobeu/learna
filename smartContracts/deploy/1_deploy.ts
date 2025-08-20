import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { buildQuizInput, CAMPAIGNS  } from "../hashes";
import { toBigInt } from 'ethers';
import { formatUnits, parseEther, parseUnits, zeroAddress } from 'viem';
import { DifficultyLevel, ReadData } from '../types';

dotconfig();
enum Mode { LOCAL, LIVE }
const NAME = "LEARNA Token";
const SYMBOL = "KNOW";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  	const {deployments, getNamedAccounts,  network} = hre;
	const {deploy, read, execute} = deployments;
	let {
		t1, t2, t3, t4, t5, t6, t7, t8,
		recorder,
		deployer, 
		reserve, 
		routeTo, 
		admin, 
		admin2, 
		identityVerificationHub 
	} = await getNamedAccounts();

	let mode = Mode.LOCAL;
	const answerCount = [3, 2, 3, 1, 3, 3, 2, 1, 3, 2];
	const selectedCategories = ['celo', 'reactjs', 'wagmi', 'solidity', 'wagmi', 'reactjs', 'solidity', 'celo', 'solidity', 'celo'];
	// const selectedCategories = ['wagmi', 'solidity', 'reactjs', 'wagmi', 'solidity', 'celo', 'wagmi', 'wagmi', 'celo', 'wagmi'];
	// const selectedCategories = ['solidity', 'wagmi', 'solidity', 'reactjs', 'celo', 'solidity', 'celo', 'reactjs', 'divvi', 'solidity'];

	const selectedDifficulties : DifficultyLevel[] = ['medium', 'easy', 'medium', 'hard', 'easy', 'easy', 'hard', 'easy', 'hard', 'medium'];
	// const selectedDifficulties : DifficultyLevel[] = ['easy', 'medium', 'hard', 'easy', 'medium', 'hard', 'medium', 'hard', 'medium', 'hard'];
	// const selectedDifficulties : DifficultyLevel[] = ['hard', 'hard', 'easy', 'medium', 'hard', 'medium', 'easy', 'medium', 'easy', 'hard'];

	const testers = [t1, t2, t3, t4, t5, t6, t7, t8, deployer, routeTo].map((account, i) => {
		return{
			account,
			correctAnswerCount: answerCount[i],
			selectedCategory: selectedCategories[i],
			selectedDifficulty: selectedDifficulties[i]
		}
	});
	// const minimumToken = parseUnits('15', 15);
	const minimumToken = parseUnits('0.001', 18);
	const networkName = network.name;
	const transitionInterval = networkName === 'alfajores'? 6 : 60; //6 mins for testnet : 1hr for mainnet 
	const scopeValue = networkName === 'alfajores'? BigInt('8357037332445845391300273215836313477662858825136795646264776763497500960591') : BigInt('9892191232128041141400406025255720980042155946518803651246392555443501561603');
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
	const knowToken = await deploy("KnowToken", {
		from: deployer,
		args: [reserve, learna.address, NAME, SYMBOL],
		log: true,
	});
	console.log(`KnowToken deployed to: ${knowToken.address}`);
	// await execute('Claim', {from: deployer}, 'toggleUseWalletVerification');
	
	// await execute('Learna', {from: deployer}, 'setPermission', claim.address);
	// await execute('Learna', {from: deployer}, 'setClaimAddress', claim.address);
	// await execute('Learna', {from: deployer}, 'setToken', knowToken.address);
	// await execute('Learna', {from: deployer}, 'setMinimumToken', minimumToken);
	// await execute('Claim', {from: deployer}, 'setLearna', learna.address);
	// await execute('Claim', {from: deployer}, 'setConfigId', verificationConfig);
	// await execute('Claim', {from: deployer}, 'setScope', scopeValue);

	// for(let i = 0; i < newAdmins.length; i++) {
	// 	await execute('Claim', {from: deployer}, 'setPermission', newAdmins[i]);
	// }

	///////////////////////// Withdraw from the fee manager ///////////////////////////////////////
	// const amount = parseUnits('0.342', 18)
	// await execute('FeeManager', {from: deployer}, 'withdraw', amount, deployer);

	////////////////////////////// Take quizzes and record scores/////////////////////////////////
	// for(let i = 0; i < testers.length; i++){
	// 	const tester = testers[i];
	// 	const { quizResult, hash_ } = await buildQuizInput(tester.selectedCategory, tester.selectedDifficulty, tester.correctAnswerCount);
	// 	console.log("tester", tester.account, `account ${i + 1}`);
	// 	try {
	// 		await execute('Learna', {from: tester.account, value: minimumToken.toString()}, 'delegateTransaction');
	// 		await execute('Learna', {from: deployer}, 'recordPoints', tester.account, quizResult, hash_);
	// 	} catch (error) {
	// 		console.log("Error executing transactions for tester:", tester.account, error?.message || error?.reason || error?.data?.message || error?.data?.reason);
	// 	}
		
	// }

	///////////////////// Set up and fund campaign /////////////////////////////////////
	// for(let i = 0; i < selectedCategories.length; i++) {
	// 	const unit = 100 / 1;
	// 	const amount = parseUnits(unit.toString(), 18);
	// 	const celoValue = parseUnits('1', 18).toString();
	// 	const campaign = selectedCategories[i];
	// 	await execute('Learna', {from: deployer, value: celoValue}, 'setUpCampaign', campaign, amount, zeroAddress);
	// }
	
	// Sort weekly reward
	const amountInKnowToken = parseEther('10'); // 10 KNOW tokens
	// const newIntervalInMin = networkName === 'alfajores'? 25 : 1440; // 25 mins for testnet : 1 day for mainnet
	// await execute('Learna', {from: deployer}, 'sortWeeklyReward', amountInKnowToken, newIntervalInMin);

	/////////////////////////// Verify identity and claim reward ////////////////////////////
	const verificationStatuses : {account: string, isVerified: boolean, isBlacklisted: boolean}[] = [];
	const users = testers.slice(0, testers.length/2);
	// const users = testers.slice(testers.length/2);
	for(let i = 0; i < users.length; i++) {
		const user = users[i];
		const [isVerified, isBlacklisted] = await read("Claim", "getVerificationStatus", user.account) as boolean[];
		verificationStatuses.push({
			account: user.account,
			isVerified,
			isBlacklisted
		})
		try {
			if(!isVerified && !isBlacklisted) {
				await execute('Claim', {from: user.account}, 'verify');
			}
			await execute('Claim', {from: user.account}, 'claimReward');
		} catch (error) {
			console.log("Error executing transactions for user:", user.account, error?.message || error?.reason || error?.data?.message || error?.data?.reason);
		}

	}

	// Read actions
	const admins = await read("Learna", "getAdmins");
	const isWalletVerificationRequired = await read('Claim', 'isWalletVerificationRequired');
	const config = await read('Claim', 'configId');
	const scope = await read('Claim', 'scope');
	const stateData = await read('Learna', 'getData', deployer) as ReadData;

	console.log("scope", toBigInt(scope.toString()));
	console.log("isWalletVerificationRequired", isWalletVerificationRequired);
	console.log("config", config);
	console.log("isAdmin1", admins?.[0].active);
	console.log("isAdmin2", admins?.[1].active);
	console.log("Minimum token", formatUnits(BigInt(stateData?.state?.minimumToken?.toString()), 18));
	
}
export default func;

func.tags = ['Learna', 'KnowToken', 'FeeManager', 'Claim'];
func.dependencies = [
	'1_deploy_learna',
	'2_deploy_feeManager',
	'3_deploy_claim',
	'4_deploy_knowToken'
];
