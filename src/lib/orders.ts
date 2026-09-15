// Sample orders across the non-PoC product lines, shown on the Engagements page.
// Lab Hosting is deliberately absent — it has its own Hosted Lab tab.
// In production these come from the commerce/entitlement system of record.

export interface SampleOrder {
  id: string;
  org: string;
  line: string;
  product: string;
  details: string;
  priceLine: string;
  created: string;
  status: "Active" | "Running" | "Scheduled" | "Delivered";
}

export const SAMPLE_ORDERS: SampleOrder[] = [
  {
    id: "ORD-7C21A4",
    org: "Acme Financial",
    line: "ATC Cloud",
    product: "Virtual Lab Environment — acme-vdc-01",
    details: "42 VMs · 128 vCPU · 1.2 TB RAM · $1,142 metered month-to-date",
    priceLine: "$0.12/vCPU-hr",
    created: "Aug 28, 2026",
    status: "Running",
  },
  {
    id: "ORD-7B98E2",
    org: "Northwind Logistics",
    line: "Self-Service Labs",
    product: "AI Proving Ground Sandbox",
    details: "GPU pod day passes · 3 of 5 purchased days used",
    priceLine: "$189/day",
    created: "Sep 11, 2026",
    status: "Active",
  },
  {
    id: "ORD-7A44D9",
    org: "Helios Energy",
    line: "Self-Service Labs",
    product: "EVPN/VXLAN Fabric Reference Lab",
    details: "Dedicated pod · reserved through Sep 19",
    priceLine: "$129/day",
    created: "Sep 08, 2026",
    status: "Running",
  },
  {
    id: "ORD-79F1B3",
    org: "Acme Financial",
    line: "Cyber Range",
    product: "Ransomware Live-Fire Exercise",
    details: "20 participants · scheduled Oct 02, 2026 · scenario rw_chain_2026_03",
    priceLine: "$14,000/event",
    created: "Sep 03, 2026",
    status: "Scheduled",
  },
  {
    id: "ORD-7913AA",
    org: "Northwind Logistics",
    line: "Cyber Range",
    product: "Cyber Range Team Seats × 25",
    details: "Annual seats · CTF + guided labs · 21 of 25 seats claimed",
    priceLine: "$11,250/yr",
    created: "Jul 14, 2026",
    status: "Active",
  },
  {
    id: "ORD-78D077",
    org: "Helios Energy",
    line: "Intelligence",
    product: "ATC Intelligence — Enterprise",
    details: "Org-wide corpus access · renews Jun 2027 · 118 queries this month",
    priceLine: "$60,000/yr",
    created: "Jun 22, 2026",
    status: "Active",
  },
  {
    id: "ORD-77C5E8",
    org: "Cirrus Networks (OEM)",
    line: "Partner Program",
    product: "OEM Partner Program — Placement & Capacity",
    details: "Tier 2 placement · 2 co-branded reference architectures · guaranteed rack capacity",
    priceLine: "$85,000/yr",
    created: "May 30, 2026",
    status: "Active",
  },
  {
    id: "ORD-7688B1",
    org: "Cirrus Networks (OEM)",
    line: "Intelligence",
    product: "OEM Benchmark Insights",
    details: "Blinded competitive benchmarking · Q3 report delivered Sep 09",
    priceLine: "$120,000/yr",
    created: "Apr 18, 2026",
    status: "Delivered",
  },
];
