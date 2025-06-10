"use client";

import * as React  from 'react';
import { QuizData, quizData, QuizDatum } from '~/dummyData';
import { useCallback, useEffect, useMemo, useState } from "react";
// import { Input } from "./ui/input";
import { signIn, signOut, getCsrfToken } from "next-auth/react";
import sdk, {
  SignIn as SignInCore,
} from "@farcaster/frame-sdk";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useSwitchChain,
  useChainId,
} from "wagmi";
import {
  useConnection as useSolanaConnection,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react';
import { useHasSolanaProvider } from "./providers/SafeFarcasterSolanaProvider";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/button";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, celo, celoAlfajores, degen, mainnet, optimism, unichain } from "wagmi/chains";
import { BaseError, UserRejectedRequestError } from "viem";
import { useSession } from "next-auth/react";
// import { Label } from "~/components/ui/label";
import { useFrame } from "~/components/providers/FrameProvider";
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
// import DisplayCategories from './App';
import App from './LearnaApp';
import { MotionDisplayWrapper } from './peripherals/MotionDisplayWrapper';


export default function Demo({ title }: { title?: string } = { title: "Frames v2 Demo" }) {
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sendNotificationResult, setSendNotificationResult] = useState("");
  const [copied, setCopied] = useState(false);

  const [start, setStart] = React.useState<boolean>(false);
  const [oreview, setPreview] = React.useState<boolean>(false);
  const [indexedAnswer, setIndex] = React.useState<number>(0);
  const [selectedCategory, setSelectedCategory] = React.useState<{category: string, data: QuizDatum}>({category: '', data: {
    category: '',
    id: 0,
    difficultyLevel: '',
    questions: []
  }});
  const [difficultyLevel, setLevel] = React.useState<string>('');
  const handleStart = () => setStart(true);
  const { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult, openUrl, close } = useFrame();
  
  const setCategory = (arg: {category: string, data: QuizDatum}) => setSelectedCategory(arg);
  const setDifficultyLevel = (arg: string) => setLevel(arg);
  const handleSelectAnswer = React.useCallback(({label, value} : {label: string, value: string}) => {
    setSelectedCategory(({data, category}) => {
      data.questions[indexedAnswer].userAnswer = {label, value};
      return {
        category,
        data
      }
    });
    setIndex((prev) => {
      let newIndex = prev + 1;
      if(newIndex === (selectedCategory.data.questions.length - 1)) {
        // setPreview(true);
        newIndex = 0;
      } 
      return newIndex;
    });
  }, [setSelectedCategory, setIndex, selectedCategory]);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const hasSolanaProvider = useHasSolanaProvider();
  let solanaWallet, solanaPublicKey, solanaSignMessage, solanaAddress;
  if (hasSolanaProvider) {
    solanaWallet = useSolanaWallet();
    ({ publicKey: solanaPublicKey, signMessage: solanaSignMessage } = solanaWallet);
    solanaAddress = solanaPublicKey?.toBase58();
  }

  // useEffect(() => {
  //   console.log("isSDKLoaded", isSDKLoaded);
  //   console.log("context", context);
  //   console.log("address", address);
  //   console.log("isConnected", isConnected);
  //   console.log("chainId", chainId);
  // }, [context, address, isConnected, chainId, isSDKLoaded]);

  // const {
  //   sendTransaction,
  //   error: sendTxError,
  //   isError: isSendTxError,
  //   isPending: isSendTxPending,
  // } = useSendTransaction();

  // const { isLoading: isConfirming, isSuccess: isConfirmed } =
  //   useWaitForTransactionReceipt({
  //     hash: txHash as `0x${string}`,
  //   });

  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  // const { disconnect } = useDisconnect();
  // const { connect, connectors } = useConnect();

  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

  const nextChain = useMemo(() => {
    if (chainId === celoAlfajores.id) {
      return celoAlfajores;
    } else {
      return celo;
    }
  }, [chainId]);

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: nextChain.id });
  }, [switchChain, nextChain.id]);

  const sendNotification = useCallback(async () => {
    setSendNotificationResult("");
    if (!notificationDetails || !context) {
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: context.user.fid,
          notificationDetails,
        }),
      });

      if (response.status === 200) {
        setSendNotificationResult("Success");
        return;
      } else if (response.status === 429) {
        setSendNotificationResult("Rate limited");
        return;
      }

      const data = await response.text();
      setSendNotificationResult(`Error: ${data}`);
    } catch (error) {
      setSendNotificationResult(`Error: ${error}`);
    }
  }, [context, notificationDetails]);

  // const sendTx = useCallback(() => {
  //   sendTransaction(
  //     {
  //       // call yoink() on Yoink contract
  //       to: "0x4bBFD120d9f352A0BEd7a014bd67913a2007a878",
  //       data: "0x9846cd9efc000023c0",
  //     },
  //     {
  //       onSuccess: (hash) => {
  //         setTxHash(hash);
  //       },
  //     }
  //   );
  // }, [sendTransaction]);

  const signTyped = useCallback(() => {
    signTypedData({
      domain: {
        name: "Learna",
        version: "1",
        chainId,
      },
      types: {
        Message: [{ name: "content", type: "string" }],
      },
      message: {
        content: "Welcome to Learna! A web3 quiz-based educative platform",
      },
      primaryType: "Message",
    });
  }, [chainId, signTypedData]);

  // const toggleContext = useCallback(() => {
  //   setIsContextOpen((prev) => !prev);
  // }, []);

  // if (!isSDKLoaded) {
  //   return <div>Loading...</div>;
  // }

  return(
    <div 
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 10,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 10,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 10,
        paddingRight: context?.client.safeAreaInsets?.right ?? 10,
      }}
      className="relative w-[300px] mx-auto"
    >
      <MotionDisplayWrapper className='w-full flex justify-center uppercase text-sm text-center space-y-4 pb-4'>
        <h1 className='h-[80px] w-[80px] flex justify-center items-center bg-cyan-500/30 rounded-full font-mono'><span className='italic text-4xl font-black text-cyan-800'>L</span><span className='font-mono'>earna</span></h1>
      </MotionDisplayWrapper>
      <App />
    </div>
  );

}




