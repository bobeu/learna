import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_BUTTON_TEXT, APP_DESCRIPTION, APP_ICON_URL, APP_NAME, APP_OG_IMAGE_URL, APP_PRIMARY_CATEGORY, APP_SPLASH_BACKGROUND_COLOR, APP_TAGS, APP_URL, } from './constants';
import { APP_SPLASH_URL } from './constants';

interface MiniAppMetadata {
  version: string;
  name: string;
  iconUrl: string;
  homeUrl: string;
  imageUrl?: string;
  buttonTitle?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
  webhookUrl?: string;
  description?: string;
  primaryCategory?: string;
  tags?: string[];
  requiredChains?:string[]; 
};

interface MiniAppManifest {
  accountAssociation?: {
    header: string;
    payload: string;
    signature: string;
  };
  frame: MiniAppMetadata;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSecretEnvVars() {
  const seedPhrase = process.env.SEED_PHRASE as string;
  const fid = process.env.FID;
  
  if (!seedPhrase || !fid) {
    return null;
  }

  return { seedPhrase, fid };
}

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: "next",
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getMiniAppMetadata(): Promise<MiniAppManifest> {
  // First check for MINI_APP_METADATA in .env and use that if it exists
  if (process.env.MINI_APP_METADATA) {
    try {
      const metadata = JSON.parse(process.env.MINI_APP_METADATA);
      console.log('Using pre-signed mini app metadata from environment');
      return metadata;
    } catch (error) {
      console.warn('Failed to parse MINI_APP_METADATA from environment:', error);
    }
  }

  if (!APP_URL) {
    throw new Error('NEXT_PUBLIC_URL not configured');
  }

  // Get the domain from the URL (without https:// prefix)
  // const domain = new URL(APP_URL).hostname;

  const secretEnvVars = getSecretEnvVars();
  if (!secretEnvVars) {
    console.warn('No seed phrase or FID found in environment variables -- generating unsigned metadata');
  }

  // let accountAssociation;
  // if (secretEnvVars) {
  //   // Generate account from seed phrase
  //   const account = mnemonicToAccount(secretEnvVars.seedPhrase);
  //   const custodyAddress = account.address;

  //   const header = {
  //     fid: parseInt(secretEnvVars.fid),
  //     type: 'custody',
  //     key: custodyAddress,
  //   };
  //   const encodedHeader = Buffer.from(JSON.stringify(header), 'utf-8').toString('base64');

  //   const payload = {
  //     domain
  //   };
  //   const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');

  //   const signature = await account.signMessage({ 
  //     message: `${encodedHeader}.${encodedPayload}`
  //   });
  //   const encodedSignature = Buffer.from(signature, 'utf-8').toString('base64url');

  //   accountAssociation = {
  //     header: encodedHeader,
  //     payload: encodedPayload,
  //     signature: encodedSignature
  //   };
  // }

  return {
    accountAssociation:  {
      header: "eyJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4M0EwMTA5MDVEY0Q3MkY0YTc4YTc3ZjU2MzYwMTc4MEFGQWU1NjUyRiIsImZpZCI6OTQwOTI5fQ==",
      payload:"eyJkb21haW4iOiJsZWFybmEudmVyY2VsLmFwcCJ9",
      signature:"MHhhOTY0ZmVmZWIzMmU3YmU3YTczYWRmNDlhNmVkMzdjM2E2ODRiNzA5ZTc1MWQ4Nzk3YWFjNzhkNzVjZDY4MDM5MzU5YTlhYzM5YzRiZDUxMWJjYjcyYjMwMmI4Yzc5YTgyODQ0ZTE5MmNjOGZiYjVmODY2ZGJhZWU2YWFjMGU1ODFj"
    },
    frame: {
      version:"1",
      name:"Learna",
      iconUrl:"https://learna.vercel.app/logo.png",
      homeUrl:"https://learna.vercel.app",
      imageUrl:"https://learna.vercel.app/api/opengraph-image",
      buttonTitle:"open",
      splashImageUrl:"https://learna.vercel.app/splash-screen.png",
      splashBackgroundColor:"#fff",
      webhookUrl:"https://api.neynar.com/f/app/98274362-f69a-41fa-a581-ffabf5423b50/event",
      description:"Test your knowledge with engaging quizzes across various topics. Challenge yourself, track your progress and get rewarded every week.",
      primaryCategory:"education",
      tags:["education","developers","crypto","earning","quiz"],
      requiredChains: [
        'eip155:42220'
      ]
    },
  };
}
// screenshots:["https://learna.vercel.app/screenshot1.png","https://learna.vercel.app/screenshot2.png","https://learna.vercel.app/screenshot3.png"],
// frame: {
//   version: "1",
//   name: APP_NAME ?? "Educaster",
//   iconUrl: APP_ICON_URL,
//   homeUrl: APP_URL,
//   imageUrl: APP_OG_IMAGE_URL,
//   buttonTitle: APP_BUTTON_TEXT ?? "Launch Mini App",
//   splashImageUrl: APP_SPLASH_URL,
//   splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
//   webhookUrl: APP_WEBHOOK_URL,
//   description: APP_DESCRIPTION,
//   primaryCategory: APP_PRIMARY_CATEGORY,
//   tags: APP_TAGS,
//   requiredChains: [
//     'eip155:42220'
//   ]
// },