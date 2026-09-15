"use client";

import { useState, useTransition } from "react";
import { submitRequest } from "@/app/actions";

const EXAMPLES: Array<{ label: string; text: string }> = [
  {
    label: "LLM inference: NVIDIA vs Dell",
    text: "We need to choose a GPU platform for LLM inference serving ~2,000 concurrent internal users. Comparing NVIDIA-based reference architecture against Dell's GPU nodes. Care most about sustained tokens/sec, p99 latency under load, and behavior when a node fails mid-run.",
  },
  {
    label: "Zero-trust firewall bake-off",
    text: "Evaluating Palo Alto Networks vs Fortinet for a zero-trust segmentation rollout across 40 sites. Need proof of policy enforcement parity, ransomware containment behavior, and TLS-inspection throughput at our production cipher mix.",
  },
  {
    label: "Data center fabric refresh",
    text: "Refreshing our data center network: Cisco vs Arista for an EVPN/VXLAN leaf-spine fabric. Key questions are 400G east-west throughput, convergence time on spine failure, and streaming telemetry quality for our NOC tooling.",
  },
  {
    label: "Storage for AI datasets",
    text: "Need a storage decision for AI dataset staging: NetApp vs Pure Storage. Mixed-IO latency under controller failure and replication RPO over an impaired WAN link are the deciding factors.",
  },
];

export function RequestForm() {
  const [requirement, setRequirement] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => submitRequest(fd))}
      className="mt-8 space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Organization</span>
          <input
            name="org"
            required
            placeholder="Acme Financial"
            className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-info"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Contact email</span>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-info"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Requirement</span>
        <textarea
          name="requirement"
          required
          rows={7}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="What decision are you trying to make, between which candidates, and what does success look like?"
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted/60 focus:border-info"
        />
      </label>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Or start from an example</div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setRequirement(ex.text)}
              className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-muted transition-colors hover:border-info hover:text-ink"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Drafting your test plan…" : "Draft my test plan"}
      </button>
      <p className="text-xs text-muted">
        Drafting is free. You&apos;ll review the full plan — sections, test cases, validators — and the fixed
        price before anything is scheduled.
      </p>
    </form>
  );
}
