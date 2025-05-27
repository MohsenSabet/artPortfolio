"use client";

import React from "react";
import dynamic from "next/dynamic";

// client-only tunnel shader background
const TunnelBackground = dynamic(
  () => import("@/components/TunnelBackground"),
  { ssr: false }
);

export default function Home() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <TunnelBackground />
    </div>
  );
}
