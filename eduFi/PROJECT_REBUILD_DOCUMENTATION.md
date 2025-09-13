# Learna Project Rebuild Documentation

## Overview
This document contains all the changes, implementations, and responses made during the complete rebuild of the Learna project landing page. The rebuild focused on creating a modern, mobile-compatible landing page with dark/light theme support, AI tutor integration, and blockchain campaign display.

## Table of Contents
1. [Project Requirements](#project-requirements)
2. [New Landing Page Features](#new-landing-page-features)
3. [Technical Implementation](#technical-implementation)
4. [File Changes](#file-changes)
5. [Dependencies](#dependencies)
6. [Installation Instructions](#installation-instructions)
7. [API Routes](#api-routes)
8. [UI Components](#ui-components)
9. [Import Alias Changes](#import-alias-changes)
10. [Scripts and Automation](#scripts-and-automation)

## Project Requirements

### Original Requirements
- Rebuild the landing page for the learna project
- Mobile compatible design
- Dark and light theme integrated
- New color themes: black and white
- Eye-catching image on the landing page
- WalletConnect button in top right corner
- Remove all current sections
- Display learning campaigns without wallet connection
- Stream campaign data directly from blockchain
- Integrate v3 smart contracts using contractArtifacts
- Fetch campaign addresses from CampaignFactory contract
- Display campaigns as cards with relevant information
- Create AI tutor agent using Google Gemini AI
- Generate intelligent articles and quizzes
- Allow users to select campaign topics
- Create 500-word articles on random topics
- Generate up to 50 quizzes to test knowledge
- Rate user performance and calculate scores
- Optional onchain score saving

## New Landing Page Features

### 1. Modern Design
- **Mobile-First Approach**: Responsive design that works on all devices
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Neon-Black Palette**: Exact colors inspired by the provided image (neon lime on deep black); gradients reduced
- **Hero Slider**: Dorahacks-like slider that auto-advances and pauses on hover

### 2. Navigation
- **Clean Header**: Logo, navigation links, theme toggle, and wallet connect
- **Mobile Menu**: Collapsible navigation for mobile devices
- **WalletConnect Integration**: Prominently placed in top-right corner

### 3. Hero Section
- **Headline**: "made simple" styled like Dorahacks hero
- **Autoplay Slider**: Showcases upcoming/featured learning campaigns; hover to pause
- **CTAs**: "Explore campaigns" and "How it works"

### 4. Campaign Display
- **Three Tabs**: Current, Featured, and Past campaigns
- **Campaign Cards**: Display with images, descriptions, funding amounts, participants
- **Real-time Data**: Mock blockchain integration ready for real data
- **Interactive Elements**: Click to join campaigns

### 5. AI Tutor Integration
- **Topic Selection**: Choose from Solidity, Celo, Divvi, Web3, DeFi, Smart Contracts
- **Article Generation**: AI-generated 500-word educational articles
- **Quiz System**: Up to 50 intelligent quizzes per topic
- **Performance Tracking**: Score calculation and rating system
- **Interactive UI**: Progress bars, question navigation, results display

### 6. Audience Sections
- Dedicated cards for **Learners** and **Campaign Creators** with copy and CTAs

### 7. Features Section
- AI Tutor, Earn Rewards, Community highlights using reduced gradients and neon accents

## Technical Implementation

### 1. Framework and Libraries
- **Next.js 15.4.2**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Next Themes**: Dark/light theme management
- **Wagmi**: Ethereum wallet integration
- **RainbowKit**: Wallet connection UI
- **Embla Carousel**: Autoplay hero slider (`embla-carousel-react`, `embla-carousel-autoplay`)

### 2. State Management
- **React Hooks**: useState, useEffect for local state
- **Theme Context**: Next Themes for theme management
- **Wallet State**: Wagmi hooks for wallet connection

### 3. Blockchain Integration
- **Contract ABIs**: CampaignFactory and CampaignTemplate contracts
- **Mock Data**: Sample campaign data for development
- **Real Integration Ready**: Prepared for actual blockchain calls

### 4. AI Integration
- **Google Gemini API**: For article and quiz generation
- **Mock Implementation**: Fallback content for development
- **API Routes**: Separate endpoints for article and quiz generation

## File Changes

### 1. New Files Created
```
src/components/landingPage/NewLandingPage.tsx
src/app/learn/page.tsx
src/app/campaigns/new/page.tsx
src/app/api/generate-article/route.ts
src/app/api/generate-quizzes/route.ts
src/app/api/upload-to-ipfs/route.ts
src/app/api/generate-image/route.ts
src/components/ui/badge.tsx
src/components/ui/tabs.tsx
src/components/ui/progress.tsx
scripts/replace-imports.js
scripts/replace-imports.sh
scripts/replace-imports.bat
```

### 2. Modified Files
```
tsconfig.json - Updated path mapping
src/app/app.tsx - Updated to use new landing page
src/app/page.tsx - Updated imports
src/app/layout.tsx - Updated imports
src/app/providers.tsx - Updated imports
src/components/ui/button.tsx - Updated imports
src/components/ui/card.tsx - Updated imports
tailwind.config.ts - Updated theme configuration
package.json - Added missing dependencies
src/components/landingPage/Hero.tsx - Wired buttons (learn, create campaign) and optimized nav
src/components/landingPage/NewLandingPage.tsx - Prefetch routes for faster navigation
src/app/providers.tsx - Added global ThemeProvider wrapper (dark by default)
src/app/app.tsx - Removed inner ThemeProvider; rebuilt dynamic loader UI
```

### 3. Key Components

#### NewLandingPage.tsx
- Main landing page component
- AI Tutor modal integration
- Campaign card display
- Dorahacks-style hero slider (Embla) with autoplay and hover pause
- Learners and Creators sections
- Theme management
- Responsive design
 - Prefetches `/learn` and `/campaigns/new` for faster navigation

#### App Wrapper and Loading (`/app.tsx`)
- Dynamic import of landing page retains SSR disabled
- Replaced old loading state with a modern theme-aware spinner and status text
- Loader respects dark/light backgrounds and primary accent

#### Global Providers (`/providers.tsx`)
- Wraps app with ThemeProvider (attribute="class", defaultTheme="dark") so all routes respond to theme toggles
- Keeps Wagmi, RainbowKit, and MiniApp providers intact

#### Learn Page (`/learn`)
- Profile stats with RainbowKit ConnectButton and initials avatar
- CampaignTabs with configurable header (hidden on this page) and compact spacing
- Search (by name/funding) and date filtering
- Dark-mode toggle in header
- Clicking a campaign opens AI Tutor

#### Creator Console (`/campaigns/new`)
- Creator dashboard with expandable list of your campaigns and analytics modal
- Theme toggle in header
- Creation form:
  - Fields: name, docs link, description, start/end dates (auto hours), image
  - Image: upload to IPFS (mock endpoint) or AI-generate (mock endpoint)
  - Inline preview for uploaded or generated image
  - Funding: native CELO amount and multiple ERC20 tokens
  - Auto-fill ERC20 symbol/decimals via wagmi public client
  - Approve ERC20 totals to `CAMPAIGN_FACTORY_ADDRESS`
  - ERC20 address validation using viem `isAddress` with inline error messaging
  - Approval flow constraints: must approve a validated token before adding another
  - Improved spacing between "Add ERC20" and "Approve ERC20 Funding" buttons
  - Description field limited to 500 words with live counter
  - Image preview now supports `ipfs://` via gateway mapping for display; delete control added

#### AITutor Component
- Topic selection interface
- Article generation and display
- Quiz creation and management
- Score calculation and results
- Interactive progress tracking

#### CampaignCard Component
- Campaign information display
- Status badges (Active, Featured, Completed)
- Funding amount and participant count
- End date calculation
- Click-to-join functionality

## Dependencies

### Added Dependencies
```json
{
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@types/uuid": "^9.0.0"
}
```

### Existing Dependencies Used
- `@google/generative-ai`: AI content generation
- `@rainbow-me/rainbowkit`: Wallet connection
- `next-themes`: Theme management
- `lucide-react`: Icons
- `class-variance-authority`: Component variants
- `tailwind-merge`: CSS class merging

## Installation Instructions

### 1. Install Dependencies
```bash
cd learna/eduFi
npm install
```

If your workspace didn't already have Embla installed:
```bash
npm install embla-carousel-react embla-carousel-autoplay
```

### 2. Install Missing Dependencies
```bash
npm install @radix-ui/react-progress@^1.0.3 @radix-ui/react-tabs@^1.0.4 @types/uuid@^9.0.0
```

### 3. Environment Variables
Create `.env.local` (or copy from `env.example`) file:
```env
# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Next.js Public URL
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

# WalletConnect / RainbowKit
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id

# Image Generation / Storage (mock values)
NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY=mock_google_ai_studio_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=mock_thirdweb_client_id
THIRDWEB_SECRET=mock_thirdweb_secret
```

### 4. Run Development Server
```bash
npm run dev
```

## API Routes

### 1. Generate Article API
**File**: `src/app/api/generate-article/route.ts`
- **Purpose**: Generate educational articles using Google Gemini AI
- **Input**: Topic and campaign name
- **Output**: 500-word educational article
- **Fallback**: Mock content for development

### 2. Generate Quizzes API
### 3. Upload to IPFS (mock)
**File**: `src/app/api/upload-to-ipfs/route.ts`
- **Purpose**: Accepts image file uploads and returns a mock `ipfs://` URI
- **Implementation**: Edge runtime, `FormData` file input; replace with thirdweb/storage, Pinata, or web3.storage

### 4. Generate Image (mock)
**File**: `src/app/api/generate-image/route.ts`
- **Purpose**: Generates a campaign image and returns a mock `ipfs://` URI
- **Implementation**: Replace with Google AI Studio / OpenAI images; store keys in env

### 5. IPFS Image Preview
- On the client, `ipfs://` URIs are mapped to a public gateway (e.g., `https://ipfs.io/ipfs/`) for previews in the creator console. You may change the gateway if preferred.

**File**: `src/app/api/generate-quizzes/route.ts`
- **Purpose**: Generate quiz questions using Google Gemini AI
- **Input**: Topic and question count
- **Output**: Array of quiz questions with options and correct answers
- **Fallback**: Mock quiz data for development

## UI Components

### 1. Badge Component
- **File**: `src/components/ui/badge.tsx`
- **Purpose**: Display campaign status and other labels
- **Variants**: default, secondary, destructive, outline

### 2. Tabs Component
- **File**: `src/components/ui/tabs.tsx`
- **Purpose**: Tab navigation for campaign categories
- **Features**: Current, Featured, Past campaigns

### 3. Progress Component
- **File**: `src/components/ui/progress.tsx`
- **Purpose**: Display quiz progress and loading states
- **Features**: Animated progress bars

### 4. Card Component
- **File**: `src/components/ui/card.tsx`
- **Purpose**: Display campaign information
- **Features**: Header, content, footer sections

## Import Alias Changes

### 1. TypeScript Configuration
**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. Import Pattern Changes
- **From**: `import { Component } from "~/components/ui/component"`
- **To**: `import { Component } from "@/components/ui/component"`

### 3. Automated Replacement Scripts
- **Node.js**: `scripts/replace-imports.js`
- **Bash**: `scripts/replace-imports.sh`
- **Windows**: `scripts/replace-imports.bat`

## Scripts and Automation

### 1. Import Replacement Scripts

#### Node.js Script
```javascript
// scripts/replace-imports.js
const fs = require('fs');
const path = require('path');

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  // Recursively find all TypeScript/JavaScript files
}

function replaceImports(filePath) {
  // Replace ~ imports with @ imports
}

function main() {
  // Main execution function
}
```

#### Bash Script
```bash
#!/bin/bash
# scripts/replace-imports.sh
find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
  sed -i 's|from '\''~/|from '\''@/|g' "$file"
  sed -i 's|from "~/|from "@/|g' "$file"
  # ... more replacements
done
```

#### Windows Batch Script
```batch
@echo off
# scripts/replace-imports.bat
for /r src %%f in (*.ts *.tsx *.js *.jsx) do (
    powershell -Command "(Get-Content '%%f') -replace 'from ''~/', 'from ''@/' | Set-Content '%%f'"
    # ... more replacements
)
```

### 2. Usage Instructions

#### Run Node.js Script
```bash
cd learna/eduFi
node scripts/replace-imports.js
```

#### Run Bash Script (Unix/Mac)
```bash
cd learna/eduFi
chmod +x scripts/replace-imports.sh
./scripts/replace-imports.sh
```

#### Run Batch Script (Windows)
```cmd
cd learna\eduFi
scripts\replace-imports.bat
```

## Mock Data Implementation

### 1. Campaign Data
```javascript
const MOCK_CAMPAIGNS = [
  {
    id: 1,
    address: "0x1234567890123456789012345678901234567890",
    name: "Solidity Fundamentals",
    description: "Master the basics of Solidity programming language",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    fundingAmount: "1000",
    participants: 245,
    image: "/learna-image4.png",
    status: "active"
  },
  // ... more campaigns
];
```

### 2. AI Tutor Topics
```javascript
const topics = ['Solidity', 'Celo', 'Divvi', 'Web3', 'DeFi', 'Smart Contracts'];
```

### 3. Mock Quiz Data
```javascript
const mockQuizzes = [
  {
    question: `What is the primary benefit of ${selectedTopic}?`,
    options: ['Speed', 'Decentralization', 'Cost', 'Simplicity'],
    correct: 1
  },
  // ... more questions
];
```

## Smart Contract Integration

### 1. Contract Addresses
- **CampaignFactory**: `0x16884C8C6a494527f4541007A46239218e76F661`
- **Network**: Sepolia Testnet

### 2. Contract ABIs
- **CampaignFactory ABI**: For fetching campaign addresses
- **CampaignTemplate ABI**: For fetching individual campaign data

### 3. Integration Points
- **Campaign Fetching**: `useReadContract` hook for blockchain data
- **Real-time Updates**: Prepared for live data streaming
- **Error Handling**: Fallback to mock data if blockchain calls fail

## Theme Configuration

The Tailwind palette now uses a neon-lime on deep-black theme matching the attached image. Gradients are minimized and subtle.

### 2. Theme Provider
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem={false}
  disableTransitionOnChange
>
  <NewLandingPage />
</ThemeProvider>
```

## Responsive Design

### 1. Breakpoints
- **Mobile**: Default styles
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)

### 2. Grid Layouts
- **Campaign Cards**: 1 column mobile, 2 tablet, 3 desktop
- **Features**: 1 column mobile, 2 tablet, 3 desktop
- **Navigation**: Stacked mobile, horizontal desktop

### 3. Typography
- **Headlines**: Responsive text sizes (text-5xl md:text-7xl)
- **Body Text**: Responsive sizing (text-xl md:text-2xl)
- **Mobile Optimization**: Readable text on all devices

## Performance Optimizations

### 1. Dynamic Imports
- **Landing Page**: Lazy loaded with loading state
- **Components**: Dynamic imports for better performance

### 2. Image Optimization
- **Next.js Image**: Optimized image loading
- **Responsive Images**: Different sizes for different devices

### 3. State Management
- **Local State**: React hooks for component state
- **Minimal Re-renders**: Optimized state updates
 - **Route Prefetch**: Landing page prefetches `/learn` and `/campaigns/new` to reduce navigation latency
 - **Lightweight Loader**: Dynamic loader shows minimal, theme-aware UI during initial hydration

## Error Handling

### 1. API Fallbacks
- **AI Generation**: Mock content if API fails
- **Blockchain Data**: Mock data if contract calls fail

### 2. User Experience
- **Loading States**: Skeleton loaders and spinners
- **Error Messages**: User-friendly error handling
- **Graceful Degradation**: App works even if some features fail

## Future Enhancements

### 1. Real Blockchain Integration
- Replace mock data with actual contract calls
- Implement real-time data updates
- Add transaction handling

### 2. AI Improvements
- Implement actual Google Gemini API calls
- Add more sophisticated content generation
- Implement user progress tracking

### 3. Additional Features
- User authentication
- Score persistence on blockchain
- Social features and leaderboards
- Advanced quiz analytics

## Recent Updates

### Text Color Improvements (December 2024)

#### Hero Section Text Visibility Enhancement
- **Main Headline**: Updated from `text-black dark:text-gray-300 opacity-80` to `text-gray-900 dark:text-white` for better contrast
- **Subtitle**: Changed from `text-black opacity-80 dark:text-gray-300` to `text-gray-700 dark:text-gray-200` for improved readability
- **Section Headings**: Improved from `dark:text-white opacity-80` to `text-gray-900 dark:text-white` for better visibility
- **Body Text**: Standardized to `text-gray-700 dark:text-gray-200` for consistent contrast across both themes
- **List Items**: Updated to `text-gray-700 dark:text-gray-200` for better readability
- **Badge Text**: Enhanced from `text-black` to `text-gray-900` for better contrast
- **Button Text**: Improved outline button styling with `text-gray-900 dark:text-white dark:border-gray-600`

#### Benefits of Changes
- **Better Accessibility**: Improved contrast ratios meet WCAG guidelines
- **Professional Appearance**: More polished and readable text in both light and dark themes
- **Consistent Styling**: Standardized color scheme across all text elements
- **Enhanced User Experience**: Better readability reduces eye strain and improves comprehension

### On-chain Campaign Data Integration (September 2025)

#### What changed
- Landing page campaigns now source from live on-chain reads via storage context instead of mocks.
- `src/components/landingPage/NewLandingPage.tsx` maps `campaignsData` into UI objects consumed by `Hero` and `CampaignTabs`.
- Normalized metadata read from chain (hex → string) and image URIs.

#### Technical notes
- Decode strings with `hexToString` when values start with `0x`.
- Image normalization: `ipfs://...` → `https://ipfs.io/ipfs/...`; allow `http(s)` or `/` paths; fallback to `/learna-image4.png`.
- Funding derived from epoch funds via `formatEther`.

### Profiles and Campaign Management (September 2025)

#### Creator profile (protocol owners/managers)
- New page: `src/app/profile/page.tsx` (Creator tab).
- Filters campaigns by `owner === connected address`.
- Edit Metadata modal: `src/components/profile/CampaignMetaEditor.tsx` for `name`, `link`, `imageUrl`, `description` (UI-only; ready to wire to contract writes).

#### Builder profile
- Same page (Builder tab).
- Lists campaigns where connected user appears in any epoch `learners` list.

#### Campaign detail view
- New page: `src/app/profile/view/page.tsx` shows metadata, funds, and learners. Access via `/profile/view?i=<index>`.

### Bug Fix: next/image hex URL parsing (September 2025)

Resolved failure where `next/image` received hex-encoded URLs (e.g., `0x...`). Mapping layer now decodes hex and converts `ipfs://` URIs to an HTTPS gateway before rendering.

### Major Feature Updates (September 2025)

#### Theme and UI Improvements
- **Default Theme**: Changed from dark to light mode as default
- **Transaction Modal**: Built new `TransactionModal` component matching project style with step-by-step progress tracking, status indicators, and transaction hash links

#### Campaign Creation Flow Redesign
- **Two-Phase Creation**: Campaign creators now launch campaigns without funds first, then add funding later from their profile
- **Simplified Creation**: Removed funding complexity from initial campaign creation form
- **AddFund Component**: New component for campaign owners to add native and ERC20 funding with individual token approval flow

#### Builder Reward System
- **BuilderRewards Component**: Comprehensive reward tracking and claiming system
- **Performance-Based Rewards**: Rewards calculated based on user performance scores and completion status
- **Claim Functionality**: On-chain reward claiming with transaction modal integration
- **Eligibility System**: Clear criteria for reward eligibility (completed proofs, performance ratings, score thresholds)

#### Enhanced AI Tutor System
- **ImprovedAITutor**: Complete redesign with multi-step learning flow
- **Dynamic Topic Generation**: AI-generated topics based on campaign context
- **Article Generation**: 700-word articles with reading time estimation
- **Intelligent Quiz System**: AI-generated quizzes based on article content
- **Performance Rating**: 5-point rating system based on quiz performance
- **On-Chain Storage**: `proveAssimilation` function integration for storing proof of learning and performance data

#### Profile System Enhancements
- **Creator Profile**: Campaign management with metadata editing and funding capabilities
- **Builder Profile**: Enhanced with reward tracking, performance metrics, and claim functionality
- **Data Integration**: Full integration with `Learner` interface and on-chain data structures

## Conclusion

The Learna project has been successfully rebuilt with a modern, responsive landing page that includes:

- ✅ Mobile-compatible design
- ✅ Dark/light theme support
- ✅ Neon-black color palette
- ✅ WalletConnect integration
- ✅ Campaign display system
- ✅ AI tutor with article and quiz generation
- ✅ Dorahacks-style hero slider
- ✅ Modern UI components
- ✅ Responsive design
- ✅ Performance optimizations
- ✅ **Enhanced text visibility and accessibility**

The project is now ready for development and can be easily extended with additional features as needed.

---

**Last Updated**: September 2025
**Version**: 2.0.0
**Status**: Complete with Major Feature Updates - Theme, Transaction System, Campaign Flow, Rewards, and Enhanced AI Tutor
```

This comprehensive documentation file contains all the responses, changes, and implementations made during the Learna project rebuild. It serves as a complete reference for the project structure, features, and technical implementation details.
