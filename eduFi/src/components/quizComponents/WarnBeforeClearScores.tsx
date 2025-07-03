import React from "react";
import Drawer from "../peripherals/Confirmation/Drawer";
import { Save, ArrowLeft, LucideFileWarning } from "lucide-react";

interface WarnBeforeClearScoresAndDataProps {
    openDrawer: number; 
    toggleDrawer: (arg: number) => void
    saveScore: () => void;
    exit: () => void;
}

export function WarnBeforeClearScoresAndData({openDrawer, exit, toggleDrawer, saveScore}: WarnBeforeClearScoresAndDataProps) {
    const handleSaveScore = () => {
        toggleDrawer(0);
        saveScore();
    }

    const handleExit = () => {
        toggleDrawer(0);
        exit();
    }

    return(
        <Drawer
            openDrawer={openDrawer}
            setDrawerState={() => toggleDrawer(0)}
            title={"Are you sure want to exit?"}
            onClickAction={() => toggleDrawer(0)}          
        >
            <div 
                className="space-y-4 w md:flex flex-col justify-center md:w-[424px] md:h-[695px]"
            >
                <div className="border p-4 space-y-2 rounded-2xl text-center">
                    <div className="inline-flex items-center justify-center text-red-400 w-24 h-24">
                        <LucideFileWarning className="w-12 h-12"/>
                    </div>
                    <p className="text-2xl">Exiting without saving your scores will clear your progress</p>
                    <p className="text-cyan-900">You cannot retake a quiz twice. We recommend that you save your scores to be eligible for weekly payout</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleSaveScore}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 
                                text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105
                                flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                        <Save className="w-5 h-5" />
                        <span>Save My Scores</span>
                    </button>
                    <button
                        onClick={handleExit}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Exit Anyway</span>
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
