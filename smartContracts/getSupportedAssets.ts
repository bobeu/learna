export type NetworkName = 'crosstestnet' | 'crossfimainnet' | 'celo' | 'alfajores' | 'hardhat';

export const getContractData = (networkName: string) => {
    let flexpool = '';;
    let priceData = [{}];
    let wrappedAssetMetadata : {symbol: string, name: string} = {symbol: '', name: ''};
    let isNotHardhat = true;

    switch (networkName) {
        case 'alfajores':
            flexpool = 'CeloBased';
            wrappedAssetMetadata = { name: 'Wrapped Test Celo', symbol: 'TCELO'};
            priceData = [{
                any: '0',
                decimals: 8,
                pair: 'CELO/USD',
                feedAddr : '0x022F9dCC73C5Fb43F2b4eF2EF9ad3eDD1D853946', 
            }];
            break;
        case 'celo':
            flexpool = 'CeloBased';
            wrappedAssetMetadata = { name: 'Wrapped Celo', symbol: 'WCELO'};
            priceData = [{
                any: '0',
                decimals: 8,
                pair: 'CELO/USD',
                feedAddr: '0x0568fD19986748cEfF3301e55c0eb1E729E0Ab7e'
            }];
            break;
        case 'crosstestnet':
            flexpool = 'CrossfiBased';
            wrappedAssetMetadata = { name: 'Wrapped Test XFI', symbol: 'TXFI'};
            // oracleAddress = '0x33df80cdf0c9ff686261b11263d9f4a3ccc3d07f';
            priceData = [{
                latestPrice: '0',
                timestampOflatestPrice: '0',
                pair: 'XFI/USD',
                decimals: 8
            }];
            break;
        case 'crossfimainnet':
            flexpool = 'CrossfiBased';
            wrappedAssetMetadata = { name: 'Wrapped XFI', symbol: 'WXFI'};
            priceData = [{
                latestPrice: '0',
                timestampOflatestPrice: '0',
                pair: 'XFI/USD',
                decimals: 8
            }];
            // oracleAddress = '0x859e221ada7cebdf5d4040bf6a2b8959c05a4233';
            break;
                
        // Defaults to Hardhat
        default:
            isNotHardhat = false;
            flexpool = 'HardhatBased';
            // oracleAddress = zeroAddress;
            wrappedAssetMetadata = { name: 'Wrapped Token', symbol: 'WToken'};
            break;
    }

    console.log(`NetworkName: ${networkName}`);
    return { flexpool, wrappedAssetMetadata, priceData, isNotHardhat }
};

export const baseContractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"transferAndCall","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"typeAndVersion","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"}];

// 0xC8CeED65E236F7d6fB378b8715f9e6912e486A54 asset address on dia 