// export default function Demo(
//   { title }: { title?: string } = { title: "Frames v2 Demo" }
// ) {
//   const { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult, openUrl, close } = useFrame();
//   const [isContextOpen, setIsContextOpen] = useState(false);
//   const [txHash, setTxHash] = useState<string | null>(null);
//   const [sendNotificationResult, setSendNotificationResult] = useState("");
//   const [copied, setCopied] = useState(false);

//   const { address, isConnected } = useAccount();
//   const chainId = useChainId();
//   const hasSolanaProvider = useHasSolanaProvider();
//   let solanaWallet, solanaPublicKey, solanaSignMessage, solanaAddress;
//   if (hasSolanaProvider) {
//     solanaWallet = useSolanaWallet();
//     ({ publicKey: solanaPublicKey, signMessage: solanaSignMessage } = solanaWallet);
//     solanaAddress = solanaPublicKey?.toBase58();
//   }

//   useEffect(() => {
//     console.log("isSDKLoaded", isSDKLoaded);
//     console.log("context", context);
//     console.log("address", address);
//     console.log("isConnected", isConnected);
//     console.log("chainId", chainId);
//   }, [context, address, isConnected, chainId, isSDKLoaded]);

//   const {
//     sendTransaction,
//     error: sendTxError,
//     isError: isSendTxError,
//     isPending: isSendTxPending,
//   } = useSendTransaction();

//   const { isLoading: isConfirming, isSuccess: isConfirmed } =
//     useWaitForTransactionReceipt({
//       hash: txHash as `0x${string}`,
//     });

