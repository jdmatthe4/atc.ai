import { getDb } from "@/lib/db";
import { toggleIntelligence } from "@/app/actions";
import type { OutcomeRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

function aggregate(records: OutcomeRecord[]) {
  const n = records.length;
  const pass = records.filter((r) => r.outcome === "pass").length;
  const fail = records.filter((r) => r.outcome === "fail").length;
  const avgScore = n ? Math.round(records.reduce((s, r) => s + r.performanceScore, 0) / n) : 0;
  const failureModes = new Map<string, number>();
  for (const r of records) {
    if (r.failureMode) failureModes.set(r.failureMode, (failureModes.get(r.failureMode) ?? 0) + 1);
  }
  const topFailures = [...failureModes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return { n, passRate: n ? pass / n : 0, failRate: n ? fail / n : 0, avgScore, topFailures };
}

function OemCard({ oem, records }: { oem: string; records: OutcomeRecord[] }) {
  const a = aggregate(records);
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{oem}</div>
        <span className="text-xs text-muted">{a.n} adjudicated tests</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-pass">{Math.round(a.passRate * 100)}%</div>
          <div className="text-xs text-muted">verified pass rate</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{a.avgScore}</div>
          <div className="text-xs text-muted">avg. performance score</div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-panel2">
        <div className="h-full bg-pass" style={{ width: `${a.passRate * 100}%` }} />
      </div>
      {a.topFailures.length > 0 && (
        <div className="mt-4 text-xs text-muted">
          <div className="mb-1 font-semibold uppercase tracking-wide">Most common failure modes</div>
          <ul className="space-y-1">
            {a.topFailures.map(([mode, count]) => (
              <li key={mode}>
                · {mode} <span className="text-muted/70">({count}×)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default async function IntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; a?: string; b?: string }>;
}) {
  const db = getDb();
  const sp = await searchParams;
  const outcomes = db.outcomes;

  const domains = [...new Set(outcomes.map((o) => o.domain))];
  const domain = sp.domain && domains.includes(sp.domain) ? sp.domain : domains[0];
  const oemsInDomain = [...new Set(outcomes.filter((o) => o.domain === domain).map((o) => o.oem))];
  const a = sp.a && oemsInDomain.includes(sp.a) ? sp.a : oemsInDomain[0];
  const b = sp.b && oemsInDomain.includes(sp.b) && sp.b !== a ? sp.b : oemsInDomain.find((o) => o !== a)!;

  const recA = outcomes.filter((o) => o.domain === domain && o.oem === a);
  const recB = outcomes.filter((o) => o.domain === domain && o.oem === b);

  const workloads = [...new Set([...recA, ...recB].map((r) => r.workload))];
  const byWorkload = workloads.map((w) => ({
    workload: w,
    a: aggregate(recA.filter((r) => r.workload === w)),
    b: aggregate(recB.filter((r) => r.workload === w)),
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">ATC Intelligence</p>
        <h1 className="text-2xl font-bold tracking-tight">
          What actually held up — across {outcomes.length.toLocaleString()} adjudicated tests
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Aggregated, anonymized outcomes from a decade of multi-vendor lab engagements. Not analyst opinion,
          not vendor datasheets — adjudicated evidence from identical-topology testing.
        </p>
      </div>

      {!db.intelligenceUnlocked ? (
        <div className="rounded-xl border border-line bg-panel p-10 text-center">
          <div className="text-lg font-semibold">Subscription required</div>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            ATC Intelligence is the paid layer over the outcome corpus: head-to-head pass rates, performance
            scores, and observed failure modes by domain and workload. Sold to enterprise buyers, integrators,
            and OEMs.
          </p>
          <form action={toggleIntelligence} className="mt-6">
            <button className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Activate subscription (demo)
            </button>
          </form>
        </div>
      ) : (
        <>
          <form className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-panel p-4 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Domain</span>
              <select
                name="domain"
                defaultValue={domain}
                className="rounded-lg border border-line bg-panel2 px-3 py-2 outline-none"
              >
                {domains.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Candidate A</span>
              <select name="a" defaultValue={a} className="rounded-lg border border-line bg-panel2 px-3 py-2 outline-none">
                {oemsInDomain.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Candidate B</span>
              <select name="b" defaultValue={b} className="rounded-lg border border-line bg-panel2 px-3 py-2 outline-none">
                {oemsInDomain.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <button className="rounded-lg bg-info/20 px-4 py-2 font-semibold text-info hover:bg-info/30">
              Compare
            </button>
          </form>
          <form action={toggleIntelligence} className="-mt-6 text-right">
            <button className="text-xs text-muted hover:underline">Deactivate subscription (demo)</button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            <OemCard oem={a} records={recA} />
            <OemCard oem={b} records={recB} />
          </div>

          <section>
            <h2 className="text-lg font-semibold">By workload — {domain}</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-panel text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Workload</th>
                    <th className="px-4 py-3 font-medium">{a} pass rate</th>
                    <th className="px-4 py-3 font-medium">{b} pass rate</th>
                    <th className="px-4 py-3 font-medium">Evidence base</th>
                    <th className="px-4 py-3 font-medium">Edge</th>
                  </tr>
                </thead>
                <tbody>
                  {byWorkload.map((row) => {
                    const edge =
                      Math.abs(row.a.passRate - row.b.passRate) < 0.04
                        ? "Statistical tie"
                        : row.a.passRate > row.b.passRate
                        ? a
                        : b;
                    return (
                      <tr key={row.workload} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">{row.workload}</td>
                        <td className="px-4 py-3">{Math.round(row.a.passRate * 100)}%</td>
                        <td className="px-4 py-3">{Math.round(row.b.passRate * 100)}%</td>
                        <td className="px-4 py-3 text-muted">{row.a.n + row.b.n} tests</td>
                        <td className={`px-4 py-3 font-medium ${edge === "Statistical tie" ? "text-muted" : "text-pass"}`}>
                          {edge}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              Aggregates are anonymized across engagements; single-engagement results are never exposed. Demo
              corpus is synthetic — production draws from the POCDOC verdict store.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
