"use client";

import React from "react";
import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const Educaster = dynamic(() => import("~/components/Educaster"), {
  ssr: false,
});

export default function Dashboard() {

    return(
        <Educaster />
    );
}