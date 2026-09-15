// The Atom-style drafting agent (CLAUDE.md §4, "PoC authoring").
//
// PlanDrafter is the seam where the production system plugs in Atom / the internal
// atc-pocdoc-author workflow over its MCP contract. This implementation is a
// deterministic stand-in that produces genuinely POCDOC-conformant structure
// (sections → test cases → steps/expected → TestRunner task lists with validators)
// from keyword analysis of the requirement, so the end-to-end product flow is real
// even before the live agent is wired in.

import type {
  PlanSection,
  PricingTier,
  ServiceType,
  TestCase,
  TestPlan,
  TrTask,
} from "./types";

export interface DraftResult {
  plan: TestPlan;
  tier: PricingTier;
}

export interface PlanDrafter {
  draft(requirement: string, org: string): DraftResult;
}

interface DomainTemplate {
  domain: string;
  keywords: string[];
  environment: string[];
  sections: Array<{
    title: string;
    intent: string;
    cases: Array<{
      title: string;
      objective: string;
      steps: string[];
      expected: string;
      tasks: Array<{ name: string; serviceType: ServiceType; target: string; command: string; validators: string[] }>;
    }>;
  }>;
}

const OEM_KEYWORDS: Record<string, string[]> = {
  NVIDIA: ["nvidia", "gpu", "h100", "h200", "b200", "cuda", "dgx"],
  Cisco: ["cisco", "nexus", "catalyst", "aci", "meraki"],
  Dell: ["dell", "poweredge", "powerscale", "powerstore"],
  HPE: ["hpe", "proliant", "aruba", "alletra", "greenlake"],
  NetApp: ["netapp", "ontap"],
  "Pure Storage": ["pure storage", "flasharray", "flashblade"],
  "Palo Alto Networks": ["palo alto", "pan-os", "prisma", "cortex"],
  Fortinet: ["fortinet", "fortigate"],
  F5: ["f5", "big-ip"],
  Arista: ["arista", "eos"],
  Juniper: ["juniper", "junos", "mist"],
  VMware: ["vmware", "vsphere", "vsan", "nsx"],
  Microsoft: ["microsoft", "azure", "hyper-v"],
  AWS: ["aws", "amazon web services", "eks", "outposts"],
  "Google Cloud": ["google cloud", "gcp", "gke"],
  Intel: ["intel", "xeon", "gaudi"],
};

