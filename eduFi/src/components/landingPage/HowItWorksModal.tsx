"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * @dev The modal pops up when the How-it-works button is clicked on the landing page
 * @param 
 * @returns 
 * @notice Place your generated video here (public/how-it-works.mp4)
 */
export default function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const videoSrc = "/how-it-works.mp4"; 
    // const poster = "/campaign-images/celo-blockchain-development.svg";

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-lg">How Learna Works</DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-4 text-sm text-neutral-500 dark:text-neutral-400">A quick walkthrough of learning, campaigns, rewards, and AI tutor.</div>
                <div className="px-6 pb-6">
                    <div className="relative w-full rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black">
                        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                        {/* <video controls playsInline preload="metadata" poster={poster} className="w-full h-auto"> */}
                        <video controls playsInline preload="metadata" className="w-full h-auto">
                            <source src={videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">If the video doesn't load, ensure the file exists at public/how-it-works.mp4</div>
                        <a href={videoSrc} download className="inline-flex">
                            <Button size="sm" variant="outline">Download video</Button>
                        </a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