//   const {
//     signTypedData,
//     error: signTypedError,
//     isError: isSignTypedError,
//     isPending: isSignTypedPending,
//   } = useSignTypedData();

//   const { disconnect } = useDisconnect();
//   const { connect, connectors } = useConnect();

//   const {
//     switchChain,
//     error: switchChainError,
//     isError: isSwitchChainError,
//     isPending: isSwitchChainPending,
//   } = useSwitchChain();

//   const nextChain = useMemo(() => {
//     if (chainId === base.id) {
//       return optimism;
//     } else if (chainId === optimism.id) {
//       return degen;
//     } else if (chainId === degen.id) {
//       return mainnet;
//     } else if (chainId === mainnet.id) {
//       return unichain;
//     } else {
//       return base;
//     }
//   }, [chainId]);

//   const handleSwitchChain = useCallback(() => {
//     switchChain({ chainId: nextChain.id });
//   }, [switchChain, nextChain.id]);

//   const sendNotification = useCallback(async () => {
//     setSendNotificationResult("");
//     if (!notificationDetails || !context) {
//       return;
//     }

//     try {
//       const response = await fetch("/api/send-notification", {
//         method: "POST",
//         mode: "same-origin",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fid: context.user.fid,
//           notificationDetails,
//         }),
//       });

//       if (response.status === 200) {
//         setSendNotificationResult("Success");
//         return;
//       } else if (response.status === 429) {
//         setSendNotificationResult("Rate limited");
//         return;
//       }

//       const data = await response.text();
//       setSendNotificationResult(`Error: ${data}`);
//     } catch (error) {
//       setSendNotificationResult(`Error: ${error}`);
//     }
//   }, [context, notificationDetails]);

//   const sendTx = useCallback(() => {
//     sendTransaction(
//       {
//         // call yoink() on Yoink contract
//         to: "0x4bBFD120d9f352A0BEd7a014bd67913a2007a878",
//         data: "0x9846cd9efc000023c0",
//       },
//       {
//         onSuccess: (hash) => {
//           setTxHash(hash);
//         },
//       }
//     );
//   }, [sendTransaction]);

//   const signTyped = useCallback(() => {
//     signTypedData({
//       domain: {
//         name: "Frames v2 Demo",
//         version: "1",
//         chainId,
//       },
//       types: {
//         Message: [{ name: "content", type: "string" }],
//       },
//       message: {
//         content: "Hello from Frames v2!",
//       },
//       primaryType: "Message",
//     });
//   }, [chainId, signTypedData]);

//   const toggleContext = useCallback(() => {
//     setIsContextOpen((prev) => !prev);
//   }, []);

//   if (!isSDKLoaded) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div
//       style={{
//         paddingTop: context?.client.safeAreaInsets?.top ?? 0,
//         paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
//         paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
//         paddingRight: context?.client.safeAreaInsets?.right ?? 0,
//       }}
//     >
//       <div className="w-[300px] mx-auto py-2 px-2">
//         <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

//         <div className="mb-4">
//           <h2 className="font-2xl font-bold">Context</h2>
//           <button
//             onClick={toggleContext}
//             className="flex items-center gap-2 transition-colors"
//           >
//             <span
//               className={`transform transition-transform ${
//                 isContextOpen ? "rotate-90" : ""
//               }`}
//             >
//               ➤
//             </span>
//             Tap to expand
//           </button>

//           {isContextOpen && (
//             <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 {JSON.stringify(context, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>

//         <div>
//           <h2 className="font-2xl font-bold">Actions</h2>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.signIn
//               </pre>
//             </div>
//             <SignIn />
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.openUrl
//               </pre>
//             </div>
//             <Button onClick={() => openUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>Open Link</Button>
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.viewProfile
//               </pre>
//             </div>
//             <ViewProfile />
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.close
//               </pre>
//             </div>
//             <Button onClick={close}>Close Frame</Button>
//           </div>
//         </div>

