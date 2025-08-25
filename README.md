<img width="1362" height="598" alt="image" src="https://github.com/user-attachments/assets/968c24d7-915c-4644-b269-915f49727844" />


## Description
Learna is a decentralized Web3 learning platform designed to revolutionize the traditional educational experience by merging the worlds of learning and blockchain. The platform offers users an interactive and gamified learning environment that is not only fun and engaging but also incentivizes participation through rewards. With features like quizzes, videos, and guided learning paths, Learna creates a more dynamic and decentralized approach to education.

## Problem Statement
In today’s rapidly evolving tech landscape, consistent learning is not just beneficial—it’s essential for success. However, the traditional methods of consuming information, such as lengthy articles and overwhelming documentation, make it difficult for people to keep up. With new technologies emerging at a relentless pace, staying current feels more like a burden than a journey. The challenge lies in making learning both accessible and engaging, especially for developers who must constantly upgrade their skills to stay relevant.

## Solution Statement
Leveraging the power of artificial intelligence, we’re transforming how developers learn—making it intuitive, engaging, and rewarding. Our platform uses AI to generate dynamic quizzes tailored to different difficulty levels, offering a fun and efficient way to stay updated in the fast-paced tech world. Born out of the Farcaster Quiz Hackathon, Learna is built as a Farcaster-based mini-app on the Celo blockchain. It combines decentralized tech with personalized learning experiences, with more interactive and adaptive methods on the way.

## Goal
The core goals of Learna are:
- To make learning enjoyable, interactive, and community-driven.
- To empower users by rewarding their educational progress using blockchain incentives.
- To ensure fairness and authenticity in learning achievements through decentralized verification.
- To create a scalable and modular platform that encourages continuous learning in the Web3 space

## Target Audience
Our audiences are not limited to the web3 users only, we only leverages the web3 aspect to provide trustless service and secure the backend side by saving users scores and earning on the blockchain. Our focus it to provide a gamified and fun learning medium for all possible categories such as simplifying protocols' documentation, software development kits SDKs, libraries, personalized AI-induced learning, etc. 
 
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

In our current beta stage, quizzes serve as a key learning path, but the process of streaming quiz data is still a manual effort. We are actively developing and integrating an AI-powered system that will not only automate this data streaming but also enhance the overall learning experience. Our immediate goal is to finalize a functional prototype that demonstrates this AI integration. Following the successful launch of this prototype, we will progressively roll out additional features to enrich our platform.

## Architecture (How we build it)

Learna is a mobile-first, React-based application built for the web3 and web2 audiences with a higher preference for all user type. By design, it is in three sections:

- A smart contract, deployed on the Celo main network, that manages sensitive and financial logic.
- A user interface for interacting with the application.
- Backend service that manages interactions with the Farcaster client, such as publishing casts, notifying the users, etc.
- 
## Latest Smart contracts information (Celo mainnet)
- Token smart contract deployed at __[0x4DaC0671376712689ce790f567bf508948A8eff3](https://celoscan.io/address/0x4DaC0671376712689ce790f567bf508948A8eff3#code)__ __
- Claim contract deployed at __[0x22452d9eCCD3A6084bBa3b446CA0C47fDb92dA6d](https://celoscan.io/address/0x22452d9eCCD3A6084bBa3b446CA0C47fDb92dA6d#code)__ 
- Learna Factory contract (main) deployed at __[0xC6f50e2E63a1b12Fb2A4340DD7ccdebE687a026b](https://celoscan.io/address/0xC6f50e2E63a1b12Fb2A4340DD7ccdebE687a026b#code)__ 

## Site
- [Interact with Learna here](https://learna.vercel.app)

## [Watch the dem0]()

## Summary
Learna addresses the lack of motivation and engagement in traditional learning systems by offering a decentralized solution that rewards users for their learning efforts. By utilizing blockchain and smart contracts, the platform ensures transparency, fairness, and automation in its reward distribution. Whether you're watching a tutorial, solving a quiz, or exploring a subject path, every action contributes to your growth—and your wallet.

## About us

Our team is comprised of curious minds with a teacher’s touch and a developer’s discipline. We craft interactive quizzes like a sculptor carves marble — precisely, creatively, and always with purpose. Sometimes, we achieve this manually, and often with the help of Artificial intelligence using a carefully and skillfully prepared prompt. We navigate subjects such as Solidity, ReactJS, DeFi, Wagmi, etc, with ease, blending logic and learning into bite-sized brilliance. When not hashing questions into unique hex codes (literally), we are building tools that teach, challenge, and empower others.
Our team got a strong grasp of dev skills and an interest in ed-tech-style systems. 

<!-- When building a learning platform, the user flow is not the most important thing, it's how and if you provide high quality content.
AI is a great progress and chance for learning platforms, if you use it.
Creating your own content can lead to a lot of overhead and low ROI.
Consider creating more of a marketplace.
Or understand how to successfully scrape relevant content from docs of chains etc.
I like that you personalized the app with a font, but the colors still have the AI created frontend vibe.
Maybe add some of your own colors/style to it.
Who are your users? Is this only web3 devs, what is your market size? Who are your competitors? How do you differ from MetaSchool or something similar? -->