import React from "react";
import { NeynarContextProvider, Theme } from "@neynar/react";
// import { NeynaStorageContextProvider, } from ".";

export default function NeynaAppContext({children} : {children: React.ReactNode}) {
    // const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
    // const authenticateUser = () => setIsAuthenticated(true);
    
    return(
        <NeynarContextProvider
            settings={{
                clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
                defaultTheme: Theme.Light,
                eventsCallbacks: {
                    onAuthSuccess: () => { },
                    onSignout() { },
                },
            }}
        >
            { children }
        </NeynarContextProvider>
    );
}
            // <NeynaStorageContextProvider value={{isAuthenticated, setIsAuthenticated: authenticateUser }}>
            // </NeynaStorageContextProvider>