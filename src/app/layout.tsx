import type { Metadata } from "next";
import Link from "next/link";
import { NavTabs } from "@/components/NavTabs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATC Portal — The De-Risking Layer",
  description:
    "Productized access to WWT's Advanced Technology Center: PoC engagements, lab operations, and the intelligence layer built on 6,000+ adjudicated engagements.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/wwt-logo.png" alt="World Wide Technology" className="h-8 w-auto" />
              <span className="h-6 w-px bg-line" aria-hidden />
              <span className="text-lg font-bold tracking-tight">
                ATC<span className="text-accent"> Portal</span>
              </span>
            </Link>
            <NavTabs />
          </div>
          {/* WWT gradient rule — signature brand element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wwt-gradient-rule.png" alt="" className="h-[3px] w-full object-fill" />
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="mt-12 bg-navy py-10 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/wwt-logo-white.png" alt="World Wide Technology" className="h-8 w-auto" />
              <p className="mt-4 text-sm font-semibold">Make a new world happen.</p>
              <a
                href="https://www.wwt.com"
                className="mt-1 inline-block text-sm text-white/70 hover:text-white hover:underline"
              >
                wwt.com
              </a>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-white/60">
              ATC Portal — productization layer over POCDOC · TestRunner · AMS · Atom. Demo environment:
              execution, adjudication, and corpus data are simulated behind the real system contracts.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
