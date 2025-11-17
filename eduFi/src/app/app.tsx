"use client";
/* eslint-disable */
import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/utilities/Loading";

// note: dynamic import is required for components that use the Frame SDK
const LandingPage = dynamic(() => import("@/components/learnaApp/LandingPage"), {
  ssr: false,
  loading: () => (<Loading />),
});

export default function App() {
  return ( <LandingPage /> );
}