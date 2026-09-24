"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DOMAIN_FILTERS,
  LISTINGS,
  PRICING_MODELS,
  PRODUCT_LINES,
  type Listing,
} from "@/lib/catalog";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-warn" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  counts,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: Set<string>;
  counts: Map<string, number>;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="border-b border-line pb-4">
      <div className="mb-2 text-xs font-bold text-muted">{title}</div>
      <ul className="space-y-1.5">
        {options.map((o) => (
          <li key={o}>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/90 hover:text-ink">
              <input
                type="checkbox"
                checked={selected.has(o)}
                onChange={() => onToggle(o)}
                className="h-3.5 w-3.5 accent-[var(--color-accent)]"
              />
              <span className="flex-1">{o}</span>
              <span className="text-xs text-muted">({counts.get(o) ?? 0})</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListingRow({ l }: { l: Listing }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line p-4 last:border-0 hover:bg-panel2/60 sm:flex-row">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-lg font-bold text-white ${l.tileClass}`}
      >
        {l.tile}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={l.href} className="font-semibold text-info hover:underline">
            {l.name}
          </Link>
          {l.badge && (
            <span className="rounded bg-warn/15 px-1.5 py-0.5 text-[11px] font-semibold text-warn">
              {l.badge}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span>By World Wide Technology · ATC</span>
          <span className="text-line">|</span>
          <Stars rating={l.rating} />
          <span>
            {l.rating.toFixed(1)} ({l.reviews.toLocaleString()})
          </span>
          <span className="text-line">|</span>
          <span>{l.line}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{l.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {l.oems.map((o) => (
            <span key={o} className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-muted">
              {o}
            </span>
          ))}
          {l.domains
            .filter((d) => d !== "Cross-domain")
            .map((d) => (
              <span key={d} className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-muted">
                {d}
              </span>
            ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-1 sm:w-44 sm:flex-col sm:items-end sm:justify-center sm:text-right">
        <div>
          <div className="text-lg font-bold">{l.priceLine}</div>
          <div className="text-[11px] text-muted">{l.priceUnit}</div>
          <div className="mt-0.5 text-[11px] text-muted">{l.pricingModel}</div>
        </div>
        <Link
          href={l.href}
          className="mt-0 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 sm:mt-2"
        >
          {l.cta}
        </Link>
      </div>
    </div>
  );
}

export function Marketplace({
  initialLines = [],
  initialPricing = [],
}: {
  initialLines?: string[];
  initialPricing?: string[];
}) {
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Set<string>>(new Set(initialLines));
  const [domains, setDomains] = useState<Set<string>>(new Set());
  const [pricing, setPricing] = useState<Set<string>>(new Set(initialPricing));
  const [sort, setSort] = useState<SortKey>("featured");

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = LISTINGS.filter((l) => {
      if (lines.size && !lines.has(l.line)) return false;
      if (domains.size && !l.domains.some((d) => domains.has(d))) return false;
      if (pricing.size && !pricing.has(l.pricingModel)) return false;
      if (q) {
        const hay = `${l.name} ${l.description} ${l.line} ${l.domains.join(" ")} ${l.oems.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "price-asc") r = [...r].sort((a, b) => a.priceValue - b.priceValue);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.priceValue - a.priceValue);
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    return r;
  }, [query, lines, domains, pricing, sort]);

  const countBy = (fn: (l: Listing) => string[]) => {
    const m = new Map<string, number>();
    for (const l of LISTINGS) for (const k of fn(l)) m.set(k, (m.get(k) ?? 0) + 1);
    return m;
  };
  const lineCounts = useMemo(() => countBy((l) => [l.line]), []);
  const domainCounts = useMemo(() => countBy((l) => l.domains), []);
  const pricingCounts = useMemo(() => countBy((l) => [l.pricingModel]), []);

  const activeFilters = lines.size + domains.size + pricing.size;

  return (
    <div>
      {/* Search band */}
      <div className="rounded-xl border border-line bg-panel p-5">
        <h1 className="text-xl font-bold tracking-tight text-accent">ATC Portal Marketplace</h1>
        <p className="mt-0.5 text-sm text-muted">
          Buy proving-ground capacity, PoC engagements, and decision intelligence — 600+ capabilities, 200+
          OEMs, no services engagement required.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search products (e.g. "zero trust", "LLM inference", "EVPN", "ransomware")'
            className="w-full rounded-lg border border-line bg-bg px-4 py-2.5 text-sm outline-none placeholder:text-muted/60 focus:border-info"
          />
          <Link
            href="/request/new"
            className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Custom PoC
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Filter rail */}
        <aside className="w-full shrink-0 lg:w-60">
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold">Refine results</span>
              {activeFilters > 0 && (
                <button
                  onClick={() => {
                    setLines(new Set());
                    setDomains(new Set());
                    setPricing(new Set());
                  }}
                  className="text-xs text-info hover:underline"
                >
                  Clear all ({activeFilters})
                </button>
              )}
            </div>
            <div className="space-y-4">
              <FilterGroup
                title="Product line"
                options={PRODUCT_LINES}
                selected={lines}
                counts={lineCounts}
                onToggle={toggle(lines, setLines)}
              />
              <FilterGroup
                title="Technology domain"
                options={DOMAIN_FILTERS}
                selected={domains}
                counts={domainCounts}
                onToggle={toggle(domains, setDomains)}
              />
              <div className="[&>div]:border-0 [&>div]:pb-0">
                <FilterGroup
                  title="Pricing model"
                  options={PRICING_MODELS}
                  selected={pricing}
                  counts={pricingCounts}
                  onToggle={toggle(pricing, setPricing)}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted">
              <span className="font-semibold text-ink">{results.length}</span> result
              {results.length === 1 ? "" : "s"}
              {query.trim() && (
                <>
                  {" "}
                  for <span className="font-medium text-ink">&quot;{query.trim()}&quot;</span>
                </>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg border border-line bg-panel px-2.5 py-1.5 text-sm text-ink outline-none"
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="mt-3 rounded-xl border border-line bg-panel">
            {results.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted">
                No products match. Clear filters, or{" "}
                <Link href="/request/new" className="text-info hover:underline">
                  scope a custom PoC
                </Link>{" "}
                — the drafting agent can build a plan for anything on the floor.
              </div>
            ) : (
              results.map((l) => <ListingRow key={l.id} l={l} />)
            )}
          </div>

          <p className="mt-3 text-xs text-muted">
            All engagements execute on Advanced Technology Center infrastructure with POCDOC-conformant plans
            and engineer-signed verdicts. Ratings shown are illustrative demo data.
          </p>
        </div>
      </div>
    </div>
  );
}
