import type { Asset, OutcomeRecord, VerdictOutcome } from "./types";

// Deterministic PRNG so the demo corpus is stable across restarts.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ASSET_SPECS: Array<{
  type: string;
  oem: string;
  count: number;
  cost: number;
  prefix: string;
}> = [
  { type: "GPU Compute Node", oem: "NVIDIA", count: 8, cost: 14500, prefix: "gpu" },
  { type: "GPU Compute Node", oem: "Dell", count: 4, cost: 12800, prefix: "gpu" },
  { type: "Rack Server", oem: "HPE", count: 10, cost: 3100, prefix: "srv" },
  { type: "Rack Server", oem: "Dell", count: 10, cost: 2900, prefix: "srv" },
  { type: "Storage Array", oem: "NetApp", count: 5, cost: 6800, prefix: "sto" },
  { type: "Storage Array", oem: "Pure Storage", count: 3, cost: 7200, prefix: "sto" },
  { type: "Data Center Switch", oem: "Cisco", count: 8, cost: 1900, prefix: "sw" },
  { type: "Data Center Switch", oem: "Arista", count: 4, cost: 1800, prefix: "sw" },
  { type: "Firewall", oem: "Palo Alto Networks", count: 5, cost: 2400, prefix: "fw" },
  { type: "Firewall", oem: "Fortinet", count: 3, cost: 2100, prefix: "fw" },
  { type: "Load Balancer", oem: "F5", count: 3, cost: 2000, prefix: "lb" },
];

const ORGS = ["AI Proving Ground", "Cyber Range", "Lab Hosting", "PoC Services", "Unassigned"];

export function seedAssets(): Asset[] {
  const rand = mulberry32(42);
  const assets: Asset[] = [];
  let n = 0;
  for (const spec of ASSET_SPECS) {
    for (let i = 1; i <= spec.count; i++) {
      n++;
      const r = rand();
      // Directional utilization picture: a meaningful share of the floor sits idle (§8 gap)
      const status = r < 0.55 ? "allocated" : r < 0.92 ? "idle" : "maintenance";
      assets.push({
        tag: `ATC-${String(10000 + n)}`,
        serial: `SN${String(Math.floor(rand() * 9e7) + 1e7)}`,
        hostname: `${spec.prefix}-${spec.oem.split(" ")[0].toLowerCase()}-${String(i).padStart(2, "0")}.atc.lab`,
        type: spec.type,
        oem: spec.oem,
        rack: `R${String(Math.floor(rand() * 24) + 1).padStart(2, "0")}`,
        location: rand() < 0.8 ? "STL-DC1" : "STL-DC2",
        org: ORGS[Math.floor(rand() * ORGS.length)],
        status,
        monthlyCost: spec.cost,
      });
    }
  }
  return assets;
}

const DOMAINS: Array<{ domain: string; oems: string[]; workloads: string[] }> = [
  {
    domain: "AI Infrastructure",
    oems: ["NVIDIA", "Dell", "HPE", "Intel"],
    workloads: ["LLM inference at scale", "RAG pipeline throughput", "Multi-node training", "Vector DB performance"],
  },
  {
    domain: "Networking",
    oems: ["Cisco", "Arista", "Juniper", "HPE"],
    workloads: ["EVPN fabric convergence", "SD-WAN failover", "400G east-west throughput", "Campus wireless density"],
  },
  {
    domain: "Security",
    oems: ["Palo Alto Networks", "Fortinet", "Cisco", "F5"],
    workloads: ["Ransomware containment", "Zero-trust segmentation", "TLS-inspection throughput", "SOC alert fidelity"],
  },
  {
    domain: "Storage",
    oems: ["NetApp", "Pure Storage", "Dell", "HPE"],
    workloads: ["Mixed-IO latency under failure", "Snapshot/replication RPO", "NVMe-oF scaling", "AI dataset staging"],
  },
  {
    domain: "Hybrid Cloud",
    oems: ["VMware", "Microsoft", "AWS", "Google Cloud"],
    workloads: ["Workload migration cutover", "Kubernetes multi-cluster ops", "DR failback", "Cost-governed autoscale"],
  },
];

const FAILURE_MODES = [
  "Firmware/driver mismatch under sustained load",
  "Interop gap with third-party management plane",
  "Performance cliff past 70% saturation",
  "Failover exceeded stated RTO",
  "Feature required unreleased software train",
  "Telemetry insufficient for adjudication",
];

// ~2,400 anonymized, adjudicated outcomes — the Intelligence corpus (§2.3, §4).
export function seedOutcomes(): OutcomeRecord[] {
  const rand = mulberry32(7);
  const out: OutcomeRecord[] = [];
  let id = 0;
  for (const d of DOMAINS) {
    for (const oem of d.oems) {
      for (const workload of d.workloads) {
        const runs = 24 + Math.floor(rand() * 12);
        // Each OEM gets a stable "true skill" per workload, so aggregates are coherent.
        const skill = 0.55 + rand() * 0.38;
        for (let i = 0; i < runs; i++) {
          id++;
          const r = rand();
          const outcome: VerdictOutcome = r < skill ? "pass" : r < skill + 0.12 ? "inconclusive" : "fail";
          out.push({
            id: `OUT-${String(id).padStart(5, "0")}`,
            year: 2016 + Math.floor(rand() * 10),
            domain: d.domain,
            oem,
            workload,
            outcome,
            performanceScore: Math.round(Math.min(99, Math.max(20, skill * 100 + (rand() - 0.5) * 24))),
            failureMode: outcome === "fail" ? FAILURE_MODES[Math.floor(rand() * FAILURE_MODES.length)] : undefined,
          });
        }
      }
    }
  }
  return out;
}
