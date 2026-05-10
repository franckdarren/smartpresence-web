"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  CreditCard,
} from "lucide-react";
import type { Plan } from "@/lib/db/schema";
import { SubmitPaymentModal } from "./SubmitPaymentModal";

type PaymentRequestStatus = "pending" | "approved" | "rejected";

interface PaymentRequestRow {
  id: string;
  plan_id: string;
  billing_cycle: "monthly" | "yearly";
  amount: number;
  status: PaymentRequestStatus;
  notes: string | null;
  created_at: string | Date | null;
}

interface Props {
  requests: PaymentRequestRow[];
  plans: Plan[];
  currentPlanName: string;
}

const STATUS_CONFIG: Record<
  PaymentRequestStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: {
    label: "En attente",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    icon: Clock,
  },
  approved: {
    label: "Approuvé",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejeté",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: XCircle,
  },
};

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

export function PaymentRequestsHistory({ requests, plans, currentPlanName }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmitted() {
    setShowModal(false);
    setSubmitted(true);
  }

  const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Paiements manuels
          </h2>
          <button
            onClick={() => { setShowModal(true); setSubmitted(false); }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Upload className="h-4 w-4" />
            Soumettre un paiement
          </button>
        </div>

        {submitted && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Demande envoyée. Notre équipe la traitera sous 24h ouvrées.
          </div>
        )}

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aucune demande de paiement pour le moment.
            </p>
            <p className="text-xs text-muted-foreground">
              Soumettez votre preuve de paiement pour activer ou renouveler votre abonnement.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cycle
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((r) => {
                  const cfg = STATUS_CONFIG[r.status];
                  const StatusIcon = cfg.icon;
                  const plan = planMap[r.plan_id];
                  return (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-card-foreground">
                        {plan ? (PLAN_NAMES[plan.name] ?? plan.name) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.billing_cycle === "monthly" ? "Mensuel" : "Annuel"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-card-foreground">
                        {r.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </div>
                        {r.status === "rejected" && r.notes && (
                          <p className="mt-1 text-center text-xs text-muted-foreground">
                            {r.notes}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <SubmitPaymentModal
          plans={plans}
          currentPlanName={currentPlanName}
          onClose={() => setShowModal(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </>
  );
}
