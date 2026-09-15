"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Polls the server while an engagement is in an active state so status advances live.
// In production this becomes a subscription to TestRunner run events.
export function AutoRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(t);
  }, [router, intervalMs]);
  return null;
}
