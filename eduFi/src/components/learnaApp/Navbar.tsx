/* eslint-disable */
"use client";

import React from 'react';
import { Moon, Sun, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';

{/* Navigation */}
export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return(
      <nav className="w-full sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-black/90 backdrop-blur-sm pr-[28px] md:pl-[28px]">
        <div className="max-w-7xl flex justify-between items-center">
          <div className="flex justify-between items-center">
            <img 
              src="/logo.png" 
              alt="Learna Logo" 
              className="object-contain w-20 h-20 md:w-24 md:h-24"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              {isDark? <Sun className="w-5 h-5 text-primary-500" /> : <Moon className="w-5 h-5" />}
            </Button>
            <ConnectButton />
          </div>
        </div>
      </nav>
    );
}
