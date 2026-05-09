"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import type { Plan, Subscription } from "@/lib/db/schema";
import { EditSubscriptionModal } from "./EditSubscriptionModal";

type SubscriptionRow = Subscription & { plan: Plan; company_name: string };

const PLAN_BADGE: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700",
  business: "bg-blue-100 text-blue-700",
  enterprise: "bg-amber-100 text-amber-700",
};

const STATUS_BADGE: Record<string, string> = {
  trial: "bg-orange-100 text-orange-700",
  active: "bg-emerald-100 text-emerald-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const STATUS_LABEL: Record<string, string> = {
  trial: "Trial",
  active: "Actif",
  expired: "Expiré",
  cancelled: "Annulé",
};

function daysRemaining(date: Date | null | string): number {
  if (!date) return 0;
  const diffMs = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}

interface Props {
  subscriptions: SubscriptionRow[];
  plans: Plan[];
}

export function SubscriptionsTable({ subscriptions, plans }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<SubscriptionRow | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  "Entreprise",
                  "Plan",
                  "Statut",
                  "Employés suppl.",
                  "Fin de période",
                  "Jours restants",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => {
                const endDate =
                  sub.status === "trial"
                    ? sub.trial_ends_at
                    : sub.current_period_end;
                const days = daysRemaining(endDate);

                return (
                  <tr key={sub.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">
                      {sub.company_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          PLAN_BADGE[sub.plan.name] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {sub.plan.name.charAt(0).toUpperCase() +
                          sub.plan.name.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_BADGE[sub.status] ?? ""
                        }`}
                      >
                        {STATUS_LABEL[sub.status] ?? sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {sub.extra_employees > 0
                        ? `+${sub.extra_employees}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {endDate
                        ? new Date(endDate).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={
                          days <= 7
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {sub.status === "expired" ||
                        sub.status === "cancelled"
                          ? "—"
                          : `${days}j`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setEditing(sub)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <Pencil className="h-3 w-3" />
                        Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditSubscriptionModal
          subscription={editing}
          plans={plans}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
