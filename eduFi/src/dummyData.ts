// import type { QuizData } from "./components/utilities";

// export const categories = ['solidity', 'vyper', 'wagmi', 'ethersjs', 'web3js', 'reactjs'];
// export const difficultyLevels = ['beginner', 'intermediate', 'advance'];
// export const quizData : QuizData = [
//     {
//         category: 'solidity',
//         id: 0,
//         difficultyLevel: 'beginner',
//         taken: false,
//         identifier: '0x41solidity',
//         questions: [
//             {
//                 quest: 'What is Solidity programming?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'Just writing code'
//                     },
//                     {
//                         label: 'b',
//                         value: 'Web3 programming language'
//                     },
//                     {
//                         label: 'c',
//                         value: 'Python-based framework'
//                     },
//                     {
//                         label: 'd',
//                         value: 'Language for building a web app'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'b',
//                     value: 'Web3 programming language'
//                 }
//             },
//             {
//                 quest: 'Which of the following syntaxes is correct?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'uint8 myTime == 5;'
//                     },
//                     {
//                         label: 'b',
//                         value: 'uint8 myTime == 5'
//                     },
//                     {
//                         label: 'c',
//                         value: 'uint8 myTime = 5;'
//                     },
//                     {
//                         label: 'd',
//                         value: 'uint8 myTime = 5'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'c',
//                     value: 'uint8 myTime = 5;'
//                 }
//             },
//             {
//                 quest: 'What is interface in Solidity?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'A method of communicating with other blockchains'
//                     },
//                     {
//                         label: 'b',
//                         value: 'An unimplemented program for interacting with a contract'
//                     },
//                     {
//                         label: 'c',
//                         value: 'A interface for sending funds'
//                     },
//                     {
//                         label: 'd',
//                         value: 'A unique way of calling a function'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'b',
//                     value: 'An unimplemented program for interacting with a contract'
//                 }
//             },
//             {
//                 quest: 'What is constructor in Solidity?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'It is used for calling a contract'
//                     },
//                     {
//                         label: 'b',
//                         value: 'A one-time function called when deploying a contract that update the state variables'
//                     },
//                     {
//                         label: 'c',
//                         value: 'A one-time funciton for deleting and reverting transactions'
//                     },
//                     {
//                         label: 'd',
//                         value: 'A one-time function called after deployment for updating the state variables in a contract'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'b',
//                     value: 'A one-time function called when deploying a contract that update the state variables'
//                 }
//             },
//             {
//                 quest: 'The following except one is a data type in Solidity',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'uint96'
//                     },
//                     {
//                         label: 'b',
//                         value: 'bytes32'
//                     },
//                     {
//                         label: 'c',
//                         value: 'bytes64'
//                     },
//                     {
//                         label: 'd',
//                         value: 'uint32'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'c',
//                     value: 'bytes64'
//                 }
//             }
//         ],
//     },
//     {
//         category: 'reactjs',
//         id: 0,
//         difficultyLevel: 'beginner',
//         taken: false,
//         identifier: '0x42solidity',
//         questions: [
//             {
//                 quest: 'Is reacjJS a programming language?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'No'
//                     },
//                     {
//                         label: 'b',
//                         value: 'Yes'
//                     },
//                     {
//                         label: 'c',
//                         value: 'Somewhat no'
//                     },
//                     {
//                         label: 'd',
//                         value: "I'm indifferent"
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'b',
//                     value: 'Yes'
//                 }
//             },
//             {
//                 quest: 'Which of the following syntaxes is correct in ReactJS?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'const myName = Joy;'
//                     },
//                     {
//                         label: 'b',
//                         value: "const myName = 'Joy';"
//                     },
//                     {
//                         label: 'c',
//                         value: "const 2 = 'Joy';"
//                     },
//                     {
//                         label: 'd',
//                         value: 'const myName = var;'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'b',
//                     value: "const myName = 'Joy';"
//                 }
//             },
//             {
//                 quest: "What is the function of the 'useState' hook? ",
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'For changing variables in state'
//                     },
//                     {
//                         label: 'b',
//                         value: 'For holding variables in state'
//                     },
//                     {
//                         label: 'c',
//                         value: 'For persisting data in application memory'
//                     },
//                     {
//                         label: 'd',
//                         value: 'For holding stale data in storage'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'c',
//                     value: 'For persisting data in application memory'
//                 }
//             },
//             {
//                 quest: "'useCallback' is _____ in ReactJS?",
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'a component'
//                     },
//                     {
//                         label: 'b',
//                         value: 'a state persister'
//                     },
//                     {
//                         label: 'c',
//                         value: 'a hook'
//                     },
//                     {
//                         label: 'd',
//                         value: 'a constructor'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'c',
//                     value: 'a hook'
//                 }
//             },
//             {
//                 quest: 'Which of the following teams created ReactJS?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'Facebook team'
//                     },
//                     {
//                         label: 'b',
//                         value: 'Amazon team'
//                     },
//                     {
//                         label: 'c',
//                         value: 'Google team'
//                     },
//                     {
//                         label: 'd',
//                         value: 'Bitcoin team'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'a',
//                     value: 'Facebook team'
//                 }
//             }
//         ],
//     },
//     {
//         category: 'defi',
//         id: 0,
//         difficultyLevel: 'beginner',
//         taken: false,
//         identifier: '0x44web3',
//         questions: [
//             {
//                 quest: "What does the acronym 'DEFI' stands for?",
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'Decentralized file'
//                     },
//                     {
//                         label: 'b',
//                         value: 'Decentralized financial inclusion'
//                     },
//                     {
//                         label: 'c',
//                         value: 'Decentralized finance'
//                     },
//                     {
//                         label: 'd',
//                         value: "None of the above"
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'c',
//                     value: 'Decentralized finance'
//                 }
//             },
//             {
//                 quest: 'Which of the following syntaxes is correct in ReactJS?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'const myName = Joy;'
//                     },
//                     {
//                         label: 'b',
//                         value: "const myName = 'Joy';"
//                     },
//                     {
//                         label: 'c',
//                         value: "const 2 = 'Joy';"
//                     },
//                     {
//                         label: 'd',
//                         value: 'const myName = var;'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'b',
//                     value: "const myName = 'Joy';"
//                 }
//             },
//             {
//                 quest: "What is the function of the 'useState' hook? ",
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'For changing variables in state'
//                     },
//                     {
//                         label: 'b',
//                         value: 'For holding variables in state'
//                     },
//                     {
//                         label: 'c',
//                         value: 'For persisting data in application memory'
//                     },
//                     {
//                         label: 'd',
//                         value: 'For holding stale data in storage'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'c',
//                     value: 'For persisting data in application memory'
//                 }
//             },
//             {
//                 quest: "'useCallback' is _____ in ReactJS?",
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'a component'
//                     },
//                     {
//                         label: 'b',
//                         value: 'a state persister'
//                     },
//                     {
//                         label: 'c',
//                         value: 'a hook'
//                     },
//                     {
//                         label: 'd',
//                         value: 'a constructor'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'c',
//                     value: 'a hook'
//                 }
//             },
//             {
//                 quest: 'Which of the following teams created ReactJS?',
//                 options: [
//                     {
//                         label: 'a',
//                         value: 'Facebook team'
//                     },
//                     {
//                         label: 'b',
//                         value: 'Amazon team'
//                     },
//                     {
//                         label: 'c',
//                         value: 'Google team'
//                     },
//                     {
//                         label: 'd',
//                         value: 'Bitcoin team'
//                     },
//                 ],
//                 correctAnswer: {
//                     label: 'a',
//                     value: 'Facebook team'
//                 }
//             }
//         ],
//     },
// ];







