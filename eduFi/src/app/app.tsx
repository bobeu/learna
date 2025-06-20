"use client";

import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const LearnaApp = dynamic(() => import("~/components/LearnaApp"), {
  ssr: false,
});
export default function App() {
  return <LearnaApp />;
}
