import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavTabs } from "@/components/NavTabs";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATC.ai — The De-Risking Layer",
  description:
    "Productized access to WWT's Advanced Technology Center: PoC engagements, lab operations, and the intelligence layer built on 6,000+ adjudicated engagements.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}>
        <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">
                ATC<span className="text-accent">.ai</span>
              </span>
              <span className="hidden text-xs text-muted sm:inline">the de-risking layer</span>
            </Link>
            <NavTabs />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="border-t border-line py-6">
          <div className="mx-auto max-w-6xl px-5 text-xs text-muted">
            ATC.ai — productization layer over POCDOC · TestRunner · AMS · Atom. Demo environment:
            execution, adjudication, and corpus data are simulated behind the real system contracts.
          </div>
        </footer>
      </body>
    </html>
  );
}
