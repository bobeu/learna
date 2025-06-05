#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { zeroAddress } = require('viem');

// Configuration - directory files
const HARDHAT_ARTIFACTS_PATH = './deployments/';
const REACT_DATA_PATH = '../Deployment/contractsData';
const GLOBAL_OUTPUT_PATH = '../Deployment/contractsData/global.json';
const approvedFunctions = ['createPool', 'getFinance', 'deposit', 'payback', 'liquidate', 'deposits', 'closePool', 'contribute', 'registerToEarnPoints', 'provideLiquidity', 'removeLiquidity', 'borrow', 'claimTestTokens', 'setBaseToken', 'setCollateralToken', 'panicUnlock', 'unlockToken', 'lockToken', 'transferFrom', 'approve', 'getCollateralQuote', 'getCurrentDebt', 'allowance', 'balanceOf', 'getProviders', 'symbol', 'getFactoryData', 'getPoolRecord', 'getPoints', 'getSupportedAssets', 'getPoolData'];
const readFunctions = ['getCollateralQuote', 'getCurrentDebt', 'allowance', 'balanceOf', 'getProviders', 'symbol', 'getFactoryData', 'getPoolRecord', 'getPoints', 'getSupportedAssets', 'getPoolData'];
const functionsRequireArgUpdate = ['transferFrom', 'approve', 'deposit'];
const chainName = {44787: 'alfajores', 4157: 'crossstestnet', 42220: 'celo', 4158: 'crossmainnet'};
const chainIds = [44787, 4157, 42220, 4158]
let workBuild = {
    44787: [],
    42220: [],
    4157:[],
    4158: []
};

let globalOutput = {
    approvedFunctions: approvedFunctions,
    chainName: chainName,
    chainIds: chainIds,
    paths: workBuild,
    contractAddresses: [{"stablecoin": "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"}, {"stablecoin": zeroAddress}],
};

let itemOutput = {
    contractAddress: '',
    functionName: '',
    inputCount: 0,
    requireArgUpdate: false,
    abi: []
};

// Create the React ABI directory if it doesn't exist
if (!fs.existsSync(REACT_DATA_PATH)) {
    fs.mkdirSync(REACT_DATA_PATH, { recursive: true });
}

// Function to walk through directories recursively
function walkDir(dir) {
    let list = fs.readdirSync(dir);
    if(list.includes('contracts.json')){
        list = list.filter((item) => item !== 'contracts.json')
    }
    
    chainIds.forEach((chain) => {
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            const isChainRelated = filePath.includes(chainName[chain]);
            const fileWithSolcInputs = file.includes('solcInputs');
            const fileWithChainId = file.endsWith('.chainId');
            if (stat && stat.isDirectory() && !fileWithSolcInputs && !fileWithChainId) {
                if(isChainRelated){
                    workBuild[chain].concat(walkDir(filePath));
                }
            } else {
                if(isChainRelated && !fileWithSolcInputs && !fileWithChainId) workBuild[chain].push(filePath);
            }
        });
    })
    return workBuild;
}

// Main script
console.log("🔄 Syncing contracts data to Next App...");

try {
    // Find all artifact JSON files
    walkDir(HARDHAT_ARTIFACTS_PATH); 
    chainIds.forEach((chainId) => {
        workBuild[chainId].forEach(filepath => {
            const artifact = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            const basename = path.basename(filepath).replace('.json', '');

            // Extract and save all the required data such as the ABI, contractAddress, inputs etc
            artifact.abi.forEach((item) => {
                if(item.type === 'function' && approvedFunctions.includes(item.name)) {
                    let inputs = [];
                    const chainIndex = chainIds.indexOf(chainId);
                    item.inputs && item.inputs.forEach((input) => {
                        inputs.push(input.name);
                    });
                    const isReadFunction = readFunctions.includes(item.name);
                    const stdItemOutPath = path.join(REACT_DATA_PATH, `${item.name}.json`);
                    itemOutput.abi = isReadFunction? [item] : artifact.abi;
                    itemOutput.inputCount = inputs.length;
                    itemOutput.functionName = item.name;
                    itemOutput.contractAddress = artifact.address;
                    itemOutput.requireArgUpdate = functionsRequireArgUpdate.includes(item.name)
                    fs.writeFileSync(stdItemOutPath, JSON.stringify(itemOutput, null, 2));
                    globalOutput.contractAddresses[chainIndex][basename] = artifact.address;

                }
            })
        });

    });
    fs.writeFileSync(GLOBAL_OUTPUT_PATH, JSON.stringify(globalOutput, null, 2));
    // console.log("StdOut", stdOut);
    console.log("✅ Data synchronization completed!");
} catch (error) {
    console.error("❌ Error syncing ABIs:", error);
    process.exit(1);
}




































