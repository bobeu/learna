<img width="1362" height="599" alt="Screenshot 2025-09-28 205040" src="https://github.com/user-attachments/assets/33293c0a-3d91-4d8d-985f-5bea60058e3a" />


## Description
Learna is a decentralized Web3 learning platform designed to revolutionize the traditional educational experience by merging the worlds of learning and blockchain. The platform offers users an interactive and gamified learning environment that is not only fun and engaging but also incentivizes participation through rewards. With features like quizzes, videos, and guided learning paths, Learna creates a more dynamic and decentralized approach to education.

## Problem Statement
In today’s rapidly evolving tech landscape, consistent learning is not just beneficial—it’s essential for success. However, the traditional methods of consuming information, such as lengthy articles and overwhelming documentation, make it difficult for people to keep up. With new technologies emerging at a relentless pace, staying current feels more like a burden than a journey. The challenge lies in making learning both accessible and engaging, especially for developers who must constantly upgrade their skills to stay relevant.

## Solution Statement
Leveraging the power of artificial intelligence, we’re transforming how builders learn — making it intuitive, engaging, and rewarding. Our platform uses AI to generate dynamic quizzes tailored to different difficulty levels, offering a fun and efficient way to stay updated in the fast-paced tech world. Born out of the Farcaster Quiz Hackathon, Learna is built as a Farcaster-based mini-app on the Celo blockchain. It combines decentralized tech with personalized learning experiences, with more interactive and adaptive methods on the way.

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

