import Link from "next/link";
import { getDb } from "@/lib/db";
import { syncAll } from "@/lib/engine";
import { money, when } from "@/lib/format";
import { SAMPLE_ORDERS, type SampleOrder } from "@/lib/orders";
import { StatusBadge } from "@/components/badges";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

function OrderStatusChip({ status }: { status: SampleOrder["status"] }) {
  const cls =
    status === "Running"
      ? "bg-warn/15 text-warn"
      : status === "Scheduled"
      ? "bg-info/15 text-info"
      : status === "Delivered"
      ? "bg-muted/15 text-muted"
      : "bg-pass/15 text-pass";
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status === "Running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {status}
    </span>
  );
}

export default function EngagementsPage() {
  syncAll();
  const engagements = getDb().engagements;
  const anyActive = engagements.some((e) =>
    ["provisioning", "running", "adjudicating"].includes(e.status)
  );

  return (
    <div className="space-y-10">
      {anyActive && <AutoRefresh />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-accent">Engagements</h1>
        <Link
          href="/request/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New PoC request
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold">PoC engagements</h2>
        {engagements.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-line p-10 text-center text-muted">
            No PoC engagements yet.{" "}
            <Link href="/request/new" className="text-accent hover:underline">
              Start your first PoC request
            </Link>{" "}
            — the agent will draft a full test plan from a plain-language requirement.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Engagement</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Domains</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {engagements.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0 hover:bg-panel">
                    <td className="px-4 py-3">
                      <Link href={`/engagements/${e.id}`} className="font-mono text-xs text-info hover:underline">
                        {e.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{e.org}</td>
                    <td className="px-4 py-3 text-muted">{e.plan.domains.join(", ")}</td>
                    <td className="px-4 py-3 text-muted">{e.tier.name}</td>
                    <td className="px-4 py-3">{money(e.tier.price)}</td>
                    <td className="px-4 py-3 text-muted">{when(e.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Marketplace orders</h2>
          <span className="text-xs text-muted">
            Lab Hosting engagements live in the{" "}
            <Link href="/ops" className="text-info hover:underline">
              Hosted Lab
            </Link>{" "}
            tab
          </span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ORDERS.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-panel">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{o.id}</td>
                  <td className="px-4 py-3">{o.org}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.product}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      <Link
                        href={`/marketplace?line=${encodeURIComponent(o.line)}`}
                        className="text-info hover:underline"
                      >
                        {o.line}
                      </Link>{" "}
                      · {o.details}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{o.priceLine}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{o.created}</td>
                  <td className="px-4 py-3">
                    <OrderStatusChip status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Sample orders shown for demonstration — in production this table reads from the commerce and
          entitlement systems of record.
        </p>
      </section>
    </div>
  );
}
