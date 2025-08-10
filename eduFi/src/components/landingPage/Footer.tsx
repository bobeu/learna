import React from 'react';
import Image from 'next/image';

export default function Footer() {
    return(
        <footer className="px-4 py-12 bg-white border-t border-gray-200 font-mono">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                        <Image 
                            src="/learna-logo.png"
                            alt="Learna Logo"
                            width={100}
                            height={100}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                        Learna
                    </span>
                    </div>
                    <div className="text-gray-500 text-sm text-center md:text-left">
                    © 2025 Learna. All rights reserved. Inspired by Farcaster, and built for the love of Education.
                    </div>
                </div>
            </div>
        </footer>
    );
}