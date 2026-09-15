# CLAUDE.md — ATC.ai: Productizing WWT's Advanced Technology Center

**Author:** John Matthews (10 years, WWT ATC) · **Drafted:** September 15, 2026
**Purpose:** This is the context file for an application Claude Code will help build. It captures the business problem, the bold thesis, the product/technical direction, and the financial logic behind turning the ATC from a $50M/year internal cost center into a standalone $100M/year commercial business. Read this in full before writing code — it should shape the data model, the feature set, and the sequencing of what gets built first.

> **A note on sourcing:** This file was built from WWT's public ATC overview page, public market research on lab-as-a-service and agentic AI, and the internal tooling this author's own Claude environment reveals (POCDOC, TestRunner, AMS, Atom — see §3). It was explicitly built *without* pulling from email or internal drives, at the author's direction — so treat every dollar figure below as a directional planning assumption, not audited finance. Section 8 lists what needs real numbers before this goes to a steering committee.

---

## 1. The Situation, Stated Plainly

The ATC is one of the most valuable, least-monetized assets WWT owns. Today it is publicly described as "a digital ecosystem accessible anytime from anywhere in the world" — 20,000+ VMs, 500+ rack capacity, $1B in cumulative infrastructure investment, 600+ pre-built capabilities, 6,000+ customer engagements, 200+ OEM partners, built on a partner roster that includes Cisco, Dell, HPE, NetApp, F5, Intel, NVIDIA, Microsoft, Palo Alto Networks, AWS, Google Cloud and VMware. It houses the AI Proving Ground, the Cyber Range, Lab Hosting, Labs & Learning, and Proof of Concept services, and it already compresses technology evaluation cycles "from months to weeks or even days."

And it costs roughly **$50M a year to run**, funded as sales enablement and pre-sales cost of doing business — a strategic weapon that shows up on the books as overhead, not revenue.

Every competitor with a comparable asset — Cisco dCloud, Dell's Customer Solution Centers, Equinix's Solution Validation Centers, HPE's Discovery labs — treats theirs the same way: a free, loss-leading demand-gen tool bundled under sales. None of them have broken it out as a standalone P&L. That is precisely the opening. **Nobody has productized the proving ground itself. WWT can be first.**

The market is moving in the ATC's favor faster than most of WWT's own planning cycles: the agentic AI market is roughly $7.6B in 2025 growing toward $10.8B in 2026 and an estimated $139–196B by 2034; the broader software testing market is already a $55.8B category growing at ~7.2% CAGR; and — most importantly — 83% of enterprises are actively pursuing AI initiatives right now while 62% of them are stuck and cannot get past the proof-of-concept stage. A typical mid-market AI PoC costs a customer $75K–$150K and 8–12 weeks to run **on their own**, with no guarantee of an unbiased, multi-OEM comparison at the end of it. That gap — expensive, slow, biased, hard-to-scale PoCs — is exactly the gap the ATC already closes for WWT's own sales motion. It has never been sold as a product in its own right.

## 2. The Bold Thesis

**Stop running the ATC as a lab. Start running it as a platform business.**

Reframe the ATC from "the place WWT proves things before selling them" to "the de-risking layer the entire industry rents to make technology decisions." Three moves, pursued together, get there:

1. **Productize it externally.** Package the ATC's 600+ capabilities, 200+ OEM integrations, and validated methodology into a self-service, consumption-priced commercial offering that any enterprise, OEM, or systems integrator can buy into directly — not just WWT's own sales-assisted customers.
2. **Automate it internally with AI.** Use agentic AI to collapse the labor cost of running the lab itself — provisioning, teardown, test authoring, results triage, capacity planning — so the same (or larger) volume of engagements can run on a materially lower cost base. This is the lever that funds the transformation without asking for new headcount.
3. **Sell the intelligence layer, not just the infrastructure.** The real defensible product isn't rack space or VMs (Equinix and the hyperscalers already commoditize that). It's the AI-curated judgment sitting on top of 6,000+ engagements and a decade-plus of "what actually works" — an Atom-style agentic advisor that has effectively seen more real-world PoCs across more OEM combinations than any single vendor, integrator, or analyst firm on earth.

That third point is the moat. Gartner and the OEMs themselves have opinions about what works. WWT's ATC has *evidence* — thousands of real, adjudicated, multi-vendor test outcomes. An AI trained on that corpus is not a chatbot wrapper; it's a proprietary decision engine nobody else can replicate without also owning a decade of unbiased lab history.

## 3. What Already Exists (and Why It's the Seed of the Product)

This is the part of the thesis that isn't theoretical. The internal tooling this author already works with day to day is, functionally, most of the commercial product's backend:

