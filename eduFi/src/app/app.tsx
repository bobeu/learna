"use client";

import React from "react";
import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const Educaster = dynamic(() => import("~/components/Educaster"), {
  ssr: false,
  loading: () => (
      <div className="h-screen relative w-full flex items-center justify-center text-sm font-mono">
        <h3 className="py-12 p-5 text-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white animate-bounce-gentle">
          <p className="animate-ping">Loading...</p>
        </h3>
      </div>
    ),
});
export default function App() {
  return <Educaster />;
}

