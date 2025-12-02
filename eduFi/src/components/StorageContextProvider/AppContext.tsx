"use client";

import React from "react";
import { NeynarContextProvider } from "@neynar/react";

export default function NeynaAppContext({children} : {children: React.ReactNode}) {
    const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;
    
    if (!clientId) {
        console.warn('NEXT_PUBLIC_NEYNAR_CLIENT_ID is not set. Neynar authentication will not work.');
    }

    return(
        <NeynarContextProvider
            settings={{
                clientId: clientId || "",
                eventsCallbacks: {
                    onAuthSuccess: (user) => {
                        console.log('Neynar authentication successful:', user);
                    },
                    onSignout: () => {
                        console.log('Neynar signout successful');
                    },
                },
            }}
        >
            { children }
        </NeynarContextProvider>
    );
}