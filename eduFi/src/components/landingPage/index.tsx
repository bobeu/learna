import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Stats from './Stats';
import Ctas from './Ctas';
import Footer from './Footer';
import ScrollButton from './ScrollButton';
import ConnectButtons from '../ConnectButtons';
import { useAccount } from 'wagmi';
import useStorage from '../hooks/useStorage';

function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [showConnectButtons, setShowConnectButtons] = React.useState(false);
    
    const windowIsDefined = typeof window !== "undefined";
    const { isConnected } = useAccount();
    const { setpath } = useStorage();

    const toggleOpen = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleShowConnectButtons = () => {
        isConnected? setpath('dashboard') : setShowConnectButtons(!showConnectButtons);
    };

    return (
        <div className="min-h-screen overflow-auto bg-white">
            <Navbar isMenuOpen={isMenuOpen} toggleOpen={toggleOpen} />
            <Hero handleClick={toggleShowConnectButtons}/>
            { showConnectButtons && <ConnectButtons />} 
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