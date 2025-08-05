import React from "react";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { GetFormattedCampaign } from "../../../types/quiz";
import { mockHash } from "../utilities";

export const mockFormattedCampaign : GetFormattedCampaign = {
    hash_: mockHash,
    campaignName: 'mockHash',
    totalLearners: 0,
    fundsNative: { toNum: 0, toStr: '0'},
    fundsERC20: { toNum: 0, toStr: '0'},
    platform: { toNum: 0, toStr: '0'},
    lastUpdated: '',
    totalPoints:'0',
    operator: <> </>,
    token: <> </>,
    users: <> </>
}

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