//         <div className="mb-4">
//           <h2 className="font-2xl font-bold">Last event</h2>

//           <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
//             <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//               {lastEvent || "none"}
//             </pre>
//           </div>
//         </div>

//         <div>
//           <h2 className="font-2xl font-bold">Add to client & notifications</h2>

//           <div className="mt-2 mb-4 text-sm">
//             Client fid {context?.client.clientFid},
//             {added ? " frame added to client," : " frame not added to client,"}
//             {notificationDetails
//               ? " notifications enabled"
//               : " notifications disabled"}
//           </div>

//           <div className="mb-4">
//             <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
//               <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
//                 sdk.actions.addFrame
//               </pre>
//             </div>
//             {addFrameResult && (
//               <div className="mb-2 text-sm">
//                 Add frame result: {addFrameResult}
//               </div>
//             )}
//             <Button onClick={addFrame} disabled={added}>
//               Add frame to client
//             </Button>
//           </div>

//           {sendNotificationResult && (
//             <div className="mb-2 text-sm">
//               Send notification result: {sendNotificationResult}
//             </div>
//           )}
//           <div className="mb-4">
//             <Button onClick={sendNotification} disabled={!notificationDetails}>
//               Send notification
//             </Button>
//           </div>

//           <div className="mb-4">
//             <Button 
//               onClick={async () => {
//                 if (context?.user?.fid) {
//                   const shareUrl = `${process.env.NEXT_PUBLIC_URL}/share/${context.user.fid}`;
//                   await navigator.clipboard.writeText(shareUrl);
//                   setCopied(true);
//                   setTimeout(() => setCopied(false), 2000);
//                 }
//               }}
//               disabled={!context?.user?.fid}
//             >
//               {copied ? "Copied!" : "Copy share URL"}
//             </Button>
//           </div>
//         </div>

//         <div>
//           <h2 className="font-2xl font-bold">Wallet</h2>

//           {address && (
//             <div className="my-2 text-xs">
//               Address: <pre className="inline">{truncateAddress(address)}</pre>
//             </div>
//           )}

//           {chainId && (
//             <div className="my-2 text-xs">
//               Chain ID: <pre className="inline">{chainId}</pre>
//             </div>
//           )}

//           <div className="mb-4">
//             {isConnected ? (
//               <Button
//                 onClick={() => disconnect()}
//                 className="w-full"
//               >
//                 Disconnect
//               </Button>
//             ) : context ? (
//               /* if context is not null, mini app is running in frame client */
//               <Button
//                 onClick={() => connect({ connector: connectors[0] })}
//                 className="w-full"
//               >
//                 Connect
//               </Button>
//             ) : (
//               /* if context is null, mini app is running in browser */
//               <div className="space-y-2">
//                 <Button
//                   onClick={() => connect({ connector: connectors[1] })}
//                   className="w-full"
//                 >
//                   Connect Coinbase Wallet
//                 </Button>
//                 <Button
//                   onClick={() => connect({ connector: connectors[2] })}
//                   className="w-full"
//                 >
//                   Connect MetaMask
//                 </Button>
//               </div>
//             )}
//           </div>

//           <div className="mb-4">
//             <SignEvmMessage />
//           </div>