- **POCDOC** — the structured data model for test plans and test cases: standard layout, controlled vocabularies, relationship rules, pass/fail adjudication from attached evidence (logs, CLI output, screenshots). This *is* the schema for "how a PoC is specified and judged" — today it's an internal authoring tool; productized, it's the customer-facing PoC specification and results engine.
- **TestRunner** — the execution layer: task lists that drive `ssh_command`, `rest_api`, `traffic_profile`, `monitoring`, `console_command`, `log_collection`, and `playwright` tasks against real lab environments, with automated pass/fail validation. This is already agentic test execution infrastructure. It's the thing every AI-PoC vendor in the market above is trying to build from scratch.
- **AMS (Asset Management System)** — asset-level inventory: tags, serials, hostnames, rack/floor-plan locations, org and owner mapping across the datacenter and warehouse footprint. This is the capacity and utilization ground truth the financial model in §6 depends on.
- **Atom** — WWT's own agentic digital assistant, already "trained on deep organizational knowledge, securely embedded across workflows." Atom is the obvious substrate for the customer-facing advisor described in §2, point 3.

The strategic implication: **the ATC doesn't need to build a new platform from scratch — it needs to expose, harden, and commercialize the platform it already runs on internally.** That reframes this project from "build a demo app" to "build the productization layer over POCDOC + TestRunner + AMS + Atom" — a much faster, much more credible path to revenue.

## 4. AI as the Transformation Engine — Concretely

Every layer of the ATC's cost structure and product opportunity has a specific AI lever. Be specific about these when building — avoid generic "AI will help" language in the app itself:

- **PoC authoring** → Atom/agentic drafting of POCDOC-conformant test plans from a customer's stated requirements in minutes instead of the analyst-hours it takes today (this mirrors what the internal `atc-pocdoc-author` and `atc-pocdoc-intake` workflows already do for customer-supplied files).
- **Test execution** → TestRunner-style task lists generated and triaged autonomously; failed runs get first-pass root-cause analysis before a human engineer ever looks at them.
- **Adjudication** → AI proposes pass/fail/inconclusive verdicts with cited evidence (as `atc-pocdoc-evaluate` already does), with a human approving rather than authoring from scratch — this alone is the single biggest lever on the $50M labor cost base.
- **Capacity & scheduling** → AMS asset data plus predictive demand modeling to auto-provision and auto-teardown lab environments, killing idle rack/VM time — the second biggest cost lever, and the one that most directly funds margin expansion as external volume grows.
- **The advisor product** → a customer- and partner-facing Atom instance, scoped to the anonymized, aggregated outcome corpus, that answers "which of these three architectures actually held up under load in real deployments" — the sellable intelligence layer from §2.
- **OEM intelligence** → the same evidence corpus, sold back to the 200+ OEM partners as a paid insights product: "how does your platform actually perform against competitors in independent, blinded testing" is something NVIDIA, Cisco, Dell, and others should be paying for, not getting for free as a byproduct of WWT's sales motion.

## 5. The Commercial Product: What "Off-the-Shelf ATC" Looks Like

Reframe the ATC's five public-facing pillars (AI Proving Ground, Cyber Range, Lab Hosting, Labs & Learning, Proof of Concept) as **tiers of one product**, sold directly, self-service where possible, sales-assisted where the deal size warrants it:

1. **ATC Explorer (self-serve, PLG entry point).** Free or low-cost sandboxed access to a subset of pre-built labs and reference architectures, credit-card checkout, no WWT rep required. This is the top-of-funnel Cisco dCloud and Dell never turned into a business — WWT does.
2. **ATC PoC-as-a-Service (the core paid product).** Customers submit a requirement; Atom drafts a POCDOC-conformant test plan; the customer approves scope and price; TestRunner executes against real multi-OEM infrastructure; results are adjudicated and delivered as a signed, vendor-neutral report. Priced per engagement (flat fee by complexity tier) or via a subscription bucket of PoC credits for enterprises and integrators running many small evaluations.
3. **ATC Cyber Range-as-a-Service.** Already has a natural training/certification revenue model (CTF-style events, seat licenses for enterprise security teams) — this is the fastest tier to monetize because the packaging work is smallest.
4. **ATC Intelligence (the high-margin layer).** Subscription access to the aggregated insights/advisor product from §2 and §4 — sold to enterprise buyers making infrastructure decisions, to systems integrators who don't have their own ATC, and to OEMs as a paid benchmarking and competitive-intelligence product.
5. **ATC OEM Partner Program (supply-side revenue).** OEMs pay for placement, co-branded reference architectures, and guaranteed lab capacity/visibility — turning the 200+ OEM relationship from a cost-sharing arrangement into a revenue line, similar in spirit to how AWS/Azure marketplaces monetize ISV placement.

The unifying design principle: **every tier should be buyable without a WWT services engagement attached**, even though most large customers will still end up wanting one. Standalone-business credibility requires the product to work without the sales org in the room.

## 6. Path to a $100M Standalone Business

Directional model only (flag for real finance review — see §8). The logic, not the precision, is what matters for the build:

