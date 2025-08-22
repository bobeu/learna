import { assert } from "console";
import { createPublicClient, createWalletClient, Hex, http, parseEther, parseUnits, zeroAddress } from 'viem'
import { privateKeyToAccount } from "viem/accounts";
import { celo, celoAlfajores } from 'viem/chains';
import claimMain from "./deployments/celo/Claim.json";
import claimTest from "./deployments/alfajores/Claim.json";
import learnaMain from "./deployments/celo/Learna.json";
import learnaTest from "./deployments/alfajores/Learna.json";
import { buildQuizInput } from "./hashes";
import { DifficultyLevel } from "./types";
import { getReferralTag, submitReferral } from '@divvi/referral-sdk'
// import dotenv from "dotenv";

// dotenv.config();

interface GetOption {
    campaignSelector: number;
    difficultySelector: number;
    run: boolean;
    networkName: string;
}

interface RecordOption extends GetOption {
    recordPoints: boolean;
    runDelegate: boolean;
}

// Confirmation block
const CONFIRMATION = 2;
const cUSD_celo = "0x765de816845861e75a25fca122bb6898b8b1282a";
const cUSD_alfa = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

// Testers
const t1 = process.env.PRIVATE_KEY_TESTER_0xe5d as Hex;
const t2 = process.env.PRIVATE_KEY_TESTER_0xd53 as Hex;
const t3 = process.env.PRIVATE_KEY_TESTER_0x286a as Hex;
const t4 = process.env.PRIVATE_KEY_TESTER_0xdd0 as Hex;
const t5 = process.env.PRIVATE_KEY_TESTER_farca as Hex;
const t6 = process.env.PRIVATE_KEY_ROUTE_0x84F as Hex;
const t7 = process.env.PRIVATE_KEY_0xC0F as Hex;
const t8 = process.env.PRIVATE_KEY_CROSS_0xD7c as Hex;
const t9 = process.env.PRIVATE_KEY_MAIN_0xa1f as Hex;
const consumer = process.env.DIVVI_IDENTIFIER as Hex;

type Method = 'recordPoints' | 'delegateTransaction' | 'getVerificationStatus' | '' | 'verify' | 'sortWeeklyReward' | 'claimReward' | 'setUpCampaign';
const ANSWER_COUNT = [3, 2, 3, 1, 3, 3, 2, 1, 3];
const CAMPAIGNS = [
    ['celo', 'solidity', 'wagmi', 'reactjs', 'reactjs', 'celo', 'solidity', 'celo', 'self-protocol-sdk'],
    ['reactjs', 'wagmi', 'celo', 'solidity', 'celo', 'solidity', 'celo', 'self-protocol-sdk', 'celo'],
    ['celo', 'reactjs', 'divvi', 'self-protocol-sdk', 'wagmi', 'wagmi', 'reactjs', 'wagmi', 'solidity'],
    ['self-protocol-sdk', 'self-protocol-sdk', 'solidity', 'celo', 'wagmi', 'wagmi', 'celo', 'wagmi', 'solidity'],
    ['solidity', 'self-protocol-sdk', 'celo', 'solidity', 'celo', 'reactjs', 'divvi', 'solidity', 'self-protocol-sdk']
]

const DIFFICULTIES : Array<DifficultyLevel[]> = [
    ['medium', 'easy', 'medium', 'hard', 'easy', 'easy', 'hard', 'easy', 'hard'],
    ['easy', 'medium', 'hard', 'easy', 'medium', 'hard', 'medium', 'hard', 'medium'],
    ['hard', 'hard', 'easy', 'medium', 'hard', 'medium', 'easy', 'medium', 'easy']
];

export const testers = Array.from([t1, t2, t3, t4, t5, t6, t7, t8, t9]).map((key) => {
    return {
        key,
        account: privateKeyToAccount(key).address
    }
});

// /**
//  * @dev Get specific set of testers from the list of testers.
//  * @param startIndex : Where to begin 
//  * @param endIndex : Where to stop
//  * @returns : New array of testers
//  */
// function getTesters(startIndex: number, endIndex: number) {
//     assert(startIndex < testers.length && endIndex <= testers.length, "Length mismatch");
//     return testers.slice(startIndex, endIndex);
// }

/**
 * @dev Get wallet client for signing transactions
 * @param networkName : Connected chain name
 * @param pkey : Private key. Note: Protect your private key at all cost. Use environment variables where necessary
 * @returns : Wallet client for signing transactions
 */