// {
//   "quiz": [
//     {
//       "id": 1,
//       "question": "What does DeFi stand for?",
//       "options": ["Decentralized Finance", "Defined Finance", "Default Finance"]
//     },
//     {
//       "id": 2,
//       "question": "Which blockchain is most commonly associated with DeFi applications?",
//       "options": ["Ethereum", "Bitcoin", "Ripple"]
//     },
//     {
//       "id": 3,
//       "question": "What is a smart contract?",
//       "options": [
//         "A contract that automatically executes actions based on predefined rules",
//         "A legal agreement between crypto companies",
//         "An insurance policy in DeFi"
//       ]
//     },
//     {
//       "id": 4,
//       "question": "Which of the following is a popular DeFi lending platform?",
//       "options": ["Aave", "Coinbase", "MetaMask"]
//     },
//     {
//       "id": 5,
//       "question": "What does 'liquidity mining' involve?",
//       "options": [
//         "Earning rewards by providing assets to a liquidity pool",
//         "Mining new coins on proof-of-work networks",
//         "Creating NFTs on a blockchain"
//       ]
//     },
//     {
//       "id": 6,
//       "question": "What is a DEX in the context of DeFi?",
//       "options": ["Decentralized Exchange", "Digital Equity Exchange", "Direct Ethereum Exchange"]
//     },
//     {
//       "id": 7,
//       "question": "What is the primary function of an Automated Market Maker (AMM)?",
//       "options": [
//         "To facilitate trades without an order book",
//         "To manage DeFi projects automatically",
//         "To generate crypto news reports"
//       ]
//     },
//     {
//       "id": 8,
//       "question": "Which token standard is commonly used for DeFi tokens on Ethereum?",
//       "options": ["ERC-20", "ERC-721", "ERC-1155"]
//     },
//     {
//       "id": 9,
//       "question": "What does 'yield farming' refer to?",
//       "options": [
//         "Maximizing returns by moving assets across different DeFi platforms",
//         "Growing food using crypto payments",
//         "Staking only on Ethereum 2.0"
//       ]
//     },
//     {
//       "id": 10,
//       "question": "What is 'impermanent loss'?",
//       "options": [
//         "Temporary loss experienced by liquidity providers due to price volatility",
//         "A hacking event in DeFi systems",
//         "A fee charged by smart contracts"
//       ]
//     }
//   ],
//   "answers": {
//     "1": "Decentralized Finance",
//     "2": "Ethereum",
//     "3": "A contract that automatically executes actions based on predefined rules",
//     "4": "Aave",
//     "5": "Earning rewards by providing assets to a liquidity pool",
//     "6": "Decentralized Exchange",
//     "7": "To facilitate trades without an order book",
//     "8": "ERC-20",
//     "9": "Maximizing returns by moving assets across different DeFi platforms",
//     "10": "Temporary loss experienced by liquidity providers due to price volatility"
//   }
// }