//           {isConnected && (
//             <>
//               <div className="mb-4">
//                 <SendEth />
//               </div>
//               <div className="mb-4">
//                 <Button
//                   onClick={sendTx}
//                   disabled={!isConnected || isSendTxPending}
//                   isLoading={isSendTxPending}
//                 >
//                   Send Transaction (contract)
//                 </Button>
//                 {isSendTxError && renderError(sendTxError)}
//                 {txHash && (
//                   <div className="mt-2 text-xs">
//                     <div>Hash: {truncateAddress(txHash)}</div>
//                     <div>
//                       Status:{" "}
//                       {isConfirming
//                         ? "Confirming..."
//                         : isConfirmed
//                         ? "Confirmed!"
//                         : "Pending"}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <Button
//                   onClick={signTyped}
//                   disabled={!isConnected || isSignTypedPending}
//                   isLoading={isSignTypedPending}
//                 >
//                   Sign Typed Data
//                 </Button>
//                 {isSignTypedError && renderError(signTypedError)}
//               </div>
//               <div className="mb-4">
//                 <Button
//                   onClick={handleSwitchChain}
//                   disabled={isSwitchChainPending}
//                   isLoading={isSwitchChainPending}
//                 >
//                   Switch to {nextChain.name}
//                 </Button>
//                 {isSwitchChainError && renderError(switchChainError)}
//               </div>
//             </>
//           )}
//         </div>

//         {solanaAddress && (
//           <div>
//             <h2 className="font-2xl font-bold">Solana</h2>
//             <div className="my-2 text-xs">
//               Address: <pre className="inline">{truncateAddress(solanaAddress)}</pre>
//             </div>
//             <SignSolanaMessage signMessage={solanaSignMessage} />
//             <div className="mb-4">
//               <SendSolana />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Solana functions inspired by farcaster demo
// // https://github.com/farcasterxyz/frames-v2-demo/blob/main/src/components/Demo.tsx
// function SignSolanaMessage({ signMessage }: { signMessage?: (message: Uint8Array) => Promise<Uint8Array> }) {
//   const [signature, setSignature] = useState<string | undefined>();
//   const [signError, setSignError] = useState<Error | undefined>();
//   const [signPending, setSignPending] = useState(false);

//   const handleSignMessage = useCallback(async () => {
//     setSignPending(true);
//     try {
//       if (!signMessage) {
//         throw new Error('no Solana signMessage');
//       }
//       const input = new TextEncoder().encode("Hello from Solana!");
//       const signatureBytes = await signMessage(input);
//       const signature = btoa(String.fromCharCode(...signatureBytes));
//       setSignature(signature);
//       setSignError(undefined);
//     } catch (e) {
//       if (e instanceof Error) {
//         setSignError(e);
//       }
//     } finally {
//       setSignPending(false);
//     }
//   }, [signMessage]);

//   return (
//     <>
//       <Button
//         onClick={handleSignMessage}
//         disabled={signPending}
//         isLoading={signPending}
//         className="mb-4"
//       >
//         Sign Message
//       </Button>
//       {signError && renderError(signError)}
//       {signature && (
//         <div className="mt-2 text-xs">
//           <div>Signature: {signature}</div>
//         </div>
//       )}
//     </>
//   );
// }

// function SendSolana() {
//   const [state, setState] = useState<
//     | { status: 'none' }
//     | { status: 'pending' }
//     | { status: 'error'; error: Error }
//     | { status: 'success'; signature: string }
//   >({ status: 'none' });

//   const { connection: solanaConnection } = useSolanaConnection();
//   const { sendTransaction, publicKey } = useSolanaWallet();

//   // This should be replaced but including it from the original demo
//   // https://github.com/farcasterxyz/frames-v2-demo/blob/main/src/components/Demo.tsx#L718
//   const ashoatsPhantomSolanaWallet = 'Ao3gLNZAsbrmnusWVqQCPMrcqNi6jdYgu8T6NCoXXQu1';

//   const handleSend = useCallback(async () => {
//     setState({ status: 'pending' });
//     try {
//       if (!publicKey) {
//         throw new Error('no Solana publicKey');
//       }

//       const { blockhash } = await solanaConnection.getLatestBlockhash();
//       if (!blockhash) {
//         throw new Error('failed to fetch latest Solana blockhash');
//       }

