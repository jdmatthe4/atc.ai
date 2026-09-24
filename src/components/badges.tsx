import type { EngagementStatus, VerdictOutcome } from "@/lib/types";

const STATUS_STYLES: Record<EngagementStatus, { label: string; cls: string }> = {
  draft: { label: "Awaiting approval", cls: "bg-info/15 text-info" },
  declined: { label: "Declined", cls: "bg-muted/15 text-muted" },
  provisioning: { label: "Provisioning lab", cls: "bg-warn/15 text-warn" },
  running: { label: "Running", cls: "bg-warn/15 text-warn" },
  adjudicating: { label: "Adjudicating", cls: "bg-info/15 text-info" },
  delivered: { label: "Delivered", cls: "bg-pass/15 text-pass" },
};

export function StatusBadge({ status }: { status: EngagementStatus }) {
  const s = STATUS_STYLES[status];
  const active = status === "provisioning" || status === "running";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {s.label}
    </span>
  );
}

const VERDICT_STYLES: Record<VerdictOutcome, string> = {
  pass: "bg-pass/15 text-pass",
  fail: "bg-red/15 text-red",
  inconclusive: "bg-warn/15 text-warn",
};

export function VerdictBadge({ outcome, proposed }: { outcome: VerdictOutcome; proposed?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICT_STYLES[outcome]}`}>
      {proposed ? `${outcome} (proposed)` : outcome}
    </span>
  );
}
