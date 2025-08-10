import React from "react";
import { NeynarContextProvider, Theme } from "@neynar/react";

export default function NeynaAppContext({children} : {children: React.ReactNode}) {
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