//       const fromPubkeyStr = publicKey.toBase58();
//       const toPubkeyStr = ashoatsPhantomSolanaWallet;
//       const transaction = new Transaction();
//       transaction.add(
//         SystemProgram.transfer({
//           fromPubkey: new PublicKey(fromPubkeyStr),
//           toPubkey: new PublicKey(toPubkeyStr),
//           lamports: 0n,
//         }),
//       );
//       transaction.recentBlockhash = blockhash;
//       transaction.feePayer = new PublicKey(fromPubkeyStr);

//       const simulation = await solanaConnection.simulateTransaction(transaction);
//       if (simulation.value.err) {
//         // Gather logs and error details for debugging
//         const logs = simulation.value.logs?.join('\n') ?? 'No logs';
//         const errDetail = JSON.stringify(simulation.value.err);
//         throw new Error(`Simulation failed: ${errDetail}\nLogs:\n${logs}`);
//       }
//       const signature = await sendTransaction(transaction, solanaConnection);
//       setState({ status: 'success', signature });
//     } catch (e) {
//       if (e instanceof Error) {
//         setState({ status: 'error', error: e });
//       } else {
//         setState({ status: 'none' });
//       }
//     }
//   }, [sendTransaction, publicKey, solanaConnection]);

//   return (
//     <>
//       <Button
//         onClick={handleSend}
//         disabled={state.status === 'pending'}
//         isLoading={state.status === 'pending'}
//         className="mb-4"
//       >
//         Send Transaction (sol)
//       </Button>
//       {state.status === 'error' && renderError(state.error)}
//       {state.status === 'success' && (
//         <div className="mt-2 text-xs">
//           <div>Hash: {truncateAddress(state.signature)}</div>
//         </div>
//       )}
//     </>
//   );
// }

// function SignEvmMessage() {
//   const { isConnected } = useAccount();
//   const { connectAsync } = useConnect();
//   const {
//     signMessage,
//     data: signature,
//     error: signError,
//     isError: isSignError,
//     isPending: isSignPending,
//   } = useSignMessage();

//   const handleSignMessage = useCallback(async () => {
//     if (!isConnected) {
//       await connectAsync({
//         chainId: base.id,
//         connector: config.connectors[0],
//       });
//     }

//     signMessage({ message: "Hello from Frames v2!" });
//   }, [connectAsync, isConnected, signMessage]);

//   return (
//     <>
//       <Button
//         onClick={handleSignMessage}
//         disabled={isSignPending}
//         isLoading={isSignPending}
//       >
//         Sign Message
//       </Button>
//       {isSignError && renderError(signError)}
//       {signature && (
//         <div className="mt-2 text-xs">
//           <div>Signature: {signature}</div>
//         </div>
//       )}
//     </>
//   );
// }

// function SendEth() {
//   const { isConnected, chainId } = useAccount();
//   const {
//     sendTransaction,
//     data,
//     error: sendTxError,
//     isError: isSendTxError,
//     isPending: isSendTxPending,
//   } = useSendTransaction();

//   const { isLoading: isConfirming, isSuccess: isConfirmed } =
//     useWaitForTransactionReceipt({
//       hash: data,
//     });

//   const toAddr = useMemo(() => {
//     // Protocol guild address
//     return chainId === base.id
//       ? "0x32e3C7fD24e175701A35c224f2238d18439C7dBC"
//       : "0xB3d8d7887693a9852734b4D25e9C0Bb35Ba8a830";
//   }, [chainId]);

//   const handleSend = useCallback(() => {
//     sendTransaction({
//       to: toAddr,
//       value: 1n,
//     });
//   }, [toAddr, sendTransaction]);

//   return (
//     <>
//       <Button
//         onClick={handleSend}
//         disabled={!isConnected || isSendTxPending}
//         isLoading={isSendTxPending}
//       >
//         Send Transaction (eth)
//       </Button>
//       {isSendTxError && renderError(sendTxError)}
//       {data && (
//         <div className="mt-2 text-xs">
//           <div>Hash: {truncateAddress(data)}</div>
//           <div>
//             Status:{" "}
//             {isConfirming
//               ? "Confirming..."
//               : isConfirmed
//               ? "Confirmed!"
//               : "Pending"}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }



