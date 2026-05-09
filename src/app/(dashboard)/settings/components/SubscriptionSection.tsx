"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import type { Plan, Subscription } from "@/lib/db/schema";
import type { SubscriptionStats } from "@/modules/subscriptions/subscription.service";

interface Props {
  subscription: Subscription | null;
  plan: Plan | null;
  stats: SubscriptionStats | null;
  allPlans: Plan[];
}

const PLAN_BADGE: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700 border-slate-200",
  business: "bg-blue-100 text-blue-700 border-blue-200",
  enterprise: "bg-amber-100 text-amber-700 border-amber-200",
};

const PLAN_CARD_HIGHLIGHT: Record<string, string> = {
  starter: "border-slate-400",
  business: "border-blue-500",
  enterprise: "border-amber-500",
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["15 employés max", "1 site", "QR Code + GPS", "Support email"],
  business: ["50 employés max", "3 sites", "QR Code + GPS + Wi-Fi", "Support prioritaire"],
  enterprise: ["Employés illimités", "Sites illimités", "Toutes les fonctionnalités", "Support dédié"],
};

function formatFcfa(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

function UpgradePlanModal({
  allPlans,
  currentPlanName,
  onClose,
}: {
  allPlans: Plan[];
  currentPlanName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!selectedPlanId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: selectedPlanId, billing_cycle: billing }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Erreur lors du changement de plan.");
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Changer de plan
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Toggle mensuel / annuel */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${
                billing === "monthly" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Mensuel
            </span>
            <button
              onClick={() =>
                setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                billing === "yearly" ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  billing === "yearly" ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billing === "yearly" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Annuel{" "}
              <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                2 mois offerts
              </span>
            </span>
          </div>

          {/* Plans */}
          <div className="grid gap-4 sm:grid-cols-3">
            {allPlans.map((p) => {
              const isCurrentPlan = p.name === currentPlanName;
              const isSelected = selectedPlanId === p.id;
              const monthlyPrice = p.price_monthly;
              const displayPrice =
                billing === "yearly"
                  ? Math.round((monthlyPrice * 10) / 12)
                  : monthlyPrice;
              const yearlyTotal = monthlyPrice * 10;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? PLAN_CARD_HIGHLIGHT[p.name] ?? "border-primary"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {isCurrentPlan && (
                    <span className="absolute right-2 top-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Actuel
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </span>
                  )}

                  <p className="mt-4 text-sm font-semibold capitalize text-card-foreground">
                    {p.name}
                  </p>
                  <p className="mt-1 text-lg font-bold text-card-foreground">
                    {formatFcfa(displayPrice)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /mois
                    </span>
                  </p>
                  {billing === "yearly" && (
                    <p className="text-xs text-muted-foreground">
                      {formatFcfa(yearlyTotal)} / an
                    </p>
                  )}

                  <ul className="mt-3 space-y-1.5">
                    {(PLAN_FEATURES[p.name] ?? []).map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                    {p.max_employees !== null && (
                      <li className="text-xs text-muted-foreground">
                        + {formatFcfa(p.extra_employee_price)}/employé suppl.
                      </li>
                    )}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlanId || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionSection({ subscription, plan, stats, allPlans }: Props) {
  const [showModal, setShowModal] = useState(false);

  if (!subscription || !plan || !stats) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-8 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Aucun abonnement associé à cette entreprise.
        </p>
      </div>
    );
  }

  const isTrial = subscription.status === "trial";
  const isExpired =
    subscription.status === "expired" || subscription.status === "cancelled";

  const employeePercent =
    stats.max_employees !== null && stats.max_employees > 0
      ? Math.min(100, Math.round((stats.current_employees / stats.max_employees) * 100))
      : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-card-foreground">
              Mon abonnement
            </h2>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                PLAN_BADGE[plan.name] ?? "bg-muted text-muted-foreground border-border"
              }`}
            >
              {plan.name}
            </span>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Bannières statut */}
          {isTrial && (
            <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Période d&apos;essai — {stats.days_remaining} jour
                  {stats.days_remaining !== 1 ? "s" : ""} restant
                  {stats.days_remaining !== 1 ? "s" : ""}
                </p>
                <p className="mt-0.5 text-xs text-orange-700">
                  Passez à un plan payant pour continuer après la fin du trial.
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm font-medium text-destructive">
                Abonnement expiré. Contactez-nous pour renouveler.
              </p>
            </div>
          )}

          {!isTrial && !isExpired && (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Abonnement actif — {stats.days_remaining} jour
                {stats.days_remaining !== 1 ? "s" : ""} restant
                {stats.days_remaining !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Utilisation employés */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-card-foreground">Employés</span>
              <span className="text-muted-foreground">
                {stats.current_employees}
                {stats.max_employees !== null
                  ? ` / ${stats.max_employees}`
                  : " / illimité"}
              </span>
            </div>
            {stats.max_employees !== null && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    employeePercent >= 90
                      ? "bg-destructive"
                      : employeePercent >= 70
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${employeePercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Tableau comparatif */}
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Plan
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    Prix/mois
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    Employés
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    Sites
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allPlans.map((p) => {
                  const isCurrent = p.id === plan.id;
                  return (
                    <tr
                      key={p.id}
                      className={isCurrent ? "bg-primary/5" : ""}
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-medium capitalize text-card-foreground">
                          {p.name}
                        </span>
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Actuel
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {formatFcfa(p.price_monthly)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {p.max_employees ?? "∞"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {p.max_sites ?? "∞"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Changer de plan
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <UpgradePlanModal
          allPlans={allPlans}
          currentPlanName={plan.name}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
