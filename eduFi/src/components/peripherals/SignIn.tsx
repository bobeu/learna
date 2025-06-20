"use client";

import '@rainbow-me/rainbowkit/styles.css'
import * as React  from 'react';
import { useCallback, useState } from "react";
import { signIn, signOut, getCsrfToken } from "next-auth/react";
import sdk, { SignIn as SignInCore, } from "@farcaster/frame-sdk";
import { useSession } from "next-auth/react";
import { Button } from '~/components/ui/button';
// import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function SignIn() {
    const [signingIn, setSigningIn] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [signInResult, setSignInResult] = useState<SignInCore.SignInResult>();
    const [signInFailure, setSignInFailure] = useState<string>();
    const { data: session, status } = useSession();

    // const { isConnected } = useAccount()
  
    const getNonce = useCallback(async () => {
      const nonce = await getCsrfToken();
      if (!nonce) throw new Error("Unable to generate nonce");
      return nonce;
    }, []);
  
    const handleSignIn = useCallback(async () => {
      try {
        setSigningIn(true);
        setSignInFailure(undefined);
        const nonce = await getNonce();
        const result = await sdk.actions.signIn({ nonce, acceptAuthAddress: true});
        setSignInResult(result);
  
        await signIn("credentials", {
          message: result.message,
          signature: result.signature,
          redirect: false,
        });
      } catch (e) {
        if (e instanceof SignInCore.RejectedByUser) {
          setSignInFailure("Rejected by user");
          return;
        }
  
        setSignInFailure("Unknown error");
      } finally {
        setSigningIn(false);
      }
    }, [getNonce]);
  
    const handleSignOut = useCallback(async () => {
      try {
        setSigningOut(true);
        await signOut({ redirect: false });
        setSignInResult(undefined);
      } finally {
        setSigningOut(false);
      }
    }, []);
  
    return (
      <React.Fragment>
        {/* <ConnectButton /> */}
        {status !== "authenticated" && (
          <Button variant={'outline'} className="w-full mt-1 bg-cyan-500" onClick={handleSignIn} disabled={signingIn}>
            Sign In with Farcaster
          </Button>
        )}
        {status === "authenticated" && (
          <Button onClick={handleSignOut} disabled={signingOut}>
            Sign out
          </Button>
        )}
        {session && (
          <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
            <div className="font-semibold text-gray-500 mb-1">Session</div>
            <div className="whitespace-pre">
              {JSON.stringify(session, null, 2)}
            </div>
          </div>
        )}
        {signInFailure && !signingIn && (
          <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
            <div className="font-semibold text-gray-500 mb-1">SIWF Result</div>
            <div className="whitespace-pre">{signInFailure}</div>
          </div>
        )}
        {signInResult && !signingIn && (
          <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
            <div className="font-semibold text-gray-500 mb-1">SIWF Result</div>
            <div className="whitespace-pre">
              {JSON.stringify(signInResult, null, 2)}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }



//   import React, { useState, useEffect } from "react";
// import { sdk } from "@farcaster/frame-sdk";
 
// export function App() {
//   const [user, setUser] = useState<{ fid: number }>();
 
//   useEffect(() => {
//     (async () => {
//       const res = await sdk.quickAuth.fetch(`${BACKEND_ORIGIN}/me`);
//       if (res.ok) {
//         setUser(await res.json());
//         sdk.actions.ready()
//       }
//     })()
//   }, [])
 
//   // The splash screen will be shown, don't worry about rendering yet.
//   if (!user) {
//     return null;
//   }
 
//   return (
//     <div>
//       hello, {user.fid}
//     </div>
//   )
// }

// import { preconnect } from 'react-dom';
 
// function AppRoot() {
//   preconnect("https://auth.farcaster.xyz");
// }