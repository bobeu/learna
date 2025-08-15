import { Address, FunctionName } from "../../types/quiz";

export const RECEIVER = "0xa1f70ffA4322E3609dD905b41f17Bf3913366bC1" as Address;
export const APP_URL = process.env.NEXT_PUBLIC_URL!;
export const APP_NAME = `${process.env.NEXT_PUBLIC_MINI_APP_NAME} - Challenge Your Knowledge`;
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_MINI_APP_DESCRIPTION;
export const APP_PRIMARY_CATEGORY = process.env.NEXT_PUBLIC_MINI_APP_PRIMARY_CATEGORY;
export const APP_TAGS = process.env.NEXT_PUBLIC_MINI_APP_TAGS?.split(',');
export const APP_ICON_URL = `${APP_URL}/learna-logo.png`;
export const APP_OG_IMAGE_URL = `${APP_URL}/api/opengraph-image`;
export const APP_SPLASH_URL = `${APP_URL}/splash-screen.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#34c3eb";
export const APP_BUTTON_TEXT = process.env.NEXT_PUBLIC_MINI_APP_BUTTON_TEXT as string;
export const APP_WEBHOOK_URL = process.env.NEXT_PUBLIC_NEYNAR_API_KEY && process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID 
    ? `https://api.neynar.com/f/app/${process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;
export const USE_WALLET = process.env.NEXT_PUBLIC_USE_WALLET === 'true';
export const MINI_APP_METADATA = process.env.NEXT_PUBLIC_MINI_APP_METADATA;

export const CAST_MESSAGES : {key: FunctionName, handler(weekId: number): string}[] = [
    {
        key: 'generateKey',
        handler: (weekId) => `I just generated my passkey for week ${weekId}`
    },
    {
        key: 'claimReward',
        handler: (weekId) => `Claimed my reward for week ${weekId}`
    },
    {
        key: 'recordPoints',
        handler: (weekId) => `Sharing my points for week ${weekId}`
    },
    {
        key: 'sortWeeklyReward',
        handler: (weekId) => `Week ${weekId} payout is sorted. You can now claim your rewards`
    },
];
