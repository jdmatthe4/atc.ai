import { RequestForm } from "./RequestForm";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">ATC Proof of Concept</p>
      <h1 className="text-3xl font-bold tracking-tight">What do you need to prove?</h1>
      <p className="mt-3 text-muted">
        Describe the technology decision in plain language — the workload, the candidates you&apos;re weighing,
        and what &quot;good&quot; looks like. The drafting agent returns a POCDOC-conformant test plan with a
        fixed price for your approval. Nothing runs and nothing is billed until you approve the scope.
      </p>
      <RequestForm />
    </div>
  );
}
