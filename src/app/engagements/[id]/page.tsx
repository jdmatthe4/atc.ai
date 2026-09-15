import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { syncEngagement } from "@/lib/engine";
import { money, when } from "@/lib/format";
import { approvePlan, declinePlan } from "@/app/actions";
import { StatusBadge, VerdictBadge } from "@/components/badges";
import { AutoRefresh } from "@/components/AutoRefresh";
import type { TestCase } from "@/lib/types";

export const dynamic = "force-dynamic";

function CaseRow({ tc, showProgress }: { tc: TestCase; showProgress: boolean }) {
  const verdict = tc.finalVerdict ?? tc.proposedVerdict;
  return (
    <div className="rounded-lg border border-line bg-panel2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium">
          <span className="mr-2 font-mono text-xs text-muted">{tc.code}</span>
          {tc.title}
        </div>
        <div className="flex items-center gap-2">
          {showProgress && tc.status === "running" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-warn">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warn" /> executing
            </span>
          )}
          {showProgress && tc.status === "pending" && <span className="text-xs text-muted">queued</span>}
          {verdict && tc.status === "complete" && (
            <VerdictBadge outcome={verdict.outcome} proposed={!tc.finalVerdict} />
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{tc.objective}</p>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-medium text-info hover:underline">
          Steps, expected result &amp; task list
        </summary>
        <div className="mt-3 space-y-3">
          <ol className="list-decimal space-y-1 pl-5 text-muted">
            {tc.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Expected: </span>
            {tc.expected}
          </p>
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line bg-panel text-left text-muted">
                  <th className="px-3 py-2 font-medium">Task</th>
                  <th className="px-3 py-2 font-medium">Service type</th>
                  <th className="px-3 py-2 font-medium">Target</th>
                  <th className="px-3 py-2 font-medium">Validators</th>
                </tr>
              </thead>
              <tbody>
                {tc.taskList.tasks.map((t) => (
                  <tr key={t.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2 font-mono text-info">{t.serviceType}</td>
                    <td className="px-3 py-2 font-mono text-muted">{t.target}</td>
                    <td className="px-3 py-2 text-muted">{t.validators.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
      {verdict && tc.status === "complete" && (
        <div className="mt-3 rounded-md border border-line bg-panel p-3 text-sm">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {tc.finalVerdict
              ? `Verdict — approved by ${tc.finalVerdict.approvedBy}`
              : "Verdict proposed by Atom adjudicator — pending engineer approval"}
          </div>
          <p className="text-muted">{verdict.rationale}</p>
          <ul className="mt-2 space-y-1">
            {verdict.evidence.map((ev, i) => (
              <li key={i} className="text-xs text-muted">
                <span className="mr-1.5 rounded bg-panel2 px-1.5 py-0.5 font-mono text-info">{ev.type}</span>
                <span className="font-medium text-ink">{ev.label}:</span> {ev.excerpt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default async function EngagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = getDb().engagements.find((x) => x.id === id);
  if (!e) notFound();
  syncEngagement(e);

  const cases = e.plan.sections.flatMap((s) => s.cases);
  const done = cases.filter((c) => c.status === "complete").length;
  const active = ["provisioning", "running", "adjudicating"].includes(e.status);
  const showProgress = e.status !== "draft" && e.status !== "declined";

  return (
    <div className="space-y-8">
      {active && <AutoRefresh />}

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{e.plan.title}</h1>
          <StatusBadge status={e.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          <span className="font-mono text-xs">{e.id}</span> · {e.org} · created {when(e.createdAt)}
        </p>
      </div>

      {e.status === "draft" && (
        <div className="rounded-xl border border-info/40 bg-info/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Review and approve to schedule this PoC</div>
              <p className="mt-1 text-sm text-muted">
                {e.tier.name} tier · {money(e.tier.price)} flat · {e.tier.durationWeeks} weeks · {cases.length}{" "}
                test cases on dedicated ATC infrastructure. Nothing runs until you approve.
              </p>
            </div>
            <div className="flex gap-2">
              <form action={approvePlan.bind(null, e.id)}>
                <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                  Approve scope — {money(e.tier.price)}
                </button>
              </form>
              <form action={declinePlan.bind(null, e.id)}>
                <button className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-panel2">
                  Decline
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {e.status === "delivered" && (
        <div className="rounded-xl border border-pass/40 bg-pass/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Report delivered</div>
              <p className="mt-1 text-sm text-muted">
                All verdicts approved and signed {when(e.deliveredAt)}. Raw evidence artifacts are included.
              </p>
            </div>
            <Link
              href={`/engagements/${e.id}/report`}
              className="rounded-lg bg-pass px-4 py-2 text-sm font-semibold text-bg hover:opacity-90"
            >
              View signed report
            </Link>
          </div>
        </div>
      )}

      {e.status === "adjudicating" && (
        <div className="rounded-xl border border-warn/40 bg-warn/10 p-5 text-sm">
          <span className="font-semibold">Execution complete.</span>{" "}
          <span className="text-muted">
            The Atom adjudicator has proposed a verdict for every case. An ATC engineer reviews and approves
            each one in the <Link href="/ops?tab=projects" className="text-info hover:underline">Hosted Lab review queue</Link> before
            the signed report is released.
          </span>
        </div>
      )}

      {showProgress && (
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Execution progress</span>
            <span className="text-muted">
              {e.status === "provisioning" ? "Provisioning lab environment…" : `${done}/${cases.length} cases complete`}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel2">
            <div
              className="h-full rounded-full bg-info transition-all duration-700"
              style={{ width: `${e.status === "provisioning" ? 4 : Math.max(6, (done / cases.length) * 100)}%` }}
            />
          </div>
          {e.assetTags.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              Reserved AMS assets: <span className="font-mono">{e.assetTags.join(", ")}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {e.plan.sections.map((s, i) => (
            <section key={s.id}>
              <h2 className="text-lg font-semibold">
                <span className="mr-2 font-mono text-sm text-muted">{i + 1}.</span>
                {s.title}
              </h2>
              <p className="mt-1 text-sm text-muted">{s.intent}</p>
              <div className="mt-3 space-y-3">
                {s.cases.map((tc) => (
                  <CaseRow key={tc.id} tc={tc} showProgress={showProgress} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-5 text-sm">
            <div className="font-semibold">Scope summary</div>
            <p className="mt-2 text-muted">{e.plan.summary}</p>
          </div>
          <div className="rounded-xl border border-line bg-panel p-5 text-sm">
            <div className="font-semibold">Candidates</div>
            <ul className="mt-2 space-y-1 text-muted">
              {e.plan.oems.map((o) => (
                <li key={o}>· {o}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-panel p-5 text-sm">
            <div className="font-semibold">Lab environment</div>
            <ul className="mt-2 space-y-1.5 text-muted">
              {e.plan.environment.map((env) => (
                <li key={env}>· {env}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-panel p-5 text-sm">
            <div className="font-semibold">Success criteria</div>
            <ul className="mt-2 space-y-1.5 text-muted">
              {e.plan.successCriteria.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
