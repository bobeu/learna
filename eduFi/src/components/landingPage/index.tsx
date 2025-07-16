/* eslint-disable */

import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Stats from './Stats';
import Ctas from './Ctas';
import Footer from './Footer';
import ScrollButton from './ScrollButton';
import { useAccount } from 'wagmi';
import useStorage from '../hooks/useStorage';

function LandingPage() {
    const windowIsDefined = typeof window !== "undefined";
    const { isConnected } = useAccount();
    const { setpath, toggleOpen } = useStorage();

    const toggleShowConnectButtons = () => {
        if(isConnected) {
            setpath('dashboard');
        } else {
            toggleOpen(true);
            alert("Please connect to a wallet");
        }

    };

    return (
        <div className="min-h-screen overflow-auto bg-white">
            <Navbar />
            <Hero handleClick={toggleShowConnectButtons}/>
            <Features />
            <HowItWorks />
            <Stats />
            <Ctas />
            <ScrollButton windowIsDefined={windowIsDefined} />
            <Footer />
        </div>
    );
}

export default LandingPage;