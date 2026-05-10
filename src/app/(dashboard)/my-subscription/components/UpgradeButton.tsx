"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { Plan } from "@/lib/db/schema";
import { SubmitPaymentModal } from "./SubmitPaymentModal";

interface Props {
  plans: Plan[];
  currentPlanName: string;
}

export function UpgradeButton({ plans, currentPlanName }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const upgradeablePlans = plans.filter((p) => p.name !== currentPlanName);
  const defaultPlanId = upgradeablePlans[0]?.id;

  if (!defaultPlanId) return null;

  return (
    <>
      {submitted ? (
        <p className="text-xs text-emerald-600 font-medium">
          Demande envoyée — traitement sous 24h.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Zap className="h-4 w-4" />
          Mettre à niveau
        </button>
      )}

      {open && (
        <SubmitPaymentModal
          plans={upgradeablePlans}
          currentPlanName={currentPlanName}
          defaultPlanId={defaultPlanId}
          onClose={() => setOpen(false)}
          onSubmitted={() => { setOpen(false); setSubmitted(true); }}
        />
      )}
    </>
  );
}
