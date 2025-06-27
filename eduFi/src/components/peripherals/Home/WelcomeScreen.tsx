import React from "react";
import Drawer from "~/components/peripherals/Confirmation/Drawer";

export interface WelcomeScreenProps {
    openDrawer: number; 
    toggleDrawer: (arg: number) => void
    children: React.ReactNode;
    title?: string; 
}

export function WelcomeScreen({openDrawer, title, toggleDrawer, children}: WelcomeScreenProps) {
    React.useEffect(() => {
        if(openDrawer === 1) {
             setTimeout(() => {
                 toggleDrawer(0);
             }, 10000);
        } 
        return () => clearTimeout(10000);
    }, [openDrawer, toggleDrawer]);

    return(
        <Drawer
            openDrawer={openDrawer}
            setDrawerState={() => toggleDrawer(0)}
            title={title || "Welcome to a new week"}
            onClickAction={() => toggleDrawer(0)}          
        >
            <div 
                className="font-mono space-y-4 w md:flex flex-col justify-center md:w-[424px] md:h-[695px]"
            >
                { children }
            </div>
        </Drawer>
    );
}
