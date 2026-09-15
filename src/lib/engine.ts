// Execution + adjudication engine (CLAUDE.md §4: "Test execution" and "Adjudication").
//
// Once a customer approves a plan, the engagement advances on a wall-clock schedule:
// provisioning → each case runs in sequence → AI-proposed verdicts → human sign-off →
// delivered. State is synced lazily on read (no background workers), which keeps the
// simulation deterministic and makes this module a drop-in seam for real TestRunner
// run polling later.

import type {
  Engagement,
  EvidenceRef,
  TestCase,
  Verdict,
  VerdictOutcome,
} from "./types";
import { getDb, persist } from "./db";

const PROVISION_MS = 25_000;
const CASE_MS = 18_000;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function outcomeFor(tc: TestCase): VerdictOutcome {
  const r = (hash(tc.id) % 1000) / 1000;
  return r < 0.78 ? "pass" : r < 0.92 ? "fail" : "inconclusive";
}

const EVIDENCE_BY_TYPE: Record<string, (tc: TestCase, pass: boolean) => EvidenceRef[]> = {
  ssh_command: (tc, pass) => [
    {
      type: "cli",
      label: "Command output capture",
      excerpt: pass
        ? "$ (validator) all rows matched baseline — 0 deviations across target group"
        : "$ (validator) 2/8 targets failed match: driver_version 550.14 != baseline 550.42",
    },
    { type: "log", label: "Session transcript", excerpt: `ssh session recorded for ${tc.taskList.tasks[0]?.target ?? "target"} — full transcript attached` },
  ],
  rest_api: (_tc, pass) => [
    {
      type: "log",
      label: "API response archive",
      excerpt: pass
        ? "200 OK — response payload validated against schema; propagation observed in 3.2s (SLO 10s)"
        : "200 OK on push, but propagation observed at 41s (SLO 10s) — validator failed",
    },
  ],
  traffic_profile: (_tc, pass) => [
    {
      type: "metric",
      label: "Load-run telemetry summary",
      excerpt: pass
        ? "30m sustained: p99 within SLO for all steps; error rate 0.02%; no drops at contracted load"
        : "Performance cliff at 82% offered load: p99 breached SLO by 2.4x; throughput plateaued below target",
    },
    { type: "metric", label: "Full time-series export", excerpt: "Per-second telemetry CSV + Grafana snapshot attached" },
  ],
  monitoring: (_tc, pass) => [
    {
      type: "metric",
      label: "Collector verification",
      excerpt: pass
        ? "No telemetry gaps > 1s across the fault window; all counters reconciled"
        : "Telemetry gap of 14s during failover window — insufficient to adjudicate the recovery claim",
    },
  ],
  console_command: (_tc, pass) => [
    {
      type: "log",
      label: "OOB console capture",
      excerpt: pass
        ? "Failure sequence executed; recovery within threshold on every event; console log attached"
        : "leaf_fail event: traffic loss window 3,840ms exceeded 1,000ms threshold",
    },
  ],
  log_collection: (_tc, pass) => [
    {
      type: "log",
      label: "Collected log bundle",
      excerpt: pass
        ? "Fault-window logs collected from all nodes; recovery clean, no unhandled exceptions"
        : "Scheduler log shows re-shard stalled: 'waiting for kv-cache migration' repeated 214x",
    },
  ],
  playwright: (_tc, pass) => [
    {
      type: "screenshot",
      label: "UI walkthrough capture",
      excerpt: pass
        ? "Fault event located in dashboard with correct timestamp; incident export succeeded (screens attached)"
        : "Fault event missing from dashboard timeline; export produced empty incident report",
    },
  ],
};

function proposeVerdict(tc: TestCase): Verdict {
  const outcome = outcomeFor(tc);
  const pass = outcome === "pass";
  const seen = new Set<string>();
  const evidence = tc.taskList.tasks
    .flatMap((t) => (EVIDENCE_BY_TYPE[t.serviceType] ?? EVIDENCE_BY_TYPE.ssh_command)(tc, pass))
    .filter((ev) => {
      const key = ev.label + ev.excerpt;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const rationale =
    outcome === "pass"
      ? `All ${tc.taskList.tasks.length} task(s) met their validators. Observed behavior matches the expected result: "${tc.expected}"`
      : outcome === "fail"
      ? `Validator breach on at least one task. Observed behavior deviates from the expected result; see cited evidence for the specific threshold missed.`
      : `Captured telemetry is incomplete for the claim under test; recommending re-run with extended collection rather than a pass/fail call.`;
  return {
    outcome,
    confidence: outcome === "inconclusive" ? 0.55 : 0.84 + ((hash(tc.id + "c") % 14) / 100),
    rationale,
    evidence,
    proposedBy: "atom-adjudicator",
  };
}

export function syncEngagement(e: Engagement): Engagement {
  if (!e.approvedAt || e.status === "delivered" || e.status === "draft" || e.status === "declined") {
    return e;
  }
  const now = Date.now();
  const elapsed = now - e.approvedAt;
  let changed = false;

  if (elapsed < PROVISION_MS) {
    if (e.status !== "provisioning") {
      e.status = "provisioning";
      changed = true;
    }
  } else {
    const cases = e.plan.sections.flatMap((s) => s.cases);
    let offset = PROVISION_MS;
    let allComplete = true;
    for (const tc of cases) {
      const start = e.approvedAt + offset;
      const end = start + CASE_MS;
      offset += CASE_MS;
      if (now >= end) {
        if (tc.status !== "complete") {
          tc.status = "complete";
          tc.startedAt = start;
          tc.completedAt = end;
          tc.proposedVerdict = proposeVerdict(tc);
          changed = true;
        }
      } else if (now >= start) {
        if (tc.status !== "running") {
          tc.status = "running";
          tc.startedAt = start;
          changed = true;
        }
        allComplete = false;
      } else {
        allComplete = false;
      }
    }
    const allApproved = cases.every((c) => c.finalVerdict);
    const next: Engagement["status"] = allApproved
      ? "delivered"
      : allComplete
      ? "adjudicating"
      : "running";
    if (e.status !== next) {
      e.status = next;
      if (next === "delivered") e.deliveredAt = now;
      changed = true;
    }
  }

  if (changed) persist();
  return e;
}

export function syncAll(): void {
  for (const e of getDb().engagements) syncEngagement(e);
}