function getClients(networkName: string, pkey: Hex) {
    // const endpoint = process.env.ALCHEMY_CELO_MAINNET_ENDPOINT as string;
    const walletClient = createWalletClient({
      chain: networkName === 'alfajores'? celoAlfajores : celo,
      transport: http(),
      account: privateKeyToAccount(pkey)
    });
    const publicCLient = createPublicClient({
        chain: networkName === 'alfajores'? celoAlfajores : celo,
        transport: http()
    });
    return {walletClient, publicCLient};
}

/**
 * @dev Get the contract abi and address using the network name to determine the connected chain
 * @param networkName : Connected chain
 * @returns : Abi and contract address
 */
function getArtifacts(networkName: string) {
    const isAlfajores = networkName === 'alfajores';
    const learna = isAlfajores? learnaTest : learnaMain;
    const claim = isAlfajores? claimTest : claimMain;
    const cUSD = isAlfajores?  cUSD_alfa : cUSD_celo;
    return { 
        learna, 
        cUSD: cUSD as Address,
        claim
    }
}

function getContractInfo(networkName: string, pkey: Hex) {
    const { publicCLient, walletClient } = getClients(networkName, pkey);
    // const contract = getContract({
    //   address,
    //   abi,
    //   client: walletClient
    // });
    return{
        ...getArtifacts(networkName),
        publicCLient,
        walletClient
    }
}

export type NetworkName = 'celo' | 'alfajores' | 'hardhat';
export type Address = `0x${string}`;

/**
 * @dev Record points
 * @param args : parameters
 */
export async function recordPoints(args: RecordOption) {
    const { campaignSelector, difficultySelector, networkName, run, runDelegate, recordPoints } = args;
    assert(campaignSelector < CAMPAIGNS.length, "Campaign selector out of bound");
    assert(difficultySelector < DIFFICULTIES.length, "Difficulty selector out of bound");
    const campaings = CAMPAIGNS[campaignSelector];
    const selectedDifficulties = DIFFICULTIES[difficultySelector];
    
    if(!run) return console.log("Jumped");
    const methods : Method[] = [runDelegate? "delegateTransaction" : "", recordPoints? 'recordPoints' : ''].filter(m => m !== '') as Method[];
    const accounts = campaings.map((campaign, i) => {
        const user = testers[i];
        const { quizResult, hash_ } = buildQuizInput(campaign, selectedDifficulties[i], ANSWER_COUNT[i]);
        const contractInfo = getContractInfo(networkName, user.key);
        const txns = methods.map((functionName) => {
            return{
                address: contractInfo.learna.address as Address,
                abi: contractInfo.learna.abi,
                dataSuffix: getReferralTag({user: functionName === 'recordPoints'? user.account : privateKeyToAccount(t5).address, consumer}), 
                functionName, 
                args: functionName === 'recordPoints'? [user.account, quizResult, hash_] : [],
                value: functionName === 'delegateTransaction'? parseEther('0.001') : undefined
            }
        });
        return {
            txns,
            from: privateKeyToAccount(t5),
            walletClient: contractInfo.walletClient,
            publicClient: contractInfo.publicCLient,
            account: user.account,
        }
    });

    for(let i = 0; i < accounts.length; i++){
        const account = accounts[i];
        let hash : Hex = '0x';
        for(let j = 0; j < account.txns.length; j++){
            const trxn = account.txns[j];
            try {
                hash = await account.walletClient.writeContract({
                    ...trxn,
                    account: account.from
                });
                await account.publicClient.waitForTransactionReceipt({hash, confirmations: CONFIRMATION});
                console.log("Transaction from :", account.account, `- success: Method => ${trxn.functionName}`);
            } catch (error) {
                console.log(account.account, `Could not run ${trxn.functionName} due to`, error?.message || error?.data?.message || error?.reason);
            }
        }
    }
}

/**
 * @dev Set up campaigns
 * @param args : Arguments
 * @returns void
 */
