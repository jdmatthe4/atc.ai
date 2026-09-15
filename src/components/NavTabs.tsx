"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/request/new", label: "Start a PoC" },
  { href: "/engagements", label: "Engagements" },
  { href: "/ops", label: "Hosted Lab" },
  { href: "/intelligence", label: "Intelligence" },
];

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex items-stretch gap-1 self-stretch text-sm">
      {TABS.map((t) => {
        const active =
          pathname === t.href ||
          (t.href === "/engagements" && pathname.startsWith("/engagements/"));
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center border-b-2 px-3 transition-colors ${
              active
                ? "border-accent font-semibold text-ink"
                : "border-transparent text-muted hover:bg-panel2 hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
