'use client';

import { SessionProvider } from "next-auth/react";
import Navigation from "@/components/Navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>{children}</main>
      </div>
    </SessionProvider>
  );
} 