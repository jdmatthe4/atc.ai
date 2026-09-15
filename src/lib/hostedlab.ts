// Hosted Lab dashboard seed — the customer-facing view of a Lab Hosting engagement
// (colocation-style: the customer's lab lives on the ATC floor, WWT operates it).

export interface SupportCase {
  id: string;
  title: string;
  subtitle: string;
  status: "In Progress" | "Waiting on Customer" | "Resolved";
  requestedBy: string;
  submitted: string;
}

export interface LabMember {
  name: string;
  role: string;
  org: "Customer" | "WWT";
}

export const HOSTED_LAB = {
  breadcrumb: "Hosted Labs",
  name: "Acme Financial DC5 Hosted Lab",
  account: "Acme Financial",
  description:
    "Acme Financial's lab extension on the ATC floor. Secure cage for ad-hoc testing needs where WWT hosts and performs testing as needed in support of the Acme Financial CTI Lab Innovation team.",
  program: "ATCPGM0001011",
  state: "Active",
  startDate: "June 07, 2023",
  endDate: "December 31, 2026",
  systemsStatus: "Operational",
};

export const SUPPORT_CASES: SupportCase[] = [
  {
    id: "CASE-4182",
    title: "Smart Hands — Rack and Cable",
    subtitle: "Acme — Rack and cable Supermicro AS-1115HS-TNR",
    status: "In Progress",
    requestedBy: "Travis Rushing",
    submitted: "Jul 23, 2026",
  },
  {
    id: "CASE-4176",
    title: "Cross-connect to lab VRF",
    subtitle: "New 100G cross-connect from cage A14 to shared services VRF",
    status: "Waiting on Customer",
    requestedBy: "Dana Whitfield",
    submitted: "Jul 18, 2026",
  },
  {
    id: "CASE-4139",
    title: "RMA — failed PSU on GPU node",
    subtitle: "gpu-nvidia-03: PSU2 fault, vendor RMA dispatched and swapped",
    status: "Resolved",
    requestedBy: "Miguel Aranda",
    submitted: "Jun 30, 2026",
  },
  {
    id: "CASE-4101",
    title: "Firmware baseline update window",
    subtitle: "Quarterly firmware baseline across fabric switches, maintenance window request",
    status: "Resolved",
    requestedBy: "Priya Natarajan",
    submitted: "Jun 12, 2026",
  },
];

export const LAB_MEMBERS: LabMember[] = [
  { name: "Travis Rushing", role: "Lab Innovation Lead", org: "Customer" },
  { name: "Dana Whitfield", role: "Network Engineer", org: "Customer" },
  { name: "Miguel Aranda", role: "Platform Engineer", org: "Customer" },
  { name: "Priya Natarajan", role: "Infrastructure Architect", org: "Customer" },
  { name: "Sam Okafor", role: "Security Engineer", org: "Customer" },
  { name: "Jordan Lee", role: "AI Infrastructure Engineer", org: "Customer" },
  { name: "Casey Morgan", role: "Named Lab Operations Lead", org: "WWT" },
  { name: "Alex Duval", role: "Datacenter Operations", org: "WWT" },
  { name: "Robin Castillo", role: "Remote Hands", org: "WWT" },
  { name: "Taylor Brooks", role: "TestRunner Automation", org: "WWT" },
];