// #!/usr/bin/env node

// const fs = require('fs');
// const path = require('path');
// const { zeroAddress } = require('viem');

// // Configuration - directory files
// const HARDHAT_ARTIFACTS_PATH = './deployments/';
// const REACT_DATA_PATH = '../Deployment';
// const approvedFunctions = ['createPool', 'getFinance', 'deposit', 'payback', 'liquidate', 'deposits', 'closePool', 'contribute', 'registerToEarnPoints', 'provideLiquidity', 'removeLiquidity', 'borrow', 'claimTestTokens', 'setBaseToken', 'setCollateralToken', 'panicUnlock', 'unlockToken', 'lockToken', 'transferFrom', 'approve', 'getCollateralQuote', 'getCurrentDebt', 'allowance', 'balanceOf', 'getProviders', 'symbol', 'getFactoryData', 'getPoolRecord', 'getPoints', 'getSupportedAssets', 'getPoolData'];
// const functionsRequireArgUpdate = ['transferFrom', 'approve', 'deposit'];
// const chainName = {44787: 'alfajores', 4157: 'crosstestnet'};
// const chainIds = [44787, 4157]
// let workBuild = {
//     44787: [],
//     4157: [],
// };

// let stdOut = {
//     approvedFunctions: approvedFunctions,
//     chainName: chainName,
//     chainIds: chainIds,
//     data: [[], []],
//     paths: workBuild,
//     contracts: [{"stablecoin": "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"}, {"stablecoin": zeroAddress}],
// };

// // Create the React ABI directory if it doesn't exist
// if (!fs.existsSync(REACT_DATA_PATH)) {
//     fs.mkdirSync(REACT_DATA_PATH, { recursive: true });
// }

// // Function to walk through directories recursively
// function walkDir(dir) {
//     let list = fs.readdirSync(dir);
//     if(list.includes('contracts.json')){
//         list = list.filter((item) => item !== 'contracts.json')
//     }
    
//     chainIds.forEach((chain) => {
//         list.forEach(file => {
//             const filePath = path.join(dir, file);
//             const stat = fs.statSync(filePath);
//             const isChainRelated = filePath.includes(chainName[chain]);
//             const fileWithSolcInputs = file.includes('solcInputs');
//             const fileWithChainId = file.endsWith('.chainId');
//             if (stat && stat.isDirectory() && !fileWithSolcInputs && !fileWithChainId) {
//                 if(isChainRelated){
//                     workBuild[chain].concat(walkDir(filePath));
//                 }
//             } else {
//                 if(isChainRelated && !fileWithSolcInputs && !fileWithChainId) workBuild[chain].push(filePath);
//             }
//         });
//     })
//     return workBuild;
// }

// // Main script
// console.log("🔄 Syncing contracts data to Next App...");

// try {
//     // Find all artifact JSON files
//     walkDir(HARDHAT_ARTIFACTS_PATH);
//     const stdOutPath = path.join(REACT_DATA_PATH, 'contractsData.json');
//     chainIds.forEach((chainId) => {
//         workBuild[chainId].forEach(filepath => {
//             const artifact = JSON.parse(fs.readFileSync(filepath, 'utf8'));
//             const basename = path.basename(filepath).replace('.json', '');
//             // console.log("BaseName: ", basename);
//             // Extract and save all the required data such as the ABI, contractAddress, inputs etc
//             artifact.abi.forEach((item) => {
//                 const abi = item;
//                 if(item.type === 'function' && approvedFunctions.includes(item.name)) {
//                     let inputs = [];
//                     const chainIndex = chainIds.indexOf(chainId);
//                     item.inputs && item.inputs.forEach((input) => {
//                         inputs.push(input.name);
//                     });
//                     stdOut.data[chainIndex].push({
//                         abi: artifact.abi,
//                         contractAddress: artifact.address,
//                         inputCounts: inputs.length,
//                         inputs: inputs,
//                         functionName: item.name,
//                         requireArgUpdate: functionsRequireArgUpdate.includes(item.name)
//                     });
//                     stdOut.contracts[chainIndex][basename] = artifact.address;

//                 }
//             })
//         });

//     });
//     fs.writeFileSync(stdOutPath, JSON.stringify(stdOut, null, 2));
//     // console.log("StdOut", stdOut);
//     console.log("✅ Data synchronization completed!");
// } catch (error) {
//     console.error("❌ Error syncing ABIs:", error);
//     process.exit(1);
// }