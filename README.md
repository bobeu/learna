## Educaster

An open-source educational learn-and-earn initiative built on the Farcaster mini-apps.

![image](https://github.com/user-attachments/assets/1d8cccbf-4707-4624-8f35-76002977708a)

## Problems
Consistent learning has become a paramount and essential key to success in any field, most especially in the technology space. The system and method of learning play a crucial role in the journey of many. Due to rapidly changing technologies, it's challenging to stay informed, and reading lengthy, extensive materials is becoming increasingly difficult for everyone seeking to consistently update their knowledge base.

## Solution
With the advent of artificial intelligence, learning has become easier. Our solution leverages AI to provide intuitive, simple, fun, and rewarding methods of learning for developers looking to update their knowledge base, such as Quizzes. Our idea was born from the Farcaster quiz hackathon to build a Farcaster-based mini-app on the Celo Blockchain that uses AI to generate engaging quizzes with different difficulty levels, including other personalized learning methods we will introduce in the future.

## Mission
Our mission is to create a fun, engaging, and rewarding learning path for our users.

## How it works

As a user, when you visit the landing page,
- You can immediately start a quiz, but we recommend that you connect your wallet first. If you're a Farcaster user, you will be connected to your wallet inside the Farcaster app.
- Optionally, you can generate your key for the week. Each week uses a unique key to identify the user's slot and save their spot, including their scores for the week. Every week has a unique identifier that is visible on your profile as a user. To access your profile, click on the human-like icon at the top of the application. We recommend you create your key at the beginning of every new week. For each week, you will be able to claim your reward provided you participated and earned points. Remember, your key gives you full access to this feature.
- Start taking quizzes. You can only attempt a maximum of 120 quizzes in a week. Remember you need some rest.
- After completing a quiz, you can view your scores. Submit your scores on-chain immediately. If you leave the page or cancel it, that quiz is lost. It is worth noting that questions cannot be rolled back. When you select an answer, it automatically moves to another. So be very sure of the answer you're picking. The whole quiz has a deadline. The timer starts counting as soon as you click `start`.
- Every weekend, check your reward eligibility on your profile. If you are, you will see a green light to proceed to claim. `Happy QUIZZING` .


## Architecture (How we build it)

Educaster is a mobile-first, react-based application built for the web3 and web2 audiences with a higher preference for the former. By design, it is in three sections:

- A smart contract, deployed on the Celo main network, that manages sensitive and financial logic.
- A user interface for interacting with the application.
- Backend service that manages interactions with the Farcaster client, such as publishing casts, notifying the users, etc.

### Stacks
- Solidity: For smart contracts
- Hardhat: Smart contract environment
- NextJs: Frontend, authentication, and API requests
- ReactJS: User interface
- Farcaster SDK: Base SDK for mini-app
- Neyna: A wrapper around Fthe arcaster SDK for publishing casts
- Wagmi: For connecting the user to the app, read and write information to the blockchain
- Framer motion: For subtle UI animation
- Divvi SDK: For integrating the Divvi referral reward system
- Shadcn: Simple UI components

## Smart contracts information (Celo mainnet)
- Grow token smart contract deployed at __[0x800B1666d554e249FCCf5f0855455F43a140d2e5]()__ 
- Factory contract (main app logic) deployed at __[0x9761496D5a1968B0320bb0059e4D0fDA29861805]()__ 

## Site
- [Interact with Educaster here](https://learna.vercel.app)

__[Here is a demo on how to use the app]()__

## How to run
To run the project, please follow these steps:

```
    git clone https://github.com/bobeu/learna.git
```

### smart contracts

```
    cd learna/smartcontracts
```

```
    npm install
```

For smart contract commands, follow the commands inside the `scripts` block inside the `package.json` file.

### Frontend
Be sure to update the env file with yours. Better still, ignore it, it will automatically be updated using the .env.local when you run the build command. 

```
    cd learna/eduFi
```

```
    npm install
```

```
    npm run dev
```

To build for production, run

```
    npm run build
```

## About us

Educaster team, curious mind with a teacher’s touch and a developer’s discipline, we craft interactive quizzes like a sculptor carves marble — precisely, creatively, and always with purpose. Sometimes, we achieve this manually, and often with the help of Aritificial intelligence using a carefully and skillfully prepared prompt. We navigate subjects such as Solidity, ReactJS, DeFi, Wagmi, etc, with ease, blending logic and learning into bite-sized brilliance. When not hashing questions into unique hex codes (literally), We are building tools that teach, challenge, and empower others.

Our team clearly got a strong grasp of dev skills and an interest in ed-tech-style systems. 


<!-- 0xA7999939AD2BBD2c9571dE3F48210f491D0Dd204 GROWTOKEN -->

 <!-- 0xfFe64d3D0F7D1Bba456C7530206B7Ab3007F33AB Learna new -->
 