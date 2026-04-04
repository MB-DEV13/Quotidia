"use client";

import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <Navbar />
      {/* Desktop: offset for sidebar. Mobile: offset for bottom nav */}
      <main className="md:pl-56 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