- **Today:** ~$50M/year fully-loaded internal cost, funded as pre-sales overhead, $0 direct revenue recognition, value captured indirectly through influenced services/product sales.
- **Phase 1 (Year 1) — Instrument and expose.** Stand up ATC Explorer and ATC Cyber Range-as-a-Service on top of existing capabilities; start charging for what customers already ask to buy informally (extended lab access, dedicated PoC slots, training seats). Target: $10–15M in direct revenue, funded largely by better utilization of existing infrastructure rather than new spend. This phase is really about proving people will pay directly for something they currently get "free" as a WWT customer.
- **Phase 2 (Year 2) — Automate the cost base.** Roll out the AI layers in §4 against POCDOC/TestRunner/AMS to cut the marginal cost of running an incremental PoC by a large margin (idle-capacity recovery + adjudication automation are the two biggest levers). This is what allows PoC-as-a-Service to be priced competitively against the $75–150K/8–12-week DIY alternative enterprises face today, while still carrying strong margin. Target: revenue run-rate $35–45M, and — critically — the *internal* $50M cost base starts flattening or shrinking in absolute terms even as external volume grows.
- **Phase 3 (Year 3) — Sell the intelligence layer and open the partner program.** ATC Intelligence subscriptions and the OEM Partner Program go live; this is the highest-margin revenue and the part that makes the business defensible rather than just a cheaper lab-rental service. Target: $70–100M combined run-rate, with ATC Intelligence + OEM Partner Program contributing a disproportionate share of gross margin relative to their share of revenue.
- **Structural bet underneath all three phases:** the AI automation in Phase 2 has to fund enough of the existing $50M cost base that the business can credibly claim it is *self-funding its own transformation* rather than requesting new investment — that is the argument that gets a standalone P&L and a general manager approved internally.

## 7. What the Application Should Actually Be (Build Direction for Claude Code)

Given §3, this is not a green-field build — it's a **productization and exposure layer**. Design accordingly:

- **Core entities** (map directly to POCDOC's existing data model where possible, don't reinvent it): `Engagement`/`PoC Request`, `Test Plan` (POCDOC-conformant), `Test Case`, `Task List` (TestRunner-shaped: service type, validators, transformers), `Run` (execution instance with evidence artifacts), `Verdict` (pass/fail/inconclusive + cited evidence), `Asset` (from AMS: tag, serial, location, org/owner), `Customer`/`Org`, `Subscription`/`Credit Balance`, `Partner` (OEM-facing).
- **MVP scope (Phase 1 candidate):** a self-service front door — customer submits a requirement in plain language → Atom-style agent drafts a POCDOC-conformant test plan → customer reviews/approves scope and sees a price → request queues against real or simulated lab capacity → status dashboard through to a delivered, signed report. Build this thin end-to-end before building any tier in depth.
- **Second slice:** the internal ops console — capacity/utilization view over AMS-style asset data, queue and SLA visibility for lab ops staff, and the automated-adjudication review queue (AI proposes verdict + evidence, human approves) — because this is what funds Phase 2 of the cost model in §6.
- **Third slice:** the Intelligence layer — aggregated, anonymized query interface over historical engagement outcomes ("how has X performed against Y across N engagements"), gated behind the paid subscription tier.
- **Tech posture:** favor an architecture that can sit *in front of* existing POCDOC/TestRunner/AMS systems via API rather than replacing them — this is an integration and productization play, not a rebuild. Treat those systems' MCP tool contracts (already visible in this environment) as the closest thing to a live API spec available today.
- **Don't build:** a generic "AI lab" demo unconnected to POCDOC/TestRunner semantics. The credibility of this product depends entirely on it being visibly the same rigor WWT already applies internally, exposed outward — not a marketing veneer.

## 8. Assumptions, Gaps, and What to Verify Before This Goes to Leadership

This file was deliberately built without email or internal-drive access (by the author's choice, to move fast). Before this becomes a real business case, get real numbers on:

- The actual current-year ATC budget breakdown (labor vs. infrastructure vs. licensing) — the $50M figure was given as-is and not decomposed.
- Real utilization data from AMS (rack/VM idle time) — Phase 2's savings case in §6 depends entirely on how much slack capacity actually exists today.
- Legal/contractual constraints on reselling OEM-partnered lab capacity and on publishing comparative/benchmarking results about OEM products (the ATC Intelligence and OEM Partner Program tiers in particular need a hard look here).
- Whether POCDOC/TestRunner/AMS have the multi-tenancy, security, and data-isolation posture required to expose them (even indirectly) to external, non-WWT-employee users.
- Pricing validation with 3–5 real prospective customers before locking the tiers in §5 — the $75–150K DIY PoC benchmark is a market average, not a WWT-specific willingness-to-pay data point.

---

**Working title for the application:** *ATC.ai* — deliberately not "ATC Portal" or "ATC Store." The name should signal that the product *is* the AI-curated judgment layer, not just cheaper access to lab hardware.
