import type { Metadata } from "next";
import { Marketplace } from "@/components/Marketplace";
import { PRICING_MODELS, PRODUCT_LINES } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Marketplace — ATC.ai",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ line?: string; pricing?: string }>;
}) {
  const sp = await searchParams;
  const initialLines = PRODUCT_LINES.filter((l) => l === sp.line);
  const initialPricing = PRICING_MODELS.filter((p) => p === sp.pricing);
  return <Marketplace initialLines={initialLines} initialPricing={initialPricing} />;
}
