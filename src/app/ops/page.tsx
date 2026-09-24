import Link from "next/link";
import { getDb } from "@/lib/db";
import { syncAll } from "@/lib/engine";
import { money, when } from "@/lib/format";
import { HOSTED_LAB, LAB_MEMBERS, SUPPORT_CASES, type SupportCase } from "@/lib/hostedlab";
import { adjudicateCase, approveAllVerdicts } from "@/app/actions";
import { StatusBadge, VerdictBadge } from "@/components/badges";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "cases", label: "Cases" },
  { key: "assets", label: "Assets" },
  { key: "projects", label: "Lab Projects" },
  { key: "members", label: "Members" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel2 text-[10px] font-bold text-muted">
      {initials}
    </span>
  );
}

function CaseStatusChip({ status }: { status: SupportCase["status"] }) {
  const cls =
    status === "In Progress"
      ? "bg-info/15 text-info"
      : status === "Waiting on Customer"
      ? "bg-warn/15 text-warn"
      : "bg-pass/15 text-pass";
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function CasesTable({ cases }: { cases: SupportCase[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-panel text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Case</th>
            <th className="px-4 py-3 font-medium">Requested by</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-b border-line last:border-0 hover:bg-panel">
              <td className="px-4 py-3">
                <CaseStatusChip status={c.status} />
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-muted">{c.subtitle}</div>
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <Avatar name={c.requestedBy} />
                  {c.requestedBy}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{c.submitted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function HostedLabPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab: TabKey = (TABS.find((t) => t.key === sp.tab)?.key ?? "overview") as TabKey;

  syncAll();
  const db = getDb();
  const assets = db.assets;
  const idle = assets.filter((a) => a.status === "idle");
  const idleCostYr = idle.reduce((s, a) => s + a.monthlyCost, 0) * 12;

  const queue = db.engagements.filter((e) =>
    ["provisioning", "running", "adjudicating"].includes(e.status)
  );
  const reviews = db.engagements
    .filter((e) => e.status === "adjudicating" || e.status === "running")
    .flatMap((e) =>
      e.plan.sections
        .flatMap((s) => s.cases)
        .filter((c) => c.proposedVerdict && !c.finalVerdict && c.status === "complete")
        .map((c) => ({ engagement: e, tc: c }))
    );
  const activeCases = SUPPORT_CASES.filter((c) => c.status !== "Resolved").length;

  const stats: Array<{ key: TabKey; label: string; value: string; icon: string }> = [
    { key: "cases", label: "Active cases", value: String(activeCases), icon: "🗂" },
    { key: "assets", label: "Assets", value: assets.length.toLocaleString(), icon: "🗄" },
    { key: "projects", label: "Lab Projects", value: String(db.engagements.length), icon: "⚖" },
    { key: "members", label: "Members", value: String(LAB_MEMBERS.length + 13), icon: "👥" },
  ];

  const byType = new Map<string, { total: number; idle: number }>();
  for (const a of assets) {
    const t = byType.get(a.type) ?? { total: 0, idle: 0 };
    t.total++;
    if (a.status === "idle") t.idle++;
    byType.set(a.type, t);
  }

  return (
    <div>
      {queue.length > 0 && <AutoRefresh />}

      {/* Breadcrumb + lab header */}
      <div className="text-sm">
        <span className="text-muted">{HOSTED_LAB.breadcrumb}</span>
        <span className="mx-2 text-muted">›</span>
        <span className="font-medium text-info">{HOSTED_LAB.name}</span>
      </div>
      <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-accent">{HOSTED_LAB.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{HOSTED_LAB.description}</p>
        </div>
        <div className="flex h-24 w-48 shrink-0 items-center justify-center rounded-xl border border-line bg-panel">
          <span className="text-center text-sm font-boldst">
            Acme <span className="text-accent">Financial</span>
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-8 flex items-center justify-between border-b border-line">
        <nav className="flex gap-1 text-sm">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/ops?tab=${t.key}`}
              className={`border-b-2 px-3 py-2.5 transition-colors ${
                tab === t.key
                  ? "border-accent font-semibold text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/request/new"
          className="mb-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Request support
        </Link>
      </div>

      {tab === "overview" && (
        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((s) => (
                <Link
                  key={s.key}
                  href={`/ops?tab=${s.key}`}
                  className="rounded-xl border border-line bg-panel p-5 transition-colors hover:border-info"
                >
                  <div className="text-sm text-muted">{s.label}</div>
                  <div className="mt-2 text-4xl font-bold text-info">{s.value}</div>
                </Link>
              ))}
            </div>

            {/* Recent support cases */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Support cases</h2>
                <Link href="/ops?tab=cases" className="text-sm font-semibold text-info hover:underline">
                  View all ›
                </Link>
              </div>
              <CasesTable cases={SUPPORT_CASES.slice(0, 2)} />
            </section>

            {/* Adjudication attention strip */}
            {reviews.length > 0 && (
              <section className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm">
                <span className="font-semibold">{reviews.length} verdict(s) awaiting engineer review</span>{" "}
                <span className="text-muted">
                  in active lab projects —{" "}
                  <Link href="/ops?tab=projects" className="text-info hover:underline">
                    open the review queue
                  </Link>
                  .
                </span>
              </section>
            )}
          </div>

          {/* Right rail */}
          <aside className="w-full shrink-0 space-y-4 lg:w-80">
            <div className="rounded-xl border border-line bg-panel">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="font-semibold">Status</span>
                <a href="#" className="text-sm text-info hover:underline">
                  ATC Status Page ↗
                </a>
              </div>
              <div className="flex items-center justify-between px-5 py-4 text-sm">
                <span className="text-muted">All systems</span>
                <span className="rounded-full bg-pass/15 px-2.5 py-0.5 text-xs font-semibold text-pass">
                  {HOSTED_LAB.systemsStatus}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-panel">
              <div className="border-b border-line px-5 py-4 font-semibold">Summary</div>
              <dl className="divide-y divide-line text-sm">
                {[
                  [
                    "State",
                    <span
                      key="state"
                      className="rounded-full bg-pass/15 px-2.5 py-0.5 text-xs font-semibold text-pass"
                    >
                      {HOSTED_LAB.state}
                    </span>,
                  ],
                  ["Account", HOSTED_LAB.account],
                  [
                    "Program",
                    <a key="pgm" href="#" className="text-info hover:underline">
                      {HOSTED_LAB.program} ↗
                    </a>,
                  ],
                  ["Start date", HOSTED_LAB.startDate],
                  ["End date", HOSTED_LAB.endDate],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex items-center justify-between px-5 py-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      )}

      {tab === "cases" && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Support cases</h2>
          <CasesTable cases={SUPPORT_CASES} />
        </section>
      )}

      {tab === "assets" && (
        <section className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-panel p-5">
              <div className="text-3xl font-bold text-info">{assets.length}</div>
              <div className="mt-1 text-xs text-muted">tracked assets · AMS · STL-DC1/DC2</div>
            </div>
            <div className="rounded-xl border border-line bg-panel p-5">
              <div className="text-3xl font-bold text-warn">{idle.length}</div>
              <div className="mt-1 text-xs text-muted">idle units available for scheduling</div>
            </div>
            <div className="rounded-xl border border-line bg-panel p-5">
              <div className="text-3xl font-bold text-red">{money(idleCostYr)}</div>
              <div className="mt-1 text-xs text-muted">annualized idle-capacity cost</div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Asset class</th>
                  <th className="px-4 py-3 font-medium">Units</th>
                  <th className="px-4 py-3 font-medium">Idle</th>
                  <th className="px-4 py-3 font-medium">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {[...byType.entries()].map(([type, t]) => {
                  const util = 1 - t.idle / t.total;
                  return (
                    <tr key={type} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">{type}</td>
                      <td className="px-4 py-3 text-muted">{t.total}</td>
                      <td className="px-4 py-3 text-muted">{t.idle}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-panel2">
                            <div
                              className={`h-full rounded-full ${util < 0.5 ? "bg-warn" : "bg-pass"}`}
                              style={{ width: `${util * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted">{Math.round(util * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "projects" && (
        <section className="mt-8 space-y-8">
          <div>
            <h2 className="text-lg font-semibold">Active lab projects</h2>
            {queue.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No projects currently executing.{" "}
                <Link href="/engagements" className="text-info hover:underline">
                  View all engagements →
                </Link>
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {queue.map((e) => {
                  const cases = e.plan.sections.flatMap((s) => s.cases);
                  const done = cases.filter((c) => c.status === "complete").length;
                  return (
                    <div
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel p-4 text-sm"
                    >
                      <div>
                        <Link href={`/engagements/${e.id}`} className="font-medium text-info hover:underline">
                          {e.id}
                        </Link>
                        <span className="ml-2 text-muted">
                          {e.org} · {e.plan.domains.join(", ")} · approved {when(e.approvedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">
                          {done}/{cases.length} cases
                        </span>
                        <StatusBadge status={e.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Adjudication review queue</h2>
            <p className="mt-1 text-sm text-muted">
              Atom proposes each verdict with cited evidence; an engineer approves or overrides before the
              report is signed.
            </p>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No verdicts awaiting review.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {Object.entries(
                  reviews.reduce<Record<string, typeof reviews>>((acc, r) => {
                    (acc[r.engagement.id] ??= []).push(r);
                    return acc;
                  }, {})
                ).map(([engId, items]) => (
                  <div key={engId} className="rounded-xl border border-line bg-panel p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm">
                        <Link href={`/engagements/${engId}`} className="font-medium text-info hover:underline">
                          {engId}
                        </Link>
                        <span className="ml-2 text-muted">{items[0].engagement.org}</span>
                      </div>
                      {items[0].engagement.status === "adjudicating" && (
                        <form action={approveAllVerdicts.bind(null, engId)}>
                          <button className="rounded-lg bg-pass px-3 py-1.5 text-xs font-semibold text-bg hover:opacity-90">
                            Approve all &amp; sign report
                          </button>
                        </form>
                      )}
                    </div>
                    <div className="mt-3 space-y-3">
                      {items.map(({ tc }) => (
                        <div key={tc.id} className="rounded-lg border border-line bg-panel2 p-4 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-medium">
                              <span className="mr-2 font-mono text-xs text-muted">{tc.code}</span>
                              {tc.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <VerdictBadge outcome={tc.proposedVerdict!.outcome} proposed />
                              <span className="text-xs text-muted">
                                {Math.round(tc.proposedVerdict!.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-muted">{tc.proposedVerdict!.rationale}</p>
                          <ul className="mt-2 space-y-1 text-xs text-muted">
                            {tc.proposedVerdict!.evidence.map((ev, i) => (
                              <li key={i}>
                                <span className="mr-1.5 rounded bg-panel px-1.5 py-0.5 font-mono text-info">
                                  {ev.type}
                                </span>
                                <span className="font-medium text-ink">{ev.label}:</span> {ev.excerpt}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <form action={adjudicateCase.bind(null, engId, tc.id, "approve")}>
                              <button className="rounded-lg bg-info/20 px-3 py-1.5 text-xs font-semibold text-info hover:bg-info/30">
                                Approve proposed verdict
                              </button>
                            </form>
                            <form action={adjudicateCase.bind(null, engId, tc.id, "override-pass")}>
                              <button className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:bg-panel">
                                Override → pass
                              </button>
                            </form>
                            <form action={adjudicateCase.bind(null, engId, tc.id, "override-fail")}>
                              <button className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:bg-panel">
                                Override → fail
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "members" && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Lab members</h2>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                </tr>
              </thead>
              <tbody>
                {LAB_MEMBERS.map((m) => (
                  <tr key={m.name} className="border-b border-line last:border-0 hover:bg-panel">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Avatar name={m.name} />
                        <span className="font-medium">{m.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{m.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          m.org === "WWT" ? "bg-red/15 text-red" : "bg-info/15 text-info"
                        }`}
                      >
                        {m.org === "WWT" ? "World Wide Technology" : HOSTED_LAB.account}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Showing {LAB_MEMBERS.length} of {LAB_MEMBERS.length + 13} members with lab access.
          </p>
        </section>
      )}
    </div>
  );
}
