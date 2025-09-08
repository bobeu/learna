/* eslint-disable */

import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import useStorage from '../hooks/useStorage';
import Image from 'next/image';

export default function Navbar() {
    const {  isMenuOpen, toggleOpen } = useStorage();

    return(
        <nav className="relative z-50 px-4 py-3 bg-white border-b border-gray-100 sticky top-0">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                        <Image 
                            src="/learna-logo.png"
                            alt="Learna Logo"
                            width={100}
                            height={100}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                        Learna
                    </span>
                </div>
                
                {/* Mobile menu button */}
                <Button 
                    className="md:hidden p-2 text-gray-600 hover:text-cyan-600 transition-colors"
                    onClick={() => toggleOpen(!isMenuOpen)}
                    variant={'outline'}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
    
                {/* Desktop menu */}
                <div className="hidden md:flex items-center space-x-6">
                    <a href="#features" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">Features</a>
                    <a href="#how-it-works" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">How it Works</a>
                    <a href="#stats" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">Stats</a>
                    {/* <Button onClick={goToDashboard} variant={'outline'} className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium">
                        Get Started
                    </Button> */}
                    <div>
                        
                        <ConnectButton />
                    </div>
                </div>
            </div>
    
            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
                    <div className="px-4 py-4 space-y-4">
                        <a href="#features" className="block text-gray-600 hover:text-cyan-600 transition-colors font-medium">Features</a>
                        <a href="#how-it-works" className="block text-gray-600 hover:text-cyan-600 transition-colors font-medium">How it Works</a>
                        <a href="#stats" className="block text-gray-600 hover:text-cyan-600 transition-colors font-medium">Stats</a>
                        {/* <Button variant={'outline'} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-medium">
                            Get Started
                        </Button> */}
                        <ConnectButton />
                    </div>
                </div>
            )}
        </nav>
    );
}