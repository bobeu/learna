import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
    return(
        <footer className="px-4 py-12 bg-white border-t border-gray-200">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                        Educaster
                    </span>
                    </div>
                    <div className="text-gray-500 text-sm text-center md:text-left">
                    © 2025 Educaster. All rights reserved. Inspired by Farcaster, and built for the love of people.
                    </div>
                </div>
            </div>
        </footer>
    );
}