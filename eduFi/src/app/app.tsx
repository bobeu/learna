"use client";

import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const Educaster = dynamic(() => import("~/components/Educaster"), {
  ssr: false,
});
export default function App() {
  return <Educaster />;
}
