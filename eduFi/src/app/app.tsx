"use client";
/* eslint-disable */
import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/utilities/Loading";
import { useMiniApp } from "@neynar/react";

// note: dynamic import is required for components that use the Frame SDK
const LandingPage = dynamic(() => import("@/components/learnaApp/LandingPage"), {
  ssr: false,
  loading: () => (<Loading />),
});

export default function App() {
  const { actions, isSDKLoaded } = useMiniApp();
  if(!isSDKLoaded || !actions.ready) return <Loading />;
  return ( <LandingPage /> );
}