// Core entities — mapped directly to POCDOC / TestRunner / AMS semantics (see CLAUDE.md §7).
// These shapes intentionally mirror the internal systems' contracts so this layer can sit
// in front of them via API rather than replacing them.

export type ServiceType =
  | "ssh_command"
  | "rest_api"
  | "traffic_profile"
  | "monitoring"
  | "console_command"
  | "log_collection"
  | "playwright";

export interface TrTask {
  id: string;
  name: string;
  serviceType: ServiceType;
  target: string; // host/profile the task executes against
  command: string;
  validators: string[]; // TestRunner-style pass/fail validators
}

export interface TaskList {
  id: string;
  name: string;
  tasks: TrTask[];
}

export type VerdictOutcome = "pass" | "fail" | "inconclusive";

export interface EvidenceRef {
  type: "log" | "cli" | "metric" | "screenshot";
  label: string;
  excerpt: string;
}

export interface Verdict {
  outcome: VerdictOutcome;
  confidence: number; // 0..1 — AI-proposed confidence
  rationale: string;
  evidence: EvidenceRef[];
  proposedBy: "atom-adjudicator" | "human";
  approvedBy?: string;
  approvedAt?: number;
  overridden?: boolean;
}

export type CaseStatus = "pending" | "running" | "complete";

export interface TestCase {
  id: string;
  code: string; // POCDOC-style numbering, e.g. "2.1"
  title: string;
  objective: string;
  steps: string[];
  expected: string;
  taskList: TaskList;
  status: CaseStatus;
  startedAt?: number;
  completedAt?: number;
  proposedVerdict?: Verdict; // AI proposal awaiting human approval
  finalVerdict?: Verdict; // human-approved verdict
}

export interface PlanSection {
  id: string;
  title: string;
  intent: string;
  cases: TestCase[];
}

export interface TestPlan {
  id: string;
  title: string;
  summary: string;
  domains: string[];
  oems: string[];
  environment: string[]; // lab environment components to provision
  successCriteria: string[];
  sections: PlanSection[];
}

export interface PricingTier {
  key: "validate" | "compare" | "bakeoff";
  name: string;
  price: number;
  durationWeeks: number;
  description: string;
}

export type EngagementStatus =
  | "draft" // plan drafted, awaiting customer approval
  | "declined"
  | "provisioning"
  | "running"
  | "adjudicating" // AI verdicts proposed, awaiting human sign-off
  | "delivered";

export interface Engagement {
  id: string;
  org: string;
  contactEmail: string;
  requirement: string; // customer's plain-language ask
  tier: PricingTier;
  plan: TestPlan;
  status: EngagementStatus;
  createdAt: number;
  approvedAt?: number;
  deliveredAt?: number;
  assetTags: string[]; // AMS assets reserved for this engagement
  signedBy?: string;
}

// AMS-shaped asset record
export interface Asset {
  tag: string;
  serial: string;
  hostname: string;
  type: string;
  oem: string;
  rack: string;
  location: string;
  org: string;
  status: "allocated" | "idle" | "maintenance";
  monthlyCost: number; // fully-loaded $/month, directional
}

// Anonymized historical outcome — the ATC Intelligence corpus
export interface OutcomeRecord {
  id: string;
  year: number;
  domain: string;
  oem: string;
  workload: string;
  outcome: VerdictOutcome;
  performanceScore: number; // 0..100 composite from adjudicated evidence
  failureMode?: string;
}

export interface Db {
  engagements: Engagement[];
  assets: Asset[];
  outcomes: OutcomeRecord[];
  intelligenceUnlocked: boolean; // demo stand-in for a subscription entitlement
}
