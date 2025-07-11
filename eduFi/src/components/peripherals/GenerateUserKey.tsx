import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import GenerateKey from "../transactions/GenerateKey";
import { ArrowLeft, Key } from "lucide-react";
import type { Address } from "../../../types/quiz";

export default function GenerateUserKey({exit, runAll, campaignHash} : {exit: () => void, runAll: boolean, campaignHash: Address}) {
    return(
        <MotionDisplayWrapper className="max-w-2xl w-full bg-white animate-fade-in slide-in-from-top-2 space-y-4 glass-card rounded-3xl p-8 text-center mb-6">
            <div className="p-8 space-y-6">
                <div className="inline-flex items-center justify-center bg-purple-20 border-purple-30 w-24 h-24 border-2 rounded-full mb-6 animate-bounce-gentle bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    <Key className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">{`Ooops! We can't find your key for this week!`}</h3>
                <div className="flex flex-col gap-4">
                    <GenerateKey 
                        buttonClassName="w-full" 
                        functionName={runAll? 'runall' : 'generateKey' } 
                        campaignHash={campaignHash}
                    />
                    <button
                        onClick={exit}
                        className="flex-1 btn-primary flex items-center justify-center py-4 px-6 transition-all duration-300 transform space-x-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
        </MotionDisplayWrapper>
    );
}