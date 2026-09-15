# ATC.ai — The De-Risking Layer

Productization layer over WWT's Advanced Technology Center, built to the direction in
[CLAUDE.md](./CLAUDE.md): expose the proving ground the ATC already runs internally
(POCDOC · TestRunner · AMS · Atom) as a self-service commercial product.

## What's implemented

**Marketplace** (`/marketplace`)
AWS Marketplace-style console listing the product catalog (`src/lib/catalog.ts`) with working
search, filter rail, and sorting. The landing page at `/` funnels into it.

**Slice 1 — PoC front door** (`/request/new`, `/engagements`)
Plain-language requirement → an Atom-style drafting agent returns a POCDOC-conformant test
plan (sections → test cases → steps/expected → TestRunner-shaped task lists with typed
service types and validators) with a fixed price by complexity tier. Customer approves scope;
AMS assets are reserved; execution advances live through provisioning → running →
adjudicating → a signed, vendor-neutral report with cited evidence.

**Slice 2 — Hosted Lab dashboard** (`/ops`)
Customer-facing hosted-lab console (colocation-style Lab Hosting): Overview with stat cards,
support cases, and a Status/Summary rail; Assets tab with AMS capacity/utilization (including
the annualized idle-capacity cost — the Phase 2 recovery lever); Lab Projects tab with the live
engagement queue and the adjudication review queue (AI proposes each verdict with evidence, an
engineer approves or overrides, then signs the report); Cases and Members tabs.

**Slice 3 — ATC Intelligence** (`/intelligence`)
Subscription-gated head-to-head queries over an anonymized corpus of adjudicated outcomes:
pass rates, performance scores, and observed failure modes by domain and workload.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. State persists to `.data/db.json` (gitignored); delete it to reset
the demo, including reseeding the synthetic corpus and asset inventory.

## Architecture notes

- **Integration play, not a rebuild.** Entities in `src/lib/types.ts` mirror POCDOC
  (plans/cases/verdicts), TestRunner (task lists, service types, validators), and AMS (assets).
  The seams where live systems plug in are explicit:
  - `src/lib/drafter.ts` — `PlanDrafter` interface; production swaps in Atom / the
    `atc-pocdoc-author` workflow over its MCP contract.
  - `src/lib/engine.ts` — execution/adjudication simulator; production replaces this with
    TestRunner run polling and the `atc-pocdoc-evaluate` verdict proposals.
  - `src/lib/db.ts` — JSON-file store; production reads/writes become API calls into the
    systems of record.
- All execution, evidence, verdicts, and the intelligence corpus are **simulated** (deterministic,
  seeded) — but simulated behind the real systems' shapes, so wiring in live backends changes
  the adapters, not the product.
- Next.js App Router, server components + server actions, Tailwind v4. No external services.

## Before this goes anywhere real

See CLAUDE.md §8 — the dollar figures are directional planning assumptions, and multi-tenancy,
data-isolation, and OEM benchmarking-rights questions must be answered before external exposure.
