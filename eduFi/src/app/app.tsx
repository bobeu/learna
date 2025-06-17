"use client";

import dynamic from "next/dynamic";
// import { APP_NAME } from "~/lib/constants";

// note: dynamic import is required for components that use the Frame SDK
const LearnaApp = dynamic(() => import("~/components/LearnaApp"), {
  ssr: false,
});
// { title }: { title?: string } = { title: APP_NAME }
export default function App() {
  return <LearnaApp />;
}
