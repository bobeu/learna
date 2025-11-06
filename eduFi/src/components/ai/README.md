# AI Components Documentation

## Overview
This directory contains AI-powered learning components for the Learna platform, including article rendering, topic generation, and quiz functionality.

## Components

### MarkdownRenderer.tsx
**Purpose**: Renders markdown content with proper formatting, syntax highlighting, and theme-consistent styling.

**Features**:
- Converts markdown syntax to formatted HTML
- Syntax highlighting for code blocks (Solidity, JavaScript, TypeScript, etc.)
- Responsive design for mobile and web
- Theme-aware styling using only 3 project colors:
  - **Primary (Lime/Green)**: Used for headings, links, and emphasis
  - **Secondary (Gray)**: Used for body text
  - **Primary Variants**: Used for bold/italic text

**Dependencies**:
- `react-markdown`: Converts markdown to React components
- `remark-gfm`: Adds GitHub Flavored Markdown support (tables, strikethrough, etc.)
- `react-syntax-highlighter`: Provides syntax highlighting for code blocks
- `next-themes`: For theme detection (dark/light mode)

**Usage**:
```tsx
import MarkdownRenderer from './MarkdownRenderer';

<MarkdownRenderer content={markdownString} />
```

**Styling**:
- Headings (H1-H6): Primary color with varying sizes
- Bold text: Primary color (700/400)
- Italic text: Primary color (600/300)
- Code blocks: Syntax highlighted with theme-aware styles
- Inline code: Primary background with rounded corners
- Links: Primary color with hover effects
- Lists: Proper indentation and spacing
- Tables: Responsive with primary-colored borders

**Installation**:
The component includes fallback rendering if libraries are not installed, but for full functionality, install:
```bash
npm install react-markdown remark-gfm react-syntax-highlighter @types/react-syntax-highlighter --legacy-peer-deps
```

**Note**: The component uses dynamic imports with try-catch blocks, so it will gracefully degrade if libraries are not available. However, for the best experience with syntax highlighting and markdown formatting, the libraries should be installed.

### ArticleReading.tsx
**Purpose**: Displays the generated article content with reading time and quiz navigation.

**Features**:
- Shows article title with primary color styling
- Displays reading time estimate
- Renders article content using MarkdownRenderer
- Provides "Start Quiz" button to proceed to quiz

**Props**:
- `articleContent`: Markdown string of article content
- `articleTitle`: Title of the article
- `readingTime`: Estimated reading time in minutes
- `isGenerating`: Loading state for article generation
- `isArticleReady`: Whether article is ready to display
- `generateQuiz`: Function to generate quiz from article
- `setCurrentStep`: Function to navigate to quiz step
- `selectedTopicTitle`: Title of selected learning topic

### CampaignLearningInit.tsx
**Purpose**: Initializes the learning flow when a user clicks on a campaign.

**Features**:
- Generates topics using Gemini AI
- Displays greeting and campaign information
- Allows topic selection or custom topic input
- Validates custom topics against campaign relevance
- Checks for previously completed topics
- Integrates with AITutor for the learning process

### AITutor.tsx
**Purpose**: Main AI tutor component that manages the complete learning flow.

**Features**:
- Topic selection
- Article reading
- Quiz generation and completion
- Results display and blockchain storage
- Progress saving and restoration

## Services

### topicGenerationService.ts
**Purpose**: Handles API calls to generate topics with greeting from Gemini.

**Functions**:
- `generateTopicsWithGreeting()`: Generates greeting, campaign info, and topics
- `generateTopicsOnly()`: Generates topics without greeting

### topicValidationService.ts
**Purpose**: Validates custom topics against campaign relevance using Gemini.

**Functions**:
- `validateCustomTopic()`: Checks if a custom topic is relevant to the campaign

### topicStorageService.ts
**Purpose**: Manages localStorage for completed topics.

**Functions**:
- `saveCompletedTopic()`: Saves a completed topic to localStorage
- `getCompletedTopics()`: Retrieves all completed topics for a user
- `isTopicCompleted()`: Checks if a topic was completed (uses regex matching)
- `getCampaignCompletedTopics()`: Gets completed topics for a specific campaign
- `clearCompletedTopics()`: Clears all completed topics for a user

## Hooks

### useTopicState.ts
**Purpose**: Manages topic state in memory (not localStorage).

**State**:
- `topics`: Array of generated topics
- `selectedTopic`: Currently selected topic
- `customTopic`: Custom topic input
- `greeting`: Greeting message from AI
- `campaignInfo`: Campaign information

**Note**: State persists until page refresh or logout, as per requirements.

## Color Scheme

The project uses a strict 3-color palette:

1. **Primary (Lime/Green)**: `#a7ff1f` to `#2c4608`
   - Used for: Headings, links, emphasis, accents
   - Variants: 50-900 shades

2. **Secondary (Gray)**: `#f6f7f9` to `#141720`
   - Used for: Body text, backgrounds
   - Variants: 50-900 shades

3. **Dark Backgrounds**: `#0a0a0a` (blackish), `#0f1113` (surface)
   - Used for: Dark mode backgrounds

## Responsive Design

All components are designed with mobile-first approach:
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Text sizes scale from mobile to desktop
- Code blocks are horizontally scrollable on mobile
- Tables are wrapped in scrollable containers

## File Structure

```
src/components/ai/
├── MarkdownRenderer.tsx          # Markdown rendering with syntax highlighting
├── ArticleReading.tsx            # Article display component
├── AITutor.tsx                   # Main AI tutor component
├── CampaignLearningInit.tsx      # Campaign learning initialization
├── TopicSelection.tsx             # Topic selection UI
├── Quiz.tsx                      # Quiz component
├── Results.tsx                   # Results display
├── services/
│   ├── topicGenerationService.ts
│   ├── topicValidationService.ts
│   └── topicStorageService.ts
├── hooks/
│   └── useTopicState.ts
├── components/
│   ├── TopicGenerationDisplay.tsx
│   ├── CustomTopicInput.tsx
│   ├── TopicValidationDialog.tsx
│   └── CompletedTopicDialog.tsx
└── README.md                     # This file
```

