import React from 'react';

{/* Footer */}    
export default function Footer() {
    return(
        <footer className="dark:bg-neutral-950 dark:text-gray-300 pb-4 dark:font-mono">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 border border-black/80 dark:border-primary-100 rounded-xl py-8 px-4">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded bg-black bg-opacity-70 dark:bg-primary-500" />
                    <span className="font-bold dark:text-white">Learna</span>
                    </div>
                    <p className="text-sm">AI-powered learning campaigns for builders. Learn, prove, integrate, and earn.</p>
                </div>
                <div>
                    <h4 className="font-semibold dark:text-white mb-3">Learn</h4>
                    <ul className="space-y-2 text-sm">
                    <li>Celo</li>
                    <li>Farcaster</li>
                    <li>Solidity</li>
                    <li>And more</li>
                    </ul>
                </div>
            <div>
                <h4 className="font-semibold text-white mb-3">Create</h4>
                <ul className="space-y-2 text-sm">
                <li>Launch a campaign</li>
                <li>Funding options</li>
                <li>Guidelines</li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-3">Company</h4>
                <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Docs</li>
                <li>Contact</li>
                </ul>
            </div>
                <div className="py-6 text-center text-xs font-bold text-gray-500">© {new Date().getFullYear()} Learna. All rights reserved.</div>
            </div>
        </footer>
    );
}