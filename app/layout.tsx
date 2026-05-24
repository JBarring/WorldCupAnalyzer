import type { Metadata } from "next";

import "@/app/globals.css";

import { MockSnapshotBanner } from "@/components/mock-snapshot-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "CupCast | FIFA World Cup Analytics",
  description: "Premium World Cup match intelligence, official 2026 fixtures, win probabilities, and bracket simulations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <MockSnapshotBanner />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
