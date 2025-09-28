import React from "react";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white text-black dark:bg-black dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-2 border-primary-500/40 border-t-primary-500 animate-spin" />
          <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/10" />
        </div>
        <div className="text-center">
          <div className="text-base font-semibold">Preparing Learna…</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Loading campaigns and theme</div>
        </div>
      </div>
    </div>
  );
}