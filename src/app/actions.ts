"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, persist } from "@/lib/db";
import { atomDrafter } from "@/lib/drafter";
import { syncEngagement } from "@/lib/engine";
import type { Engagement } from "@/lib/types";

export async function submitRequest(formData: FormData) {
  const org = String(formData.get("org") ?? "").trim();
  const contactEmail = String(formData.get("email") ?? "").trim();
  const requirement = String(formData.get("requirement") ?? "").trim();
  if (!org || !requirement) return;

  const { plan, tier } = atomDrafter.draft(requirement, org);
  const engagement: Engagement = {
    id: `ENG-${Date.now().toString(36).toUpperCase()}`,
    org,
    contactEmail,
    requirement,
    tier,
    plan,
    status: "draft",
    createdAt: Date.now(),
    assetTags: [],
  };
  getDb().engagements.unshift(engagement);
  persist();
  redirect(`/engagements/${engagement.id}`);
}

function findEngagement(id: string): Engagement | undefined {
  return getDb().engagements.find((e) => e.id === id);
}

export async function approvePlan(id: string) {
  const e = findEngagement(id);
  if (!e || e.status !== "draft") return;
  const db = getDb();
  // Reserve idle AMS assets matching the plan's OEM set (falls back to any idle gear).
  const wanted = new Set(e.plan.oems);
  const idle = db.assets.filter((a) => a.status === "idle");
  const matched = idle.filter((a) => wanted.has(a.oem));
  const picked = [...matched, ...idle.filter((a) => !wanted.has(a.oem))].slice(0, 6);
  for (const a of picked) a.status = "allocated";
  e.assetTags = picked.map((a) => a.tag);
  e.status = "provisioning";
  e.approvedAt = Date.now();
  persist();
  revalidatePath(`/engagements/${id}`);
  revalidatePath("/engagements");
  revalidatePath("/ops");
}

export async function declinePlan(id: string) {
  const e = findEngagement(id);
  if (!e || e.status !== "draft") return;
  e.status = "declined";
  persist();
  revalidatePath(`/engagements/${id}`);
  revalidatePath("/engagements");
}

export async function adjudicateCase(
  engagementId: string,
  caseId: string,
  decision: "approve" | "override-pass" | "override-fail"
) {
  const e = findEngagement(engagementId);
  if (!e) return;
  syncEngagement(e);
  const tc = e.plan.sections.flatMap((s) => s.cases).find((c) => c.id === caseId);
  if (!tc?.proposedVerdict || tc.finalVerdict) return;
  const base = tc.proposedVerdict;
  tc.finalVerdict = {
    ...base,
    outcome: decision === "approve" ? base.outcome : decision === "override-pass" ? "pass" : "fail",
    overridden: decision !== "approve",
    proposedBy: decision === "approve" ? base.proposedBy : "human",
    approvedBy: "ATC Lab Ops",
    approvedAt: Date.now(),
  };
  syncEngagement(e);
  persist();
  revalidatePath("/ops");
  revalidatePath(`/engagements/${engagementId}`);
  revalidatePath("/engagements");
}

export async function approveAllVerdicts(engagementId: string) {
  const e = findEngagement(engagementId);
  if (!e) return;
  syncEngagement(e);
  for (const tc of e.plan.sections.flatMap((s) => s.cases)) {
    if (tc.proposedVerdict && !tc.finalVerdict) {
      tc.finalVerdict = {
        ...tc.proposedVerdict,
        approvedBy: "ATC Lab Ops",
        approvedAt: Date.now(),
      };
    }
  }
  if (e.plan.sections.flatMap((s) => s.cases).every((c) => c.finalVerdict)) {
    e.status = "delivered";
    e.deliveredAt = Date.now();
    e.signedBy = "ATC Lab Ops — World Wide Technology";
  }
  persist();
  revalidatePath("/ops");
  revalidatePath(`/engagements/${engagementId}`);
  revalidatePath("/engagements");
}

export async function toggleIntelligence() {
  const db = getDb();
  db.intelligenceUnlocked = !db.intelligenceUnlocked;
  persist();
  revalidatePath("/intelligence");
}
