import type { QuizData } from "./components/utilities";

export const categories = ['solidity', 'vyper', 'wagmi', 'ethersjs', 'web3js', 'reactjs'];
export const difficultyLevels = ['beginner', 'intermediate', 'advance'];
export const quizData : QuizData = [
    {
        category: 'solidity',
        id: 0,
        difficultyLevel: 'beginner',
        taken: false,
        identifier: '0x41solidity',
        questions: [
            {
                quest: 'What is Solidity programming?',
                options: [
                    {
                        label: 'a',
                        value: 'Just writing code'
                    },
                    {
                        label: 'b',
                        value: 'Web3 programming language'
                    },
                    {
                        label: 'c',
                        value: 'Python-based framework'
                    },
                    {
                        label: 'd',
                        value: 'Language for building a web app'
                    },
                ],
                correctAnswer: {
                    label: 'b',
                    value: 'Web3 programming language'
                }
            },
            {
                quest: 'Which of the following syntaxes is correct?',
                options: [
                    {
                        label: 'a',
                        value: 'uint8 myTime == 5;'
                    },
                    {
                        label: 'b',
                        value: 'uint8 myTime == 5'
                    },
                    {
                        label: 'c',
                        value: 'uint8 myTime = 5;'
                    },
                    {
                        label: 'd',
                        value: 'uint8 myTime = 5'
                    },
                ],
                correctAnswer: {
                    label: 'c',
                    value: 'uint8 myTime = 5;'
                }
            },
            {
                quest: 'What is interface in Solidity?',
                options: [
                    {
                        label: 'a',
                        value: 'A method of communicating with other blockchains'
                    },
                    {
                        label: 'b',
                        value: 'An unimplemented program for interacting with a contract'
                    },
                    {
                        label: 'c',
                        value: 'A interface for sending funds'
                    },
                    {
                        label: 'd',
                        value: 'A unique way of calling a function'
                    },
                ],
                correctAnswer: {
                    label: 'b',
                    value: 'An unimplemented program for interacting with a contract'
                }
            },
            {
                quest: 'What is constructor in Solidity?',
                options: [
                    {
                        label: 'a',
                        value: 'It is used for calling a contract'
                    },
                    {
                        label: 'b',
                        value: 'A one-time function called when deploying a contract that update the state variables'
                    },
                    {
                        label: 'c',
                        value: 'A one-time funciton for deleting and reverting transactions'
                    },
                    {
                        label: 'd',
                        value: 'A one-time function called after deployment for updating the state variables in a contract'
                    },
                ],
                correctAnswer: {
                    label: 'b',
                    value: 'A one-time function called when deploying a contract that update the state variables'
                }
            },
            {
                quest: 'The following except one is a data type in Solidity',
                options: [
                    {
                        label: 'a',
                        value: 'uint96'
                    },
                    {
                        label: 'b',
                        value: 'bytes32'
                    },
                    {
                        label: 'c',
                        value: 'bytes64'
                    },
                    {
                        label: 'd',
                        value: 'uint32'
                    },
                ],
                correctAnswer: {
                    label: 'c',
                    value: 'bytes64'
                }
            }
        ],
    },
    {
        category: 'reactjs',
        id: 0,
        difficultyLevel: 'beginner',
        taken: false,
        identifier: '0x42solidity',
        questions: [
            {
                quest: 'Is reacjJS a programming language?',
                options: [
                    {
                        label: 'a',
                        value: 'No'
                    },
                    {
                        label: 'b',
                        value: 'Yes'
                    },
                    {
                        label: 'c',
                        value: 'Somewhat no'
                    },
                    {
                        label: 'd',
                        value: "I'm indifferent"
                    },
                ],
                correctAnswer: {
                    label: 'b',
                    value: 'Yes'
                }
            },
            {
                quest: 'Which of the following syntaxes is correct in ReactJS?',
                options: [
                    {
                        label: 'a',
                        value: 'const myName = Joy;'
                    },
                    {
                        label: 'b',
                        value: "const myName = 'Joy';"
                    },
                    {
                        label: 'c',
                        value: "const 2 = 'Joy';"
                    },
                    {
                        label: 'd',
                        value: 'const myName = var;'
                    },
                ],
                correctAnswer: {
                    label: 'b',
                    value: "const myName = 'Joy';"
                }
            },
            {
                quest: "What is the function of the 'useState' hook? ",
                options: [
                    {
                        label: 'a',
                        value: 'For changing variables in state'
                    },
                    {
                        label: 'b',
                        value: 'For holding variables in state'
                    },
                    {
                        label: 'c',
                        value: 'For persisting data in application memory'
                    },
                    {
                        label: 'd',
                        value: 'For holding stale data in storage'
                    },
                ],
                correctAnswer: {
                    label: 'c',
                    value: 'For persisting data in application memory'
                }
            },
            {
                quest: "'useCallback' is _____ in ReactJS?",
                options: [
                    {
                        label: 'a',
                        value: 'a component'
                    },
                    {
                        label: 'b',
                        value: 'a state persister'
                    },
                    {
                        label: 'c',
                        value: 'a hook'
                    },
                    {
                        label: 'd',
                        value: 'a constructor'
                    },
                ],
                correctAnswer: {
                    label: 'c',
                    value: 'a hook'
                }
            },
            {
                quest: 'Which of the following teams created ReactJS?',
                options: [
                    {
                        label: 'a',
                        value: 'Facebook team'
                    },
                    {
                        label: 'b',
                        value: 'Amazon team'
                    },
                    {
                        label: 'c',
                        value: 'Google team'
                    },
                    {
                        label: 'd',
                        value: 'Bitcoin team'
                    },
                ],
                correctAnswer: {
                    label: 'a',
                    value: 'Facebook team'
                }
            }
        ],
    },
];