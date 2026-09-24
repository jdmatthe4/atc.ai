import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { syncEngagement } from "@/lib/engine";
import { when } from "@/lib/format";
import { VerdictBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = getDb().engagements.find((x) => x.id === id);
  if (!e) notFound();
  syncEngagement(e);
  if (e.status !== "delivered") {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-panel p-8 text-center">
        <p className="text-muted">
          The report for <span className="font-mono text-xs">{e.id}</span> hasn&apos;t been released yet —
          verdicts are still pending engineer approval.
        </p>
        <Link href={`/engagements/${e.id}`} className="mt-3 inline-block text-sm text-info hover:underline">
          Back to engagement status →
        </Link>
      </div>
    );
  }

  const cases = e.plan.sections.flatMap((s) => s.cases);
  const tally = {
    pass: cases.filter((c) => c.finalVerdict?.outcome === "pass").length,
    fail: cases.filter((c) => c.finalVerdict?.outcome === "fail").length,
    inconclusive: cases.filter((c) => c.finalVerdict?.outcome === "inconclusive").length,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-xl border border-line bg-panel p-8">
        <p className="text-xs font-semibold text-accent">
          Signed, vendor-neutral PoC report
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-accent">{e.plan.title}</h1>
        <p className="mt-2 text-sm text-muted">
          Prepared for {e.org} · engagement <span className="font-mono text-xs">{e.id}</span> · delivered{" "}
          {when(e.deliveredAt)}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line text-center">
          <div className="bg-panel2 p-4">
            <div className="text-2xl font-bold text-pass">{tally.pass}</div>
            <div className="text-xs text-muted">passed</div>
          </div>
          <div className="bg-panel2 p-4">
            <div className="text-2xl font-bold text-red">{tally.fail}</div>
            <div className="text-xs text-muted">failed</div>
          </div>
          <div className="bg-panel2 p-4">
            <div className="text-2xl font-bold text-warn">{tally.inconclusive}</div>
            <div className="text-xs text-muted">inconclusive</div>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">{e.plan.summary}</p>
      </div>

      {e.plan.sections.map((s, i) => (
        <section key={s.id} className="rounded-xl border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold">
            {i + 1}. {s.title}
          </h2>
          <div className="mt-4 space-y-4">
            {s.cases.map((tc) => (
              <div key={tc.id} className="rounded-lg border border-line bg-panel2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">
                    <span className="mr-2 font-mono text-xs text-muted">{tc.code}</span>
                    {tc.title}
                  </div>
                  {tc.finalVerdict && <VerdictBadge outcome={tc.finalVerdict.outcome} />}
                </div>
                <p className="mt-2 text-sm text-muted">{tc.finalVerdict?.rationale}</p>
                <div className="mt-3 text-xs text-muted">
                  <div className="mb-1 font-semibold">Cited evidence</div>
                  <ul className="space-y-1">
                    {tc.finalVerdict?.evidence.map((ev, j) => (
                      <li key={j}>
                        <span className="mr-1.5 rounded bg-panel px-1.5 py-0.5 font-mono text-info">{ev.type}</span>
                        <span className="font-medium text-ink">{ev.label}:</span> {ev.excerpt}
                      </li>
                    ))}
                  </ul>
                </div>
                {tc.finalVerdict?.overridden && (
                  <p className="mt-2 text-xs text-warn">
                    Engineer override: verdict set by human review, superseding the AI proposal.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-xl border border-line bg-panel p-6 text-sm">
        <div className="font-semibold">Attestation</div>
        <p className="mt-2 text-muted">
          Every verdict in this report was proposed from captured evidence and individually approved by an ATC
          engineer. Testing was executed on dedicated Advanced Technology Center infrastructure with identical
          topology, load, and failure scenarios per candidate. Raw evidence artifacts (CLI transcripts,
          telemetry exports, log bundles, screen captures) accompany this report.
        </p>
        <p className="mt-4 font-medium">{e.signedBy ?? "ATC Lab Ops — World Wide Technology"}</p>
        <p className="text-xs text-muted">Delivered {when(e.deliveredAt)}</p>
      </div>
    </div>
  );
}
