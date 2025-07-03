import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Stats from './Stats';
import Ctas from './Ctas';
import Footer from './Footer';
import ScrollButton from './ScrollButton';

function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    
    const windowIsDefined = typeof window !== "undefined";
    const toggleOpen = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="min-h-screen overflow-auto bg-white">
            <Navbar isMenuOpen={isMenuOpen} toggleOpen={toggleOpen} />
            <Hero />
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