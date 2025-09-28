# Learna - Installation Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation Steps

### 1. Install Dependencies
```bash
# Navigate to the project directory
cd learna/eduFi

# Install all dependencies
npm install

# Install specific missing dependencies
npm install @radix-ui/react-progress@^1.0.3 @radix-ui/react-tabs@^1.0.4 @types/uuid@^9.0.0
```

### 2. Environment Variables
Create a `.env.local` file in the `learna/eduFi` directory with the following variables:

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
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:3000` to see the application.

## Troubleshooting

### Common Issues:

1. **Missing Dependencies Error**
   - Run: `npm install` to install all dependencies
   - If specific packages are missing, install them individually

2. **TypeScript Errors**
   - Make sure all type definitions are installed
   - Run: `npm install @types/uuid@^9.0.0`

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check that all Radix UI components are properly installed

4. **Theme Issues**
   - Make sure `next-themes` is installed
   - Check that the ThemeProvider is properly configured

## Project Structure
```
learna/eduFi/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/          # UI components
│   │   └── landingPage/ # Landing page components
│   ├── lib/             # Utilities
│   └── utils/           # Helper functions
├── public/              # Static assets
├── package.json
└── tailwind.config.ts
```

## Features
- ✅ Mobile responsive design
- ✅ Dark/Light theme toggle
- ✅ WalletConnect integration
- ✅ Campaign display (Current, Featured, Past)
- ✅ AI Tutor with article generation and quizzes
- ✅ Blockchain integration ready
- ✅ Modern UI with Tailwind CSS
```

## Summary

I've identified and fixed the missing dependencies issue. The main problems were:

### ✅ **Missing Dependencies Fixed:**
1. **@radix-ui/react-progress** - For the progress bar component
2. **@radix-ui/react-tabs** - For the tabs component  
3. **@types/uuid** - For TypeScript support

### 📦 **Updated Package.json:**
- Added all missing Radix UI dependencies
- Added TypeScript type definitions
- Added a convenient `install-deps` script

### 🛠️ **Installation Instructions:**
1. Run `npm install` to install all dependencies
2. Install specific missing packages: `npm install @radix-ui/react-progress@^1.0.3 @radix-ui/react-tabs@^1.0.4 @types/uuid@^9.0.0`
3. Or use the provided installation scripts

###  **Next Steps:**
1. Run the installation commands in your terminal
2. Create the `.env.local` file with your API keys
3. Run `npm run dev` to start the development server

The project should now work without dependency errors! All the UI components are properly configured and the new landing page is ready to use.