## Latest Smart contracts information (Celo mainnet)
- Factory V3 contract deployed at __[0x131DFa5467c4902F6b692A89C80503ca089253e9](https://celoscan.io/address/0x131DFa5467c4902F6b692A89C80503ca089253e9#code)__
- Factory V2 contract deployed at __[0x36F2F4A30C15356A53b4AB7F159c2106675865c2](https://celoscan.io/address/0x36F2F4A30C15356A53b4AB7F159c2106675865c2#code)__
- Factory V1 contract deployed at __[0xdfA76177CA4fE4D903A290Ab8BA91064E923EB32](https://celoscan.io/address/0xdfA76177CA4fE4D903A290Ab8BA91064E923EB32#code)__
- Factory V0 contract deployed at __[0x880cD2d07E512B083Efc8136493f948895D2C6fB](https://celoscan.io/address/0x880cD2d07E512B083Efc8136493f948895D2C6fB#code)__
- IdentityVerifier contract deployed at __[0x959cD9B2Ee4099150F39ADBa450Df16399cA6969](https://celoscan.io/address/0x959cD9B2Ee4099150F39ADBa450Df16399cA6969#code)__ 
- Verifier V1 contract deployed at __[0x959cD9B2Ee4099150F39ADBa450Df16399cA6969](https://celoscan.io/address/0x959cD9B2Ee4099150F39ADBa450Df16399cA6969#code)__ 
- Verifier V0 contract deployed at __[0xb0e9b198cc0dc4cebaaa425f272e6661e35b5203](https://celoscan.io/address/0xb0e9b198cc0dc4cebaaa425f272e6661e35b5203#code)__ 

## Site
- [Interact with Learna here](https://learna.vercel.app)

## [Watch the dem0]()

## Summary
Learna addresses the lack of motivation and engagement in traditional learning systems by offering a decentralized solution that rewards users for their learning efforts. By utilizing blockchain and smart contracts, the platform ensures transparency, fairness, and automation in its reward distribution. Whether you're watching a tutorial, solving a quiz, or exploring a subject path, every action contributes to your growth—and your wallet.

## About us

Our team is comprised of curious minds with a teacher’s touch and a developer’s discipline. We craft interactive quizzes like a sculptor carves marble — precisely, creatively, and always with purpose. Sometimes, we achieve this manually, and often with the help of Artificial intelligence using a carefully and skillfully prepared prompt. We navigate subjects such as Solidity, ReactJS, DeFi, Wagmi, etc, with ease, blending logic and learning into bite-sized brilliance. When not hashing questions into unique hex codes (literally), we are building tools that teach, challenge, and empower others.
Our team got a strong grasp of dev skills and an interest in ed-tech-style systems. 

# Contributing to Learna

Thank you for your interest in contributing to Learna! This document provides comprehensive guidelines for open source contributors to help you get started and make meaningful contributions to our AI-powered learning platform.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [Contribution Guidelines](#contribution-guidelines)
7. [Feature Development](#feature-development)
8. [Bug Reports](#bug-reports)
9. [Pull Request Process](#pull-request-process)
10. [Code Review Process](#code-review-process)
11. [Testing Guidelines](#testing-guidelines)
12. [Documentation](#documentation)
13. [Community Guidelines](#community-guidelines)
14. [Resources](#resources)

## Project Overview

### What is Learna?
Learna is an AI-powered learning platform that combines blockchain technology with educational content to create an engaging learning experience. Users can participate in learning campaigns, earn cryptocurrency rewards, and test their knowledge through AI-generated quizzes.

### Key Features
- **AI Tutor**: Intelligent content generation using Google Gemini AI
- **Learning Campaigns**: Blockchain-based educational programs
- **Cryptocurrency Rewards**: Earn tokens for completing learning activities
- **Interactive Quizzes**: AI-generated assessments with performance tracking
- **Dark/Light Themes**: Modern UI with theme switching
- **Mobile Responsive**: Optimized for all devices
- **Wallet Integration**: Connect with various Web3 wallets

### Technology Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Blockchain**: Wagmi, Viem, RainbowKit
- **AI**: Google Gemini API
- **State Management**: React Hooks, Next Themes
- **Icons**: Lucide React

## Getting Started

### Prerequisites
Before contributing, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Next.js

### Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/learna.git
   cd learna/eduFi
   ```

### Install Dependencies
```bash
npm install
```

### Environment Setup
1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required environment variables:
   ```env
   # Google Gemini API Key (for AI features)
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Next.js Configuration
   NEXT_PUBLIC_URL=http://localhost:3000
   
   # Mini App Configuration
   NEXT_PUBLIC_MINI_APP_NAME=Learna
   NEXT_PUBLIC_MINI_APP_DESCRIPTION=AI-Powered Learning Platform
   NEXT_PUBLIC_MINI_APP_PRIMARY_CATEGORY=education
   NEXT_PUBLIC_MINI_APP_TAGS=education,developers,crypto,earning,quiz
   NEXT_PUBLIC_MINI_APP_BUTTON_TEXT=Start Learning
   NEXT_PUBLIC_USE_WALLET=true
   
   # Contract Addresses
   NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=0x16884C8C6a494527f4541007A46239218e76F661
   ```

### Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Development Setup

### VS Code Configuration
We recommend using VS Code with the following extensions:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint

### Git Configuration
Set up your Git identity:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Branch Naming Convention
Use descriptive branch names:
- `feature/ai-tutor-improvements`
- `bugfix/wallet-connection-issue`
- `docs/api-documentation`
- `refactor/component-structure`

## Project Structure

```
learna/eduFi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── generate-article/
│   │   │   └── generate-quizzes/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Context providers
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── progress.tsx
│   │   ├── landingPage/      # Landing page components
│   │   │   └── NewLandingPage.tsx
│   │   ├── providers/        # Context providers
│   │   └── peripherals/      # Additional components
│   ├── lib/                  # Utility functions
│   │   ├── constants.ts      # App constants
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── scripts/                  # Build and deployment scripts
├── contractsArtifacts/       # Smart contract ABIs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Coding Standards

### TypeScript Guidelines
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type; use specific types instead
- Use strict TypeScript configuration

### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization when needed
- Follow the single responsibility principle

### Code Style
- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic

### File Naming
- Use PascalCase for component files: `NewLandingPage.tsx`
- Use camelCase for utility files: `utils.ts`
- Use kebab-case for CSS files: `globals.css`

### Import Organization
```typescript
// 1. React and Next.js imports
import React from 'react';
import { NextPage } from 'next';

// 2. Third-party library imports
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// 3. Internal imports (using @ alias)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Type imports
import type { Campaign } from '@/types/campaign';
```

## Contribution Guidelines

### Types of Contributions
We welcome various types of contributions:
- **Bug Fixes**: Fix existing issues
- **Feature Development**: Add new functionality
- **Documentation**: Improve docs and guides
- **UI/UX Improvements**: Enhance user experience
- **Performance Optimization**: Improve app performance
- **Testing**: Add or improve tests
- **Code Refactoring**: Improve code quality

### Before You Start
1. Check existing issues and pull requests
2. Discuss major changes in an issue first
3. Ensure your changes align with project goals
4. Follow the coding standards

### Development Workflow
1. Create a new branch from `main`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a pull request

## Feature Development

### Adding New Features
1. **Plan the Feature**
   - Create an issue describing the feature
   - Get feedback from maintainers
   - Break down into smaller tasks

2. **Implement the Feature**
   - Create a feature branch
   - Write clean, well-documented code
   - Add proper TypeScript types
   - Include error handling

3. **Test the Feature**
   - Test on different devices and browsers
   - Verify mobile responsiveness
   - Test with different wallet connections
   - Ensure accessibility compliance

### Example: Adding a New UI Component
```typescript
// src/components/ui/new-component.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface NewComponentProps {
  className?: string
  children: React.ReactNode
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("base-styles", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

NewComponent.displayName = "NewComponent"

export { NewComponent }
```

## Bug Reports

### Before Reporting
1. Check if the issue already exists
2. Try to reproduce the issue
3. Check if it's a known limitation
4. Gather relevant information

### Bug Report Template
```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Wallet: [e.g., MetaMask]
- Node.js version: [e.g., 18.17.0]

## Additional Context
Any other context about the problem.
```

## Pull Request Process

### Before Submitting
1. Ensure your code follows project standards
2. Test your changes thoroughly
3. Update documentation if needed
4. Rebase your branch on latest main
5. Write a clear PR description

### Pull Request Template
```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested with different wallets
- [ ] All existing tests pass

## Screenshots
If applicable, add screenshots.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design verified
```

### PR Review Process
1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainers review the code
3. **Testing**: Manual testing by reviewers
4. **Approval**: At least one approval required
5. **Merge**: Squash and merge to main

## Code Review Process

### As a Reviewer
- Be constructive and respectful
- Focus on code quality and functionality
- Test the changes locally if needed
- Provide specific feedback
- Approve when ready

### As an Author
- Respond to feedback promptly
- Make requested changes
- Ask questions if unclear
- Update PR description if needed

## Testing Guidelines

### Manual Testing
- Test on different browsers (Chrome, Firefox, Safari)
- Test on different devices (desktop, tablet, mobile)
- Test with different wallet connections
- Test theme switching
- Test responsive design

### Automated Testing
- Write unit tests for utility functions
- Write integration tests for API routes
- Test component rendering
- Test user interactions

### Example Test
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies correct variant styles', () => {
    render(<Button variant="outline">Outline Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
  })
})
```

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Explain business logic
- Update README when needed

### API Documentation
- Document API endpoints
- Include request/response examples
- Document error codes
- Update when APIs change

### User Documentation
- Write clear user guides
- Include screenshots
- Document known limitations
- Keep documentation up to date

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

### Communication
- Use clear, descriptive commit messages
- Write helpful PR descriptions
- Respond to issues and PRs promptly
- Ask questions when unsure

### Getting Help
- Check existing documentation
- Search existing issues
- Ask in discussions
- Join our community Discord

## Resources

### Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Wagmi Documentation](https://wagmi.sh/)

### Development Tools
- [VS Code](https://code.visualstudio.com/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Wagmi DevTools](https://wagmi.sh/devtools)

### Blockchain Resources
- [Ethereum Documentation](https://ethereum.org/developers/)
- [Viem Documentation](https://viem.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

### AI Integration
- [Google Gemini API](https://ai.google.dev/)
- [OpenAI API](https://platform.openai.com/docs)

## Getting Started Checklist

- [ ] Fork the repository
- [ ] Clone your fork locally
- [ ] Install dependencies (`npm install`)
- [ ] Set up environment variables
- [ ] Run the development server
- [ ] Explore the codebase
- [ ] Read the documentation
- [ ] Join the community
- [ ] Pick an issue to work on
- [ ] Create a feature branch
- [ ] Make your changes
- [ ] Test thoroughly
- [ ] Submit a pull request

## Common Issues and Solutions

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript Errors
- Check import paths (use `~/` alias)
- Ensure proper type definitions
- Run `npm run type-check`

### Styling Issues
- Check Tailwind CSS classes
- Verify responsive breakpoints
- Test dark/light theme

### Wallet Connection Issues
- Check wallet extension installation
- Verify network configuration
- Test with different wallets

## Contact and Support

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: For real-time community chat
- **Email**: For security issues and private matters

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing to Learna! Together, we're building the future of education. 🚀

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Maintainers**: Learna Team