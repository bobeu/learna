<img width="1341" height="633" alt="image" src="https://github.com/user-attachments/assets/afe36899-6136-4ecb-b46a-ddfc028276a8" />

## Description
Learna is a decentralized Web3 learning platform designed to revolutionize the traditional educational experience by merging the worlds of learning and blockchain. The platform offers users an interactive and gamified learning environment that is not only fun and engaging but also incentivizes participation through rewards. With features like quizzes, videos, and guided learning paths, Learna creates a more dynamic and decentralized approach to education.

## Problem Statement
In today’s rapidly evolving tech landscape, consistent learning is not just beneficial—it’s essential for success. However, the traditional methods of consuming information, such as lengthy articles and overwhelming documentation, make it difficult for developers to keep up. With new technologies emerging at a relentless pace, staying current feels more like a burden than a journey. The challenge lies in making learning both accessible and engaging, especially for developers who must constantly upgrade their skills to stay relevant.

## Solution Statement
Leveraging the power of artificial intelligence, we’re transforming how developers learn—making it intuitive, engaging, and rewarding. Our platform uses AI to generate dynamic quizzes tailored to different difficulty levels, offering a fun and efficient way to stay updated in the fast-paced tech world. Born out of the Farcaster Quiz Hackathon, Learna is built as a Farcaster-based mini-app on the Celo blockchain. It combines decentralized tech with personalized learning experiences, with more interactive and adaptive methods on the way.

## Goal
The core goals of Learna are:
- To make learning enjoyable, interactive, and community-driven.
- To empower users by rewarding their educational progress using blockchain incentives.
- To ensure fairness and authenticity in learning achievements through decentralized verification.
- To create a scalable and modular platform that encourages continuous learning in the Web3 space
 
# Architecture Overview
## Frontend (Client Interface)
- `NextJS` + `ReactJS` provide a modern, server-rendered application with a fast and interactive UI.
- TailwindCSS is used for utility-first, responsive styling.
- Users interact with quizzes, videos, and other learning modules through smooth, intuitive interfaces.

## Smart Contracts (Backend on Blockchain)
- Solidity is used to write secure and efficient smart contracts for handling rewards, scoring, and financial operations.
- Hardhat manages the development, testing, and deployment of smart contracts.
- Contracts are deployed on Celo Mainnet, offering low fees and high scalability.

## Verification & Anti-Cheating
- Self-Protocol SDK is integrated to verify user identities, prevent manipulation, and restrict access based on regional constraints.

## Reward System
- Smart contracts automatically distribute rewards based on learner activity and performance.
- Scoring logic is handled on-chain to ensure transparency and trust.

| __Layer__                    | __Technology__                   |
| ---------------------------- | -------------------------------- |
| **Frontend**                 | NextJS, ReactJS, TailwindCSS     |
| **Smart Contracts**          | Solidity, Hardhat                |
| **Programming Language**     | TypeScript                       |
| **Blockchain**               | Celo Mainnet, ALfajores          |
| **Verification SDK**         | Self-Protocol SDK                |


## How it works

As a user, when you visit the landing page,
- You can immediately start a quiz, but we recommend that you connect your wallet first. If you're a Farcaster user, you will be connected to your wallet inside the Farcaster app.
- Optionally, you can generate your key for the week. Each week uses a unique key to identify the user's slot and save their spot, including their scores for the week. Every week has a unique identifier that is visible on your profile as a user. To access your profile, click on the human-like icon at the top of the application. We recommend you create your key at the beginning of every new week. For each week, you will be able to claim your reward provided you participated and earned points. Remember, your key gives you full access to this feature.
- Start taking quizzes. You can only attempt a maximum of 120 quizzes in a week. Remember, you need some rest.
- After completing a quiz, you can view your scores. Submit your scores on-chain immediately. If you leave the page or cancel it, that quiz is lost. It is worth noting that questions cannot be rolled back. When you select an answer, it automatically moves to another. So be very sure of the answer you're picking. The whole quiz has a deadline. The timer starts counting as soon as you click `start`.
- Every weekend, check your reward eligibility on your profile. If you are, you will see a green light to proceed to claim. `Happy QUIZZING`.


## Architecture (How we build it)

Educaster is a mobile-first, React-based application built for the web3 and web2 audiences with a higher preference for the former. By design, it is in three sections:

- A smart contract, deployed on the Celo main network, that manages sensitive and financial logic.
- A user interface for interacting with the application.
- Backend service that manages interactions with the Farcaster client, such as publishing casts, notifying the users, etc.

### Stacks
- Solidity: For smart contracts
- Hardhat: Smart contract environment
- NextJs: Frontend, authentication, and API requests
- ReactJS: User interface
- Farcaster SDK: Base SDK for mini-app
- Neyna: A wrapper around the Farcaster SDK for publishing casts
- Wagmi: For connecting the user to the app, read and write information to the blockchain
- Framer motion: For subtle UI animation
- Divvi SDK: For integrating the Divvi referral reward system
- Shadcn: Simple UI components

## Smart contracts information (Celo mainnet)
- Grow token smart contract deployed at __[0x800B1666d554e249FCCf5f0855455F43a140d2e5]()__ 
- Factory contract (main app logic) deployed at __[0x9761496D5a1968B0320bb0059e4D0fDA29861805]()__ 

## Site
- [Interact with Educaster here](https://learna.vercel.app)

## [Watch the dem0]()

## Summary
Learna addresses the lack of motivation and engagement in traditional learning systems by offering a decentralized solution that rewards users for their learning efforts. By utilizing blockchain and smart contracts, the platform ensures transparency, fairness, and automation in its reward distribution. Whether you're watching a tutorial, solving a quiz, or exploring a subject path, every action contributes to your growth—and your wallet.

## About us

Our team is comprised of curious minds with a teacher’s touch and a developer’s discipline. We craft interactive quizzes like a sculptor carves marble — precisely, creatively, and always with purpose. Sometimes, we achieve this manually, and often with the help of Artificial intelligence using a carefully and skillfully prepared prompt. We navigate subjects such as Solidity, ReactJS, DeFi, Wagmi, etc, with ease, blending logic and learning into bite-sized brilliance. When not hashing questions into unique hex codes (literally), we are building tools that teach, challenge, and empower others.
Our team got a strong grasp of dev skills and an interest in ed-tech-style systems. 


<!-- 0xA7999939AD2BBD2c9571dE3F48210f491D0Dd204 GROWTOKEN -->

 <!-- 0xfFe64d3D0F7D1Bba456C7530206B7Ab3007F33AB Learna new -->
 