// {
//   "defi": {
//     "beginner": {
//       "quiz": [
//         {"id": 1, "question": "What does DeFi stand for?", "options": ["Decentralized Finance", "Defined Finance", "Default Finance"]},
//         {"id": 2, "question": "Which blockchain hosts most DeFi applications?", "options": ["Ethereum", "Bitcoin", "Ripple"]},
//         {"id": 3, "question": "What is a smart contract?", "options": ["A self‑executing contract based on code", "A legal document drafted by lawyers", "An insurance policy"]},
//         {"id": 4, "question": "What is a DEX?", "options": ["Decentralized Exchange", "Digital Equity Exchange", "Direct Ethereum Exchange"]},
//         {"id": 5, "question": "What is a digital wallet in DeFi?", "options": ["Storage for private keys", "A bank account by a crypto company", "A service to mine tokens"]},
//         {"id": 6, "question": "Which standard is used by most DeFi tokens on Ethereum?", "options": ["ERC‑20", "ERC‑721", "ERC‑1155"]},
//         {"id": 7, "question": "What is a liquidity pool?", "options": ["Funds locked in a smart contract to enable trading", "A savings account", "A mining rig"]},
//         {"id": 8, "question": "What does 'cold wallet' mean?", "options": ["Offline wallet", "Hot wallet", "Blockchain explorer"]},
//         {"id": 9, "question": "What is chain oracle?", "options": ["A service providing off‑chain data to smart contracts", "A central bank", "A type of hack"]},
//         {"id":10, "question": "What is impermanent loss?", "options": ["Temporary loss from price divergence in pools", "A theft from hacking", "A fee charged by protocols"]}
//       ],
//       "answers": {
//         "1": "Decentralized Finance",
//         "2": "Ethereum",
//         "3": "A self‑executing contract based on code",
//         "4": "Decentralized Exchange",
//         "5": "Storage for private keys",
//         "6": "ERC‑20",
//         "7": "Funds locked in a smart contract to enable trading",
//         "8": "Offline wallet",
//         "9": "A service providing off‑chain data to smart contracts",
//         "10": "Temporary loss from price divergence in pools"
//       }
//     },
//     "intermediate": {
//       "quiz": [
//         {"id": 11, "question": "What functionality does Aave provide?", "options": ["Lending and borrowing", "Bitcoin mining", "NFT trading"]},
//         {"id": 12, "question": "What is liquidity mining?", "options": ["Earning tokens by providing liquidity", "Proof-of-work mining", "Playing blockchain games"]},
//         {"id": 13, "question": "What is yield farming?", "options": ["Optimizing returns across protocols", "Growing wheat with crypto", "Staking ETH only"]},
//         {"id": 14, "question": "What is composability in DeFi?", "options": ["Protocols acting like money legos", "Using centralized banks", "Hacking smart contracts"]},
//         {"id": 15, "question": "What is a governance token?", "options": ["Token for voting on protocol decisions", "Pays transaction fees", "A peg‑stable token"]},
//         {"id": 16, "question": "What's a DeFi aggregator?", "options": ["Platform combining access to many DEXs", "Insurance company", "Blockchain explorer"]},
//         {"id": 17, "question": "What is on‑chain governance?", "options": ["Voting using smart contracts", "Bank-based decision", "External legal court"]},
//         {"id": 18, "question": "What are real‑world assets (RWAs) in DeFi?", "options": ["Tokenized real-world items like property", "Game items", "Only NFTs"]},
//         {"id": 19, "question": "What is a flash loan?", "options": ["Uncollateralized loan in one transaction", "Microbank loan", "Credit card advance"]},
//         {"id":20, "question": "What is a reentrancy attack?", "options": ["Exploit calling contract before state updates", "Hacking user wallets", "Phishing scam"]}
//       ],
//       "answers": {
//         "11": "Lending and borrowing",
//         "12": "Earning tokens by providing liquidity",
//         "13": "Optimizing returns across protocols",
//         "14": "Protocols acting like money legos",
//         "15": "Token for voting on protocol decisions",
//         "16": "Platform combining access to many DEXs",
//         "17": "Voting using smart contracts",
//         "18": "Tokenized real-world items like property",
//         "19": "Uncollateralized loan in one transaction",
//         "20": "Exploit calling contract before state updates"
//       }
//     },
//     "advanced": {
//       "quiz": [
//         {"id": 21, "question": "What is impermanent loss mitigation?", "options": ["Using stable pools or hedging", "Buying derivatives", "Switching blockchains"]},
//         {"id": 22, "question": "What is oracle manipulation?", "options": ["Feeding false price data to protocols", "Changing smart contract code", "Legal regulatory action"]},
//         {"id": 23, "question": "What is front‑running in DeFi?", "options": ["Placing transactions ahead by fee manipulation", "Mining new blocks", "Creating new tokens"]},
//         {"id": 24, "question": "What are flashbots?", "options": ["Private transaction relay to miners", "Smart contract audit firms", "DEX aggregators"]},
//         {"id": 25, "question": "What is DAO treasury?", "options": ["Funds held by a DAO for governance", "A bank account", "A stablecoin reserve"]},
//         {"id": 26, "question": "What is formal verification?", "options": ["Mathematical proof of smart contract correctness", "Code obfuscation", "Marketing audit"]},
//         {"id": 27, "question": "What is quadratic voting?", "options": ["Voting weighted by square root of tokens", "One token one vote", "Majority stake only"]},
//         {"id": 28, "question": "What is a price oracle attack?", "options": ["Manipulating price feeds to exploit protocols", "Code injection", "Sybil voting scheme"]},
//         {"id": 29, "question": "What is a governance Sybil attack?", "options": ["Creating fake identities to boost voting power", "Flash loan misuse", "Impermanent loss"]},
//         {"id":30, "question": "What is a DeFi insurance pool?", "options": ["Pooled funds to compensate hacks", "DeFi savings account", "Lending collateral pool"]}
//       ],
//       "answers": {
//         "21": "Using stable pools or hedging",
//         "22": "Feeding false price data to protocols",
//         "23": "Placing transactions ahead by fee manipulation",
//         "24": "Private transaction relay to miners",
//         "25": "Funds held by a DAO for governance",
//         "26": "Mathematical proof of smart contract correctness",
//         "27": "Voting weighted by square root of tokens",
//         "28": "Manipulating price feeds to exploit protocols",
//         "29": "Creating fake identities to boost voting power",
//         "30": "Pooled funds to compensate hacks"
//       }
//     }
//   }
// }
