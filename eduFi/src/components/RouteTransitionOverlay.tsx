"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function RouteTransitionOverlay() {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const prevPathRef = React.useRef(pathname);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (pathname !== prevPathRef.current) {
            prevPathRef.current = pathname;
            setIsTransitioning(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setIsTransitioning(false), 800);
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [pathname]);

    if (!isTransitioning) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 text-black dark:bg-black/80 dark:text-white">
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-primary-500/40 border-t-primary-500 animate-spin" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/10" />
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Navigating…</div>
            </div>
        </div>
    );
}


