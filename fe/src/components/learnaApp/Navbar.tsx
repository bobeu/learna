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
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-black bg-opacity-80 dark:bg-primary-500 flex items-center justify-center">
                {/* <BookOpen className="w-6 h-6 text-white" /> */}
                <Library className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold dark:text-primary-500">
                Learna
              </span>
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
        </div>
      </nav>
    );
}
