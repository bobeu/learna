import React from "react";
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
import { APP_ICON_URL, APP_NAME } from "~/lib/constants";
import { encodeUserData, filterTransactionData, formatAddr } from "../utilities";
import { useAccount, useChainId } from "wagmi";
import { Address } from "../../../types/quiz";
import {  VerificationConfig, countries, getUniversalLink } from "@selfxyz/core";
import CustomButton from "../peripherals/CustomButton";
import AddressWrapper from "../peripherals/AddressFormatter/AddressWrapper";
import { Hex } from "viem";

export default function SelfQRCodeVerifier({ toggleDrawer, back, campaignHash } : {toggleDrawer: (arg: number) => void, back: () => void, campaignHash: Hex}) {
    const [selfApp, setSelfApp] = React.useState<SelfApp | null>(null);
    const [universalLink, setUniversalLink] = React.useState<string>("");
    const [linkCopied, setLinkCopied] = React.useState<boolean>(false);
    const [showToast, setShowToast] = React.useState<boolean>(false);
    const [toastMessage, setToastMessage] = React.useState<string>("");

    const chainId = useChainId();
    const account = formatAddr(useAccount().address);

    const { verificationConfig, claim } = React.useMemo(
        () => {
            const { contractAddresses } = filterTransactionData({chainId, filter: false});
            const claim = contractAddresses.Claim as Address
            const excludedCountries = [countries.NORTH_KOREA];
            const verificationConfig : VerificationConfig = {
                minimumAge: 16,
                ofac: true,
                excludedCountries
            }

            return {
                verificationConfig,
                claim,
            }
        },  
        [chainId]
    );

    // Use useEffect to ensure code only executes on the client side
    React.useEffect(() => {
        const userDefinedData = encodeUserData(campaignHash);
        try {
            const app = new SelfAppBuilder({
                    version: 2,
                    appName: APP_NAME,
                    scope: process.env.NEXT_PUBLIC_SCOPE as string,
                    endpoint: claim,
                    logoBase64: APP_ICON_URL,
                    userId: account,
                    endpointType: "staging_celo",
                    userIdType: "hex",
                    userDefinedData,
                    disclosures: {
                       ...verificationConfig,
                    }
                }
            ).build();

            setSelfApp(app);
            setUniversalLink(getUniversalLink(app));
        } catch (error) {
            console.error("Failed to initialize Self app:", error);
        }
    }, [campaignHash, account, claim, verificationConfig]);

    const displayToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const copyToClipboard = () => {
        if (!universalLink) return;
        navigator.clipboard
        .writeText(universalLink)
        .then(() => {
            setLinkCopied(true);
            displayToast("Universal link copied to clipboard!");
            setTimeout(() => setLinkCopied(false), 2000);
        })
        .catch((err) => {
            console.error("Failed to copy text: ", err);
            displayToast("Failed to copy link");
        });
    };

    const openSelfApp = () => {
        if (!universalLink) return;

        window.open(universalLink, "_blank");
        displayToast("Opening Self App...");
    };

    const handleSuccessfulVerification = () => {
        displayToast("Verification successful! Now claiming...");
        setTimeout(() => {
            toggleDrawer(1);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full bg-white rounded-2xl flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 space-y-4 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
                    { APP_NAME }
                </h1>
                <p className="text-sm sm:text-base text-gray-600 px-2">
                    To claim your reward, please verify your identity. Scan QR code with Self Protocol App to verify your identity
                </p>
                <CustomButton overrideClassName="w-full" disabled={false} exit={true} onClick={back} >Cancel</CustomButton>
            </div>

            {/* Display QRCode */}
            <div className="sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                <div className="flex justify-center mb-4 sm:mb-6">
                    {
                        selfApp ? (
                            <SelfQRcodeWrapper
                                size={250}
                                selfApp={selfApp}
                                onSuccess={handleSuccessfulVerification}
                                onError={
                                    () => {
                                        displayToast("Error: Failed to verify identity");
                                    }
                                }
                            />
                        ) : (
                            <div className="w-[150px] h-[150px] bg-gray-200 animate-pulse flex items-center justify-center">
                                <p className="text-gray-500 text-sm">Loading QR Code...</p>
                            </div>
                        )
                    }
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
                    <button
                        type="button"
                        onClick={copyToClipboard}
                        disabled={!universalLink}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {linkCopied ? "Copied!" : "Copy Universal Link"}
                    </button>

                    <CustomButton
                        onClick={openSelfApp}
                        disabled={!universalLink}
                        exit={true}
                        overrideClassName="transition-colors "
                    > 
                        Open Self App
                    </CustomButton>
                </div>

                {/* Display user account */}
                <div className="flex flex-col items-center gap-2 mt-2">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Connected Account</span>
                    <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm text-gray-800 border border-gray-200">
                        {account? <AddressWrapper account={account} display={true} size={4} /> : <span className="text-gray-400">Not connected</span>}
                    </div>
                </div>

                {/* Notification */}
                {
                    showToast && (
                    <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
                        {toastMessage}
                    </div>
                    )
                }
            </div>
        </div>
    );
}