const TEMPLATES: DomainTemplate[] = [
  {
    domain: "AI Infrastructure",
    keywords: ["ai", "llm", "inference", "gpu", "model", "rag", "training", "genai", "machine learning", "vector", "agent"],
    environment: [
      "GPU compute pod (8x accelerator nodes, NVLink/RoCE fabric)",
      "High-throughput NVMe dataset staging tier",
      "Kubernetes + inference-serving stack (Triton/vLLM)",
      "Load-generation harness with recorded prompt corpus",
    ],
    sections: [
      {
        title: "Environment Validation",
        intent: "Prove the provisioned pod matches the agreed bill of materials before any measured run.",
        cases: [
          {
            title: "Accelerator inventory and interconnect health",
            objective: "Verify GPU count, firmware baseline, and fabric link health on every node.",
            steps: [
              "Enumerate accelerators and firmware on each node",
              "Validate NVLink/RDMA link state and negotiated bandwidth",
              "Record baseline idle power and thermals",
            ],
            expected: "All nodes report the contracted accelerator count, matching firmware baseline, and all fabric links up at rated speed.",
            tasks: [
              {
                name: "Enumerate GPUs per node",
                serviceType: "ssh_command",
                target: "gpu-pod-nodes",
                command: "nvidia-smi --query-gpu=name,driver_version,pstate --format=csv",
                validators: ["row_count == contracted_gpu_count", "driver_version matches baseline"],
              },
              {
                name: "Fabric link check",
                serviceType: "ssh_command",
                target: "gpu-pod-nodes",
                command: "ibstat | grep -E 'State|Rate'",
                validators: ["all links State: Active", "Rate >= contracted_gbps"],
              },
            ],
          },
        ],
      },
      {
        title: "Performance Under Load",
        intent: "Measure the metrics the buying decision actually turns on, at contract-realistic concurrency.",
        cases: [
          {
            title: "Sustained inference throughput",
            objective: "Measure tokens/sec and p99 latency at target concurrency for 30 sustained minutes.",
            steps: [
              "Deploy the reference model and warm the serving stack",
              "Ramp load to target concurrent sessions",
              "Hold for 30 minutes; capture throughput, latency, and error-rate telemetry",
            ],
            expected: "Sustained throughput within 10% of vendor claim; p99 latency under the agreed SLO; zero 5xx under steady state.",
            tasks: [
              {
                name: "Run load profile",
                serviceType: "traffic_profile",
                target: "inference-endpoint",
                command: "profile: llm_sustained_30m, concurrency: target",
                validators: ["p99_latency_ms <= slo", "error_rate < 0.1%"],
              },
              {
                name: "Collect serving metrics",
                serviceType: "monitoring",
                target: "prometheus-lab",
                command: "query: tokens_per_second, gpu_util, kv_cache_hit",
                validators: ["tokens_per_second >= 0.9 * vendor_claim"],
              },
            ],
          },
          {
            title: "Failure-mode behavior: node loss mid-run",
            objective: "Validate serving-tier behavior and recovery time when a node is removed under load.",
            steps: [
              "Re-establish steady-state load",
              "Hard-fail one serving node",
              "Measure request-error window and time to re-shard/recover",
            ],
            expected: "Recovery within stated tolerance; no unrecoverable session loss; degraded throughput consistent with remaining capacity.",
            tasks: [
              {
                name: "Fail node and collect logs",
                serviceType: "log_collection",
                target: "gpu-pod-nodes",
                command: "collect: scheduler + serving logs around fault window",
                validators: ["recovery_seconds <= tolerance", "no unhandled exceptions post-recovery"],
              },
            ],
          },
        ],
      },
      {
        title: "Operational Readiness",
        intent: "Confirm the platform can be run by the customer's team, not just by the lab.",
        cases: [
          {
            title: "Observability and management-plane review",
            objective: "Exercise the management APIs and dashboards a production operator would rely on.",
            steps: [
              "Query health, capacity, and job APIs",
              "Walk the operational dashboard for the fault injected in the prior section",
              "Verify alerting fired for the induced failure",
            ],
            expected: "Management plane surfaced the failure accurately, with actionable alerting and complete audit trail.",
            tasks: [
              {
                name: "Management API sweep",
                serviceType: "rest_api",
                target: "mgmt-api-profile",
                command: "GET /v1/health, /v1/capacity, /v1/jobs",
                validators: ["status == 200", "capacity payload matches AMS reservation"],
              },
              {
                name: "Dashboard walk-through",
                serviceType: "playwright",
                target: "mgmt-ui",
                command: "scenario: locate fault event, export incident report",
                validators: ["fault event visible with correct timestamp", "export succeeds"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    domain: "Security",
    keywords: ["security", "firewall", "ransomware", "zero trust", "zero-trust", "soc", "segmentation", "cyber", "threat", "edr", "siem"],
    environment: [
      "Segmented attack/defend enclave (Cyber Range pod)",
      "Candidate security platforms inline in identical topologies",
      "Traffic replay of production-like enterprise mix",
      "Instrumented victim workloads with rollback snapshots",
    ],
    sections: [
      {
        title: "Policy & Segmentation Validation",
        intent: "Prove the enforcement claims each vendor makes, in an identical topology.",
        cases: [
          {
            title: "Zero-trust policy enforcement parity",
            objective: "Apply an identical intent-level policy set to each candidate and verify enforcement matches.",
            steps: [
              "Translate the shared policy intent into each platform's native policy",
              "Replay east-west traffic matrix",
              "Diff observed allow/deny against the intent matrix",
            ],
            expected: "100% of intent rules enforced correctly; any deviation documented with packet-level evidence.",
            tasks: [
              {
                name: "Replay traffic matrix",
                serviceType: "traffic_profile",
                target: "range-traffic-gen",
                command: "profile: east_west_matrix_v3",
                validators: ["deny_matrix match == 100%", "allow_matrix match == 100%"],
              },
              {
                name: "Collect enforcement logs",
                serviceType: "log_collection",
                target: "candidate-firewalls",
                command: "collect: policy hit counters + drop logs",
                validators: ["every intent rule has matching hit evidence"],
              },
            ],
          },
        ],
      },
      {
        title: "Live-Fire Efficacy",
        intent: "Adjudicate detection and containment against real attack tradecraft, not marketing datasheets.",
        cases: [
          {
            title: "Ransomware detonation and containment",
            objective: "Measure time-to-detect and blast radius for a controlled ransomware chain.",
            steps: [
              "Detonate the controlled sample on an instrumented victim",
              "Record detection latency and automated containment actions",
              "Measure lateral spread against the segmentation policy",
            ],
            expected: "Detection within agreed threshold; lateral movement contained to the sacrificial segment; full forensic timeline captured.",
            tasks: [
              {
                name: "Run detonation scenario",
                serviceType: "console_command",
                target: "range-victim-01",
                command: "scenario: rw_chain_2026_03 (isolated enclave)",
                validators: ["detect_seconds <= threshold", "spread limited to segment"],
              },
              {
                name: "SOC alert fidelity check",
                serviceType: "rest_api",
                target: "siem-api-profile",
                command: "GET /alerts?window=scenario",
                validators: ["alert maps to correct technique", "no critical-alert gaps"],
              },
            ],
          },
          {
            title: "TLS-inspection throughput under load",
            objective: "Measure inspected throughput and added latency at production cipher mix.",
            steps: [
              "Ramp TLS traffic to rated capacity",
              "Capture throughput/latency at 50/80/100% of vendor-rated load",
            ],
            expected: "Inspected throughput within 15% of datasheet at production cipher mix; latency added stays within SLO.",
            tasks: [
              {
                name: "TLS load ramp",
                serviceType: "traffic_profile",
                target: "range-traffic-gen",
                command: "profile: tls_mix_prod, steps: 50/80/100",
                validators: ["throughput >= 0.85 * datasheet", "added_latency_ms <= slo"],
              },
            ],
          },
        ],
      },
      {
        title: "Operational Readiness",
        intent: "Confirm day-2 operability for the customer's SOC.",
        cases: [
          {
            title: "Management, logging, and API integration",
            objective: "Validate SIEM/SOAR integration and policy-as-code workflow on each candidate.",
            steps: [
              "Push a policy change via API and verify propagation",
              "Confirm log delivery completeness to the SIEM",
            ],
            expected: "API-driven policy change propagates within SLO; zero log loss over the test window.",
            tasks: [
              {
                name: "Policy-as-code push",
                serviceType: "rest_api",
                target: "candidate-mgmt-profile",
                command: "POST /policies (canary rule)",
                validators: ["propagation_seconds <= slo", "audit log entry present"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    domain: "Networking",
    keywords: ["network", "switch", "fabric", "sd-wan", "sdwan", "wifi", "wireless", "routing", "evpn", "400g", "data center network"],
    environment: [
      "Multi-vendor leaf/spine pod with identical topologies per candidate",
      "Hardware traffic generation at line rate",
      "Out-of-band console + streaming telemetry collectors",
    ],
    sections: [
      {
        title: "Fabric Bring-Up & Conformance",
        intent: "Prove the design deploys as specified before measuring anything.",
        cases: [
          {
            title: "EVPN/VXLAN control-plane conformance",
            objective: "Validate route advertisement, VTEP peering, and multi-tenancy isolation.",
            steps: [
              "Deploy the reference fabric config to each candidate",
              "Verify EVPN route types and VTEP adjacencies",
              "Probe cross-tenant isolation",
            ],
            expected: "All adjacencies established; route tables match design; zero cross-tenant leakage.",
            tasks: [
              {
                name: "Verify EVPN state",
                serviceType: "ssh_command",
                target: "fabric-leaves",
                command: "show bgp l2vpn evpn summary",
                validators: ["all peers Established", "route_count matches design"],
              },
            ],
          },
        ],
      },
      {
        title: "Performance & Failure Behavior",
        intent: "Measure convergence and throughput where designs actually differ.",
        cases: [
          {
            title: "Line-rate east-west throughput",
            objective: "Measure sustained throughput and buffer behavior at 100% offered load.",
            steps: ["Offer line-rate east-west mesh traffic", "Capture drops, latency distribution, buffer telemetry"],
            expected: "Zero loss at contracted load; latency distribution within SLO; telemetry complete.",
            tasks: [
              {
                name: "Mesh load test",
                serviceType: "traffic_profile",
                target: "hw-traffic-gen",
                command: "profile: full_mesh_line_rate",
                validators: ["frame_loss == 0", "p99_latency_us <= slo"],
              },
            ],
          },
          {
            title: "Link/node failure convergence",
            objective: "Measure traffic-impact window for spine loss, leaf loss, and link flap under load.",
            steps: ["Establish steady-state load", "Fail spine, then leaf, then flap links", "Measure loss window per event"],
            expected: "Convergence under the agreed threshold for every failure class.",
            tasks: [
              {
                name: "Failure injection sweep",
                serviceType: "console_command",
                target: "fabric-oob",
                command: "sequence: spine_fail, leaf_fail, link_flap x10",
                validators: ["max_loss_ms <= threshold per event"],
              },
            ],
          },
        ],
      },
      {
        title: "Operations & Automation",
        intent: "Confirm the fabric is operable through the customer's tooling.",
        cases: [
          {
            title: "Streaming telemetry and API management",
            objective: "Validate telemetry completeness and config automation via API.",
            steps: ["Subscribe to streaming telemetry", "Drive a config change through the northbound API"],
            expected: "Telemetry captures the failure events from prior section; API change is atomic and audited.",
            tasks: [
              {
                name: "Telemetry completeness check",
                serviceType: "monitoring",
                target: "telemetry-collector",
                command: "verify: interface + bgp event streams during failure sweep",
                validators: ["no telemetry gaps > 1s"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    domain: "Storage",
    keywords: ["storage", "san", "nas", "nvme", "backup", "replication", "snapshot", "array", "iops"],
    environment: [
      "Candidate arrays zoned into identical host clusters",
      "Calibrated IO-generation hosts (mixed-block realistic profiles)",
      "Replication link with impairment generator",
    ],
    sections: [
      {
        title: "Baseline & Data Services",
        intent: "Validate configuration and the data services the customer will actually run.",
        cases: [
          {
            title: "Mixed-workload latency baseline",
            objective: "Establish IOPS/latency envelope at the customer's real block-size mix.",
            steps: ["Run calibrated mixed-IO profile", "Capture latency percentiles per array"],
            expected: "Latency within SLO across the full profile; results reproducible across three runs.",
            tasks: [
              {
                name: "Mixed IO profile",
                serviceType: "traffic_profile",
                target: "io-gen-hosts",
                command: "profile: customer_mix_v1, runs: 3",
                validators: ["p99_ms <= slo", "run variance < 5%"],
              },
            ],
          },
        ],
      },
      {
        title: "Resilience Under Failure",
        intent: "Measure behavior during the events that cause 2 a.m. calls.",
        cases: [
          {
            title: "Controller failover under load",
            objective: "Measure IO pause and performance degradation during controller loss.",
            steps: ["Sustain mixed load", "Fail a controller", "Measure pause window and degraded-state performance"],
            expected: "IO pause under threshold; no data integrity errors; performance recovers on failback.",
            tasks: [
              {
                name: "Controller fail sequence",
                serviceType: "console_command",
                target: "array-mgmt",
                command: "sequence: controller_fail + failback",
                validators: ["io_pause_ms <= threshold", "zero integrity errors"],
              },
            ],
          },
          {
            title: "Replication RPO under link impairment",
            objective: "Validate replication behavior with realistic WAN latency/loss.",
            steps: ["Impair replication link (latency + loss)", "Measure achieved RPO vs. stated"],
            expected: "Achieved RPO within stated bounds under impairment profile.",
            tasks: [
              {
                name: "Impaired replication run",
                serviceType: "monitoring",
                target: "replication-monitor",
                command: "impair: 30ms/0.1% loss, window: 2h",
                validators: ["achieved_rpo <= stated_rpo"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    domain: "Hybrid Cloud",
    keywords: ["cloud", "kubernetes", "k8s", "migration", "vmware", "hybrid", "container", "dr", "disaster recovery", "multi-cloud"],
    environment: [
      "On-prem cluster + connected cloud landing zones",
      "Representative application stack with stateful services",
      "Cost and telemetry instrumentation on both sides",
    ],
    sections: [
      {
        title: "Platform Validation",
        intent: "Prove the target platform runs the representative stack correctly.",
        cases: [
          {
            title: "Representative workload deployment",
            objective: "Deploy the reference application stack and validate functional parity.",
            steps: ["Deploy stack via GitOps pipeline", "Run functional smoke suite", "Verify persistent-volume behavior"],
            expected: "Full functional parity with the source environment; stateful services healthy.",
            tasks: [
              {
                name: "GitOps deploy + smoke",
                serviceType: "rest_api",
                target: "cluster-api-profile",
                command: "apply: reference-stack; run: smoke-suite",
                validators: ["all pods Ready", "smoke suite 100% pass"],
              },
            ],
          },
        ],
      },
      {
        title: "Migration & Failure Scenarios",
        intent: "Measure the cutover and DR behavior the business case depends on.",
        cases: [
          {
            title: "Live migration cutover window",
            objective: "Measure downtime and data-sync lag for a live workload move.",
            steps: ["Begin replication of stateful services", "Execute cutover", "Measure downtime window and consistency"],
            expected: "Cutover within the agreed maintenance window; zero data loss.",
            tasks: [
              {
                name: "Cutover execution",
                serviceType: "rest_api",
                target: "migration-tool-profile",
                command: "execute: cutover-plan-v1",
                validators: ["downtime_min <= window", "checksum parity == 100%"],
              },
            ],
          },
          {
            title: "DR failover and failback",
            objective: "Validate full DR runbook including failback.",
            steps: ["Simulate primary-site loss", "Fail over per runbook", "Fail back and verify consistency"],
            expected: "RTO/RPO within stated targets in both directions.",
            tasks: [
              {
                name: "DR runbook execution",
                serviceType: "console_command",
                target: "dr-orchestrator",
                command: "run: dr-runbook full-cycle",
                validators: ["rto <= target", "rpo <= target"],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const TIERS: Record<PricingTier["key"], PricingTier> = {
  validate: {
    key: "validate",
    name: "Validate",
    price: 24500,
    durationWeeks: 2,
    description: "Single-domain validation of one candidate architecture.",
  },
  compare: {
    key: "compare",
    name: "Compare",
    price: 58000,
    durationWeeks: 3,
    description: "Head-to-head multi-OEM comparison on identical topologies.",
  },
  bakeoff: {
    key: "bakeoff",
    name: "Enterprise Bake-off",
    price: 92000,
    durationWeeks: 5,
    description: "Multi-domain, multi-OEM evaluation with executive readout.",
  },
};

function detectOems(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.entries(OEM_KEYWORDS)
    .filter(([, kws]) => kws.some((k) => lower.includes(k)))
    .map(([oem]) => oem);
}

function scoreTemplate(t: DomainTemplate, text: string): number {
  const lower = text.toLowerCase();
  return t.keywords.reduce((s, k) => s + (lower.includes(k) ? 1 : 0), 0);
}

let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const atomDrafter: PlanDrafter = {
  draft(requirement: string, org: string): DraftResult {
    const ranked = TEMPLATES.map((t) => ({ t, score: scoreTemplate(t, requirement) })).sort(
      (a, b) => b.score - a.score
    );
    const primary = ranked[0].score > 0 ? ranked[0].t : TEMPLATES[0];
    const secondary = ranked[1]?.score >= 2 ? ranked[1].t : undefined;
    const oems = detectOems(requirement);
    const multiOem = oems.length >= 2;

    const sections: PlanSection[] = [];
    let sectionNo = 0;
    const buildSections = (tpl: DomainTemplate) => {
      for (const s of tpl.sections) {
        sectionNo++;
        const cases: TestCase[] = s.cases.map((c, ci) => ({
          id: uid("tc"),
          code: `${sectionNo}.${ci + 1}`,
          title: c.title,
          objective: c.objective,
          steps: c.steps,
          expected: c.expected,
          status: "pending",
          taskList: {
            id: uid("tl"),
            name: `${c.title} — task list`,
            tasks: c.tasks.map(
              (task): TrTask => ({
                id: uid("task"),
                name: task.name,
                serviceType: task.serviceType,
                target: task.target,
                command: task.command,
                validators: task.validators,
              })
            ),
          },
        }));
        sections.push({ id: uid("sec"), title: s.title, intent: s.intent, cases });
      }
    };
    buildSections(primary);
    if (secondary) buildSections(secondary);

    const caseCount = sections.reduce((n, s) => n + s.cases.length, 0);
    const tier =
      secondary || caseCount > 8
        ? TIERS.bakeoff
        : multiOem
        ? TIERS.compare
        : TIERS.validate;

    const domains = secondary ? [primary.domain, secondary.domain] : [primary.domain];
    const plan: TestPlan = {
      id: uid("plan"),
      title: `${org} — ${domains.join(" + ")} Proof of Concept`,
      summary:
        `Vendor-neutral evaluation of ${oems.length ? oems.join(", ") : "candidate platforms"} for: ` +
        `"${requirement.trim().slice(0, 180)}${requirement.trim().length > 180 ? "…" : ""}". ` +
        `Executed on dedicated ATC infrastructure with identical topologies per candidate, ` +
        `adjudicated from captured evidence, and delivered as a signed report.`,
      domains,
      oems: oems.length ? oems : ["Multi-OEM (to be confirmed at scoping)"],
      environment: secondary ? [...primary.environment, ...secondary.environment] : primary.environment,
      successCriteria: [
        "Every test case adjudicated pass/fail/inconclusive with cited evidence",
        "Candidates measured on identical topology, load, and failure scenarios",
        "All raw evidence artifacts delivered alongside the signed report",
        "Verdicts approved by an ATC engineer before release",
      ],
      sections,
    };

    return { plan, tier };
  },
};