// function ViewProfile() {
//   const [fid, setFid] = useState("3");

//   return (
//     <>
//       <div>
//         <Label
//           className="text-xs font-semibold text-gray-500 mb-1"
//           htmlFor="view-profile-fid"
//         >
//           Fid
//         </Label>
//         <Input
//           id="view-profile-fid"
//           type="number"
//           value={fid}
//           className="mb-2"
//           onChange={(e) => {
//             setFid(e.target.value);
//           }}
//           step="1"
//           min="1"
//         />
//       </div>
//       <Button
//         onClick={() => {
//           sdk.actions.viewProfile({ fid: parseInt(fid) });
//         }}
//       >
//         View Profile
//       </Button>
//     </>
//   );
// }

// const renderError = (error: Error | null) => {
//   if (!error) return null;
//   if (error instanceof BaseError) {
//     const isUserRejection = error.walk(
//       (e) => e instanceof UserRejectedRequestError
//     );

//     if (isUserRejection) {
//       return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
//     }
//   }

//   return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
// };




// "use client"

// import { Checkbox } from "@/components/ui/checkbox"
// import { Label } from "@/components/ui/label"

// export function CheckboxDemo() {
//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex items-center gap-3">
//         <Checkbox id="terms" />
//         <Label htmlFor="terms">Accept terms and conditions</Label>
//       </div>
//       <div className="flex items-start gap-3">
//         <Checkbox id="terms-2" defaultChecked />
//         <div className="grid gap-2">
//           <Label htmlFor="terms-2">Accept terms and conditions</Label>
//           <p className="text-muted-foreground text-sm">
//             By clicking this checkbox, you agree to the terms and conditions.
//           </p>
//         </div>
//       </div>
//       <div className="flex items-start gap-3">
//         <Checkbox id="toggle" disabled />
//         <Label htmlFor="toggle">Enable notifications</Label>
//       </div>
//       <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
//         <Checkbox
//           id="toggle-2"
//           defaultChecked
//           className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
//         />
//         <div className="grid gap-1.5 font-normal">
//           <p className="text-sm leading-none font-medium">
//             Enable notifications
//           </p>
//           <p className="text-muted-foreground text-sm">
//             You can enable or disable notifications at any time.
//           </p>
//         </div>
//       </Label>
//     </div>
//   )
// }




// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from "@/components/ui/resizable"

// export function ResizableDemo() {
//   return (
//     <ResizablePanelGroup
//       direction="vertical"
//       className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]"
//     >
//       <ResizablePanel defaultSize={25}>
//         <div className="flex h-full items-center justify-center p-6">
//           <span className="font-semibold">Header</span>
//         </div>
//       </ResizablePanel>
//       <ResizableHandle />
//       <ResizablePanel defaultSize={75}>
//         <div className="flex h-full items-center justify-center p-6">
//           <span className="font-semibold">Content</span>
//         </div>
//       </ResizablePanel>
//     </ResizablePanelGroup>
//   )
// }




// Carousel

// import * as React from "react"




// Sonner

// "use client"

// import { toast } from "sonner"

// import { Button } from "@/components/ui/button"

// export function SonnerDemo() {
//   return (
//     <Button
//       variant="outline"
//       onClick={() =>
//         toast("Event has been created", {
//           description: "Sunday, December 03, 2023 at 9:00 AM",
//           action: {
//             label: "Undo",
//             onClick: () => console.log("Undo"),
//           },
//         })
//       }
//     >
//       Show Toast
//     </Button>
//   )
// }


// Toggle

// import { Bold } from "lucide-react"

// import { Toggle } from "@/components/ui/toggle"

// export function ToggleDemo() {
//   return (
//     <Toggle aria-label="Toggle italic">
//       <Bold className="h-4 w-4" />
//     </Toggle>
//   )
// }
