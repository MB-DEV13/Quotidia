"use client";

import dynamic from "next/dynamic";

const InteractiveMockup = dynamic(
  () => import("./InteractiveMockup").then((m) => ({ default: m.InteractiveMockup })),
  {
    loading: () => (
      <div className="h-[420px] rounded-3xl bg-white/60 border border-white/80 shadow-card animate-pulse" />
    ),
  }
);

export { InteractiveMockup };
