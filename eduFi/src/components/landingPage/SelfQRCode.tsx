// import React from "react";
// import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
// import { APP_ICON_URL, APP_NAME } from "~/lib/constants";
// import { filterTransactionData, formatAddr } from "../utilities";
// import { useRouter } from "next/navigation";
// import { useAccount, useChainId } from "wagmi";
// import { Address } from "../../../types/quiz";
// import {  VerificationConfig, countries, getUniversalLink } from "@selfxyz/core";
// import CustomButton from "../peripherals/CustomButton";
// import AddressWrapper from "../peripherals/AddressFormatter/AddressWrapper";

// export default function SelfQRCode({ toggleDrawer } : {toggleDrawer: (arg: number) => void}) {
//     const [selfApp, setSelfApp] = React.useState<SelfApp | null>(null);
//     const [universalLink, setUniversalLink] = React.useState<string>("");
//     const [linkCopied, setLinkCopied] = React.useState<boolean>(false);
//     const [showToast, setShowToast] = React.useState<boolean>(false);
//     const [toastMessage, setToastMessage] = React.useState<string>("");

//     const chainId = useChainId();
//     const account = formatAddr(useAccount().address);
//     const router = useRouter();

//     // Encode multiple values in binary format
//     // function encodeUserData(action: number, amount: number, flags: number): string {
//     //     const buffer = Buffer.alloc(64);
  
//     //     buffer.writeUInt8(action, 0);        // 1 byte for action
//     //     buffer.writeBigUInt64BE(BigInt(amount), 1);  // 8 bytes for amount
//     //     buffer.writeUInt32BE(flags, 9);      // 4 bytes for flags
  
//     //     return "0x" + buffer.toString('hex');
//     // }

//     // Frontend
//     // userDefinedData: encodeUserData(
//     //     1,      // Action: 1 = transfer
//     //     50000,  // Amount: $50,000
//     //     0b1101  // Flags: enhanced_checks | ofac | fast_track
//     // )

// // Backend
// // function decodeUserData(hex: string): { action: number, amount: number, flags: number } {
// //   const buffer = Buffer.from(hex, 'hex');
  
// //   return {
// //     action: buffer.readUInt8(0),
// //     amount: Number(buffer.readBigUInt64BE(1)),
// //     flags: buffer.readUInt32BE(9)
// //   };
// // }

//     const { verificationConfig, claim } = React.useMemo(
//         () => {
//             const { contractAddresses } = filterTransactionData({chainId, filter: false});
//             const claim = contractAddresses.Claim as Address
//             const excludedCountries = [countries.NORTH_KOREA];
//             const verificationConfig : VerificationConfig = {
//                 minimumAge: 16,
//                 ofac: true,
//                 excludedCountries
//             }

//             return {
//                 verificationConfig,
//                 claim,
//             }
//         },  
//         [chainId, countries]
//     );

//     // Use useEffect to ensure code only executes on the client side
//     React.useEffect(() => {
//         try {
//             const app = new SelfAppBuilder({
//                     version: 2,
//                     appName: APP_NAME,
//                     scope: process.env.SCOPE as string,
//                     endpoint: claim,
//                     logoBase64: APP_ICON_URL,
//                     userId: account,
//                     endpointType: "staging_celo",
//                     userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
//                     userDefinedData: "Bonjour Cannes!",
//                     disclosures: {
//                        ...verificationConfig,
//                     }
//                 }
//             ).build();

//             setSelfApp(app);
//             setUniversalLink(getUniversalLink(app));
//         } catch (error) {
//             console.error("Failed to initialize Self app:", error);
//         }
//     }, []);

//     const displayToast = (message: string) => {
//         setToastMessage(message);
//         setShowToast(true);
//         setTimeout(() => setShowToast(false), 3000);
//     };

//     const copyToClipboard = () => {
//         if (!universalLink) return;
//         navigator.clipboard
//         .writeText(universalLink)
//         .then(() => {
//             setLinkCopied(true);
//             displayToast("Universal link copied to clipboard!");
//             setTimeout(() => setLinkCopied(false), 2000);
//         })
//         .catch((err) => {
//             console.error("Failed to copy text: ", err);
//             displayToast("Failed to copy link");
//         });
//     };

//     const openSelfApp = () => {
//         if (!universalLink) return;

//         window.open(universalLink, "_blank");
//         displayToast("Opening Self App...");
//     };

//     const handleSuccessfulVerification = () => {
//         displayToast("Verification successful! Now claiming...");
//         setTimeout(() => {
//             toggleDrawer(1);
//         }, 1500);
//     };

//     return (
//         <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
//             {/* Header */}
//             <div className="mb-6 md:mb-8 text-center">
//                 <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
//                     { APP_NAME }
//                 </h1>
//                 <p className="text-sm sm:text-base text-gray-600 px-2">
//                     To claim your reward, please verify your identity. Scan QR code with Self Protocol App to verify your identity
//                 </p>
//             </div>

//             {/* Display QRCode */}
//             <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
//                 <div className="flex justify-center mb-4 sm:mb-6">
//                     {
//                         selfApp ? (
//                             <SelfQRcodeWrapper
//                                 selfApp={selfApp}
//                                 onSuccess={handleSuccessfulVerification}
//                                 onError={
//                                     () => {
//                                         displayToast("Error: Failed to verify identity");
//                                     }
//                                 }
//                             />
//                         ) : (
//                             <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
//                                 <p className="text-gray-500 text-sm">Loading QR Code...</p>
//                             </div>
//                         )
//                     }
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
//                     <button
//                         type="button"
//                         onClick={copyToClipboard}
//                         disabled={!universalLink}
//                         className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                         {linkCopied ? "Copied!" : "Copy Universal Link"}
//                     </button>

//                     <CustomButton
//                         onClick={openSelfApp}
//                         disabled={!universalLink}
//                         exit={false}
//                         overrideClassName="transition-colors "
//                     > 
//                         Open Self App
//                     </CustomButton>
//                 </div>

//                 {/* Display user account */}
//                 <div className="flex flex-col items-center gap-2 mt-2">
//                     <span className="text-gray-500 text-xs uppercase tracking-wide">Account</span>
//                     <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm text-gray-800 border border-gray-200">
//                         {account? <AddressWrapper account={account} display={true} size={4} /> : <span className="text-gray-400">Not connected</span>}
//                     </div>
//                 </div>

//                 {/* Notification */}
//                 {
//                     showToast && (
//                     <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
//                         {toastMessage}
//                     </div>
//                     )
//                 }
//             </div>
//         </div>
//     );
// }