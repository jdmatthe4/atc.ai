// Marketplace catalog — the five product tiers from CLAUDE.md §5 broken out into
// buyable listings. Every listing is purchasable without a WWT services engagement
// attached (§5's unifying design principle).

export type ProductLine =
  | "PoC Engagements"
  | "Self-Service Labs"
  | "ATC Cloud"
  | "Lab Hosting"
  | "Cyber Range"
  | "Intelligence"
  | "Partner Program";

export type PricingModel = "Flat fee" | "Usage-based" | "Subscription" | "Per seat / event";

export interface Listing {
  id: string;
  name: string;
  line: ProductLine;
  domains: string[];
  pricingModel: PricingModel;
  priceLine: string; // display price
  priceUnit: string;
  priceValue: number; // for sorting
  rating: number; // 0..5
  reviews: number;
  badge?: string;
  description: string;
  oems: string[];
  href: string;
  cta: string;
  tile: string; // 2-3 char tile monogram
  tileClass: string; // gradient class for the tile
}

export const LISTINGS: Listing[] = [
  {
    id: "poc-validate",
    name: "ATC PoC — Validate",
    line: "PoC Engagements",
    domains: ["Cross-domain"],
    pricingModel: "Flat fee",
    priceLine: "$24,500",
    priceUnit: "per engagement · 2 weeks",
    priceValue: 24500,
    rating: 4.8,
    reviews: 312,
    description:
      "Single-domain validation of one candidate architecture. Agent-drafted POCDOC test plan, TestRunner execution on dedicated lab infrastructure, signed evidence-backed report.",
    oems: ["Any of 200+ OEMs"],
    href: "/request/new",
    cta: "Start request",
    tile: "PV",
    tileClass: "from-[#0086EA] to-[#162FB4]",
  },
  {
    id: "poc-compare",
    name: "ATC PoC — Compare",
    line: "PoC Engagements",
    domains: ["Cross-domain"],
    pricingModel: "Flat fee",
    priceLine: "$58,000",
    priceUnit: "per engagement · 3 weeks",
    priceValue: 58000,
    rating: 4.9,
    reviews: 486,
    badge: "Best seller",
    description:
      "Head-to-head multi-OEM comparison on identical topologies, load profiles, and failure scenarios. The vendor-neutral answer a $75–150K DIY PoC can't produce.",
    oems: ["Any of 200+ OEMs"],
    href: "/request/new",
    cta: "Start request",
    tile: "PC",
    tileClass: "from-[#162FB4] to-[#1C0087]",
  },
  {
    id: "poc-bakeoff",
    name: "ATC PoC — Enterprise Bake-off",
    line: "PoC Engagements",
    domains: ["Cross-domain"],
    pricingModel: "Flat fee",
    priceLine: "$92,000",
    priceUnit: "per engagement · 5 weeks",
    priceValue: 92000,
    rating: 4.9,
    reviews: 158,
    description:
      "Multi-domain, multi-OEM evaluation with executive readout. Full evidence archive, engineer-signed verdicts, and procurement-ready comparative report.",
    oems: ["Any of 200+ OEMs"],
    href: "/request/new",
    cta: "Start request",
    tile: "EB",
    tileClass: "from-[#8212C4] to-[#330072]",
  },
  {
    id: "explorer-aipg",
    name: "AI Proving Ground Sandbox",
    line: "Self-Service Labs",
    domains: ["AI Infrastructure"],
    pricingModel: "Usage-based",
    priceLine: "$189",
    priceUnit: "per day · GPU pod access",
    priceValue: 189,
    rating: 4.7,
    reviews: 923,
    badge: "Free trial",
    description:
      "Self-serve access to a pre-built GPU cluster with inference-serving stack, load harness, and reference LLM deployments. Provisioned in minutes, no rep required.",
    oems: ["NVIDIA", "Dell", "Intel"],
    href: "/request/new",
    cta: "Launch sandbox",
    tile: "AI",
    tileClass: "from-[#0086EA] to-[#1C0087]",
  },
  {
    id: "explorer-evpn",
    name: "EVPN/VXLAN Fabric Reference Lab",
    line: "Self-Service Labs",
    domains: ["Networking"],
    pricingModel: "Usage-based",
    priceLine: "$129",
    priceUnit: "per day · dedicated pod",
    priceValue: 129,
    rating: 4.6,
    reviews: 541,
    description:
      "Pre-built multi-vendor leaf/spine fabric with traffic generation and streaming telemetry. Validate designs and failure behavior before you buy hardware.",
    oems: ["Cisco", "Arista", "Juniper"],
    href: "/request/new",
    cta: "Launch lab",
    tile: "NF",
    tileClass: "from-[#162FB4] to-[#330072]",
  },
  {
    id: "explorer-zt",
    name: "Zero Trust Segmentation Sandbox",
    line: "Self-Service Labs",
    domains: ["Security"],
    pricingModel: "Usage-based",
    priceLine: "$149",
    priceUnit: "per day · isolated enclave",
    priceValue: 149,
    rating: 4.5,
    reviews: 387,
    description:
      "Candidate firewalls inline in identical topologies with replayable enterprise traffic. Test policy parity and enforcement behavior hands-on.",
    oems: ["Palo Alto Networks", "Fortinet", "Cisco"],
    href: "/request/new",
    cta: "Launch sandbox",
    tile: "ZT",
    tileClass: "from-[#FB550E] to-[#E31C79]",
  },
  {
    id: "explorer-storage",
    name: "AI Dataset Storage Lab",
    line: "Self-Service Labs",
    domains: ["Storage"],
    pricingModel: "Usage-based",
    priceLine: "$99",
    priceUnit: "per day · array pair",
    priceValue: 99,
    rating: 4.4,
    reviews: 264,
    description:
      "Calibrated mixed-IO harness against enterprise arrays: latency envelopes, controller failover, replication under impaired links.",
    oems: ["NetApp", "Pure Storage", "Dell"],
    href: "/request/new",
    cta: "Launch lab",
    tile: "ST",
    tileClass: "from-[#8212C4] to-[#162FB4]",
  },
  {
    id: "cloud-vdc",
    name: "ATC Cloud — Virtual Lab Environments",
    line: "ATC Cloud",
    domains: ["Cross-domain"],
    pricingModel: "Usage-based",
    priceLine: "From $0.12",
    priceUnit: "per vCPU-hour · metered",
    priceValue: 86, // ~a month of one always-on VM, for sensible price sorting
    badge: "New",
    rating: 4.7,
    reviews: 348,
    description:
      "Build your own virtual environment on the ATC's 20,000+ VM estate — your own isolated virtual datacenter where you compose VMs, networks, and virtual appliances from 600+ templates or your own images. Snapshot, clone, tear down, rebuild. UI and API. Metered per vCPU-hour, RAM, and storage: pay only while it runs.",
    oems: ["600+ templates", "Bring your own images"],
    href: "/request/new",
    cta: "Create environment",
    tile: "AC",
    tileClass: "from-[#0086EA] to-[#162FB4]",
  },
  {
    id: "hosting-dedicated",
    name: "ATC Lab Hosting — Dedicated",
    line: "Lab Hosting",
    domains: ["Cross-domain"],
    pricingModel: "Subscription",
    priceLine: "From $8,500",
    priceUnit: "per rack / month · annual term",
    priceValue: 8500,
    badge: "New",
    rating: 4.8,
    reviews: 96,
    description:
      "Outsource your entire lab to the ATC. Ship us your gear (or build on ours), and we host it in dedicated, secured racks: power, cooling, connectivity, 24×7 remote hands, and AMS asset tracking down to the serial number. Your engineers get remote access from anywhere; your facilities team gets their floor space back.",
    oems: ["Your hardware", "Any of 200+ OEMs"],
    href: "/request/new",
    cta: "Request hosting quote",
    tile: "LH",
    tileClass: "from-[#1D1E48] to-[#162FB4]",
  },
  {
    id: "hosting-managed",
    name: "ATC Lab Hosting — Fully Managed",
    line: "Lab Hosting",
    domains: ["Cross-domain"],
    pricingModel: "Subscription",
    priceLine: "From $21,000",
    priceUnit: "per rack / month · annual term",
    priceValue: 21000,
    rating: 4.9,
    reviews: 52,
    description:
      "Dedicated hosting plus our engineers operating the lab for you: provisioning, patching, topology changes, hardware lifecycle, and TestRunner automation on request. You keep the roadmap; we keep it running. Includes utilization reporting and a named lab operations lead.",
    oems: ["Your hardware", "Any of 200+ OEMs"],
    href: "/request/new",
    cta: "Request hosting quote",
    tile: "LM",
    tileClass: "from-[#330072] to-[#1D1E48]",
  },
  {
    id: "range-livefire",
    name: "Ransomware Live-Fire Exercise",
    line: "Cyber Range",
    domains: ["Security"],
    pricingModel: "Per seat / event",
    priceLine: "$14,000",
    priceUnit: "per event · up to 20 participants",
    priceValue: 14000,
    rating: 4.9,
    reviews: 205,
    badge: "Popular",
    description:
      "Controlled detonation scenarios on the same Cyber Range WWT runs internally. Instrumented victims, forensic timelines, facilitated hot-wash.",
    oems: ["Vendor-neutral"],
    href: "/request/new",
    cta: "Book event",
    tile: "LF",
    tileClass: "from-[#E31C79] to-[#8212C4]",
  },
  {
    id: "range-seats",
    name: "Cyber Range Team Seats",
    line: "Cyber Range",
    domains: ["Security"],
    pricingModel: "Per seat / event",
    priceLine: "$450",
    priceUnit: "per seat / year · CTF + labs",
    priceValue: 450,
    rating: 4.6,
    reviews: 1128,
    description:
      "Annual seat licenses for enterprise security teams: CTF-style events, guided labs, and certification-track exercises with progress reporting.",
    oems: ["Vendor-neutral"],
    href: "/request/new",
    cta: "Buy seats",
    tile: "CR",
    tileClass: "from-[#E31C79] to-[#330072]",
  },
  {
    id: "intel-enterprise",
    name: "ATC Intelligence — Enterprise",
    line: "Intelligence",
    domains: ["Cross-domain"],
    pricingModel: "Subscription",
    priceLine: "$60,000",
    priceUnit: "per year · org-wide access",
    priceValue: 60000,
    rating: 4.8,
    reviews: 174,
    badge: "High margin",
    description:
      "Query the adjudicated outcome corpus: head-to-head pass rates, performance scores, and observed failure modes across thousands of real multi-vendor tests.",
    oems: ["Corpus spans 200+ OEMs"],
    href: "/intelligence",
    cta: "View product",
    tile: "IQ",
    tileClass: "from-[#162FB4] to-[#1C0087]",
  },
  {
    id: "intel-oem",
    name: "OEM Benchmark Insights",
    line: "Intelligence",
    domains: ["Cross-domain"],
    pricingModel: "Subscription",
    priceLine: "$120,000",
    priceUnit: "per year · per OEM",
    priceValue: 120000,
    rating: 4.7,
    reviews: 41,
    description:
      "For OEMs: how your platform actually performs against competitors in independent, blinded testing — sold as insight, not given away as sales byproduct.",
    oems: ["OEM-facing"],
    href: "/intelligence",
    cta: "View product",
    tile: "OB",
    tileClass: "from-[#1D1E48] to-[#330072]",
  },
  {
    id: "partner-program",
    name: "OEM Partner Program — Placement & Capacity",
    line: "Partner Program",
    domains: ["Cross-domain"],
    pricingModel: "Subscription",
    priceLine: "From $85,000",
    priceUnit: "per year · tiered",
    priceValue: 85000,
    rating: 4.5,
    reviews: 63,
    description:
      "Marketplace placement, co-branded reference architectures, and guaranteed lab capacity for OEM partners — supply-side revenue on the 200+ partner roster.",
    oems: ["OEM-facing"],
    href: "/request/new",
    cta: "Contact program desk",
    tile: "PP",
    tileClass: "from-[#FB550E] to-[#EE282A]",
  },
];

export const PRODUCT_LINES: ProductLine[] = [
  "PoC Engagements",
  "Self-Service Labs",
  "ATC Cloud",
  "Lab Hosting",
  "Cyber Range",
  "Intelligence",
  "Partner Program",
];

export const PRICING_MODELS: PricingModel[] = [
  "Flat fee",
  "Usage-based",
  "Subscription",
  "Per seat / event",
];

export const DOMAIN_FILTERS = [
  "AI Infrastructure",
  "Networking",
  "Security",
  "Storage",
  "Cross-domain",
];
