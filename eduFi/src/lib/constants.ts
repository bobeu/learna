import { FunctionName } from "~/components/utilities";

export const APP_URL = process.env.NEXT_PUBLIC_URL!;
export const APP_NAME = process.env.NEXT_PUBLIC_MINI_APP_NAME;
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_MINI_APP_DESCRIPTION;
export const APP_PRIMARY_CATEGORY = process.env.NEXT_PUBLIC_MINI_APP_PRIMARY_CATEGORY;
export const APP_TAGS = process.env.NEXT_PUBLIC_MINI_APP_TAGS?.split(',');
export const SCREENSHOT_URLS = [
    `${APP_URL}/screenshot1.png`,
    `${APP_URL}/screenshot2.png`,
    `${APP_URL}/screenshot3.png`
];
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_OG_IMAGE_URL = `${APP_URL}/api/opengraph-image`;
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#f7f7f7";
export const APP_BUTTON_TEXT = process.env.NEXT_PUBLIC_MINI_APP_BUTTON_TEXT;
export const APP_WEBHOOK_URL = process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID 
    ? `https://api.neynar.com/f/app/${process.env.NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;
export const USE_WALLET = process.env.NEXT_PUBLIC_USE_WALLET === 'true';

export const CAST_MESSAGES : {key: FunctionName, handler(weekId: number): string}[] = [
    {
        key: 'generateKey',
        handler: (weekId) => `I just generated my passkey for week ${weekId}`
    },
    {
        key: 'claimWeeklyReward',
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
