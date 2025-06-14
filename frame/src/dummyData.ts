
export type QuizDatum = {
    category: string;
    id: number,
    difficultyLevel: string;
    questions: Array<{
        quest: string;
        options: Array<{
            label: string;
            value: string;
        }>;
        correctAnswer: {
            label: string;
            value: string;
        };
        userAnswer?: {
            label: string;
            value: string;
        };
    }>;
};

export type QuizData = Array<QuizDatum>;
export type Path = 'selectcategory' | 'review' | 'sendtip' | 'scores' | 'stats' | 'quiz' | 'home' | 'generateuserkey' | 'profile';
export type DisplayQuizProps = {
    indexedAnswer: number;
    selectedQuizData: {category: string, data: QuizDatum};
    setpath: (arg: Path) => void;
    handleSelectAnswer: (arg: {label: string, value: string}) => void;
}

export const categories = ['solidity', 'vyper', 'wagmi', 'ethersJs', 'web3Js', 'ReactJs'];
export const difficultyLevels = ['beginner', 'intermediate', 'advance'];
export const quizData : QuizData = [
    {
        category: 'solidity',
        id: 0,
        difficultyLevel: 'beginner',
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
];