export async function verifyAndClaim({networkName, run} : {networkName: string; run: boolean}) {
    if(!run) return console.log("Jumped");
    console.log("Entered");
    const methods : Method[] = ['verify', 'claimReward'];
    const accounts = testers.map((user, i) => {
        const contractInfo = getContractInfo(networkName, user.key);
        const txns = methods.map((functionName) => {
            return{
                address: contractInfo.claim.address as Address,
                abi: contractInfo.claim.abi,
                dataSuffix: getReferralTag({user: user.account, consumer}),
                functionName, 
                args: []
            }
        });
        return {
            txns,
            from: privateKeyToAccount(user.key),
            walletClient: contractInfo.walletClient,
            publicClient: contractInfo.publicCLient,
            account: user.account,
        }
    });

    for(let i = 0; i < accounts.length; i++){
        const account = accounts[i];
        let hash : Hex = '0x';
        for(let j = 0; j < account.txns.length; j++){
            const trxn = account.txns[j];
            try {
                hash = await account.walletClient.writeContract({
                    ...trxn,
                    account: account.from
                });
                await account.publicClient.waitForTransactionReceipt({hash, confirmations: CONFIRMATION});
                console.log("Transaction from :", account.account, `- success: Method => ${trxn.functionName}`);
            } catch (error) {
                console.log(account.account, "Could not create a pool due to", error?.message || error?.data?.message || error?.reason);
            }
        }
    }
}

/**
 * @dev Set up campaigns
 * @param args : Arguments
 * @returns void
 */
export async function setUpCampaign({networkName, run} : {networkName: string; run: boolean}) {
    const amountToFundInCelo = parseUnits('0.01', 18);
    if(!run) return console.log("Jumped");
    console.log("Entered");
    const methods : Method[] = ['setUpCampaign'];
    const accounts = CAMPAIGNS.map((campaignStr, i) => {
        const contractInfo = getContractInfo(networkName, t9);
        const amount = amountToFundInCelo - parseUnits(i.toString(), 9);
        const txns = methods.map((functionName) => {
            return{
                address: contractInfo.learna.address as Address,
                abi: contractInfo.learna.abi,
                dataSuffix: getReferralTag({user: privateKeyToAccount(t9).address, consumer}),
                functionName, 
                args: [campaignStr, amount, zeroAddress]
            }
        });
        return {
            txns,
            walletClient: contractInfo.walletClient,
            publicClient: contractInfo.publicCLient,
            account: privateKeyToAccount(t9).address,
        }
    });

    for(let i = 0; i < accounts.length; i++){
        const account = accounts[i];
        let hash : Hex = '0x';
        for(let j = 0; j < account.txns.length; j++){
            const trxn = account.txns[j];
            try {
                hash = await account.walletClient.writeContract({...trxn});
                await account.publicClient.waitForTransactionReceipt({hash, confirmations: CONFIRMATION});
                console.log("Transaction from :", account.account, `- success: Method => ${trxn.functionName}`);
            } catch (error) {
                console.log(account.account, "Could not create a pool due to", error?.message || error?.data?.message || error?.reason);
            }
        }
    }
}

/**
 * @dev Set up campaigns
 * @param args : Arguments
 * @returns void
 */
export async function sortWeeklyPayment({networkName, run} : {networkName: string; run: boolean}) {
    if(!run) return console.log("Jumped");
    console.log("Entered");
    const methods : Method[] = ['sortWeeklyReward'];
    const amountInBrainToken = parseEther('50'); // 10 KNOW tokens
	const newIntervalInMin = networkName === 'alfajores'? 25 : 1440/4; // 25 mins for testnet : 6 hours for mainnet
    const accounts = [t9].map((user, i) => {
        const contractInfo = getContractInfo(networkName, user);
        const txns = methods.map((functionName) => {
            const tokenAmt = amountInBrainToken - parseUnits(i.toString(), 18);
            return{
                address: contractInfo.learna.address as Address,
                abi: contractInfo.learna.abi,
                dataSuffix: getReferralTag({user: privateKeyToAccount(user).address, consumer}),
                functionName, 
                args: [tokenAmt, newIntervalInMin]
            }
        });
        return {
            txns,
            walletClient: contractInfo.walletClient,
            publicClient: contractInfo.publicCLient,
            account: privateKeyToAccount(t9).address,
        }
    });

    for(let i = 0; i < accounts.length; i++){
        const account = accounts[i];
        let hash : Hex = '0x';
        for(let j = 0; j < account.txns.length; j++){
            const trxn = account.txns[j];
            try {
                hash = await account.walletClient.writeContract({...trxn});
                await account.publicClient.waitForTransactionReceipt({hash, confirmations: CONFIRMATION});
                console.log("Transaction from :", account.account, `- success: Method => ${trxn.functionName}`);
            } catch (error) {
                console.log(account.account, "Could not create a pool due to", error?.message || error?.data?.message || error?.reason);
            }
        }
    }
}