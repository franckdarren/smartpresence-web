"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Plan, Subscription } from "@/lib/db/schema";

type SubscriptionRow = Subscription & { plan: Plan; company_name: string };

interface Props {
  subscription: SubscriptionRow;
  plans: Plan[];
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function EditSubscriptionModal({
  subscription,
  plans,
  onClose,
  onSaved,
}: Props) {
  const [status, setStatus] = useState(subscription.status);
  const [planId, setPlanId] = useState(subscription.plan_id);
  const [billingCycle, setBillingCycle] = useState(subscription.billing_cycle);
  const [extraEmployees, setExtraEmployees] = useState(
    String(subscription.extra_employees)
  );
  const [periodEnd, setPeriodEnd] = useState(
    subscription.current_period_end
      ? new Date(subscription.current_period_end).toISOString().slice(0, 16)
      : ""
  );
  const [trialEnd, setTrialEnd] = useState(
    subscription.trial_ends_at
      ? new Date(subscription.trial_ends_at).toISOString().slice(0, 16)
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/superadmin/subscriptions/${subscription.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            plan_id: planId,
            billing_cycle: billingCycle,
            extra_employees: parseInt(extraEmployees, 10) || 0,
            current_period_end: periodEnd
              ? new Date(periodEnd).toISOString()
              : undefined,
            trial_ends_at: trialEnd
              ? new Date(trialEnd).toISOString()
              : null,
          }),
        }
      );
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Erreur lors de la sauvegarde");
        return;
      }
      toast.success("Abonnement modifié avec succès.");
      onSaved();
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
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-border bg-card shadow-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Modifier l&apos;abonnement — {subscription.company_name}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Plan
            </label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className={inputClass}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.charAt(0).toUpperCase() + p.name.slice(1)} —{" "}
                  {p.price_monthly.toLocaleString("fr-FR")} FCFA/mois
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Statut
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as typeof status)
              }
              className={inputClass}
            >
              <option value="trial">Trial</option>
              <option value="active">Actif</option>
              <option value="expired">Expiré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Cycle de facturation
            </label>
            <select
              value={billingCycle}
              onChange={(e) =>
                setBillingCycle(e.target.value as "monthly" | "yearly")
              }
              className={inputClass}
            >
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Employés supplémentaires facturés
            </label>
            <input
              type="number"
              min={0}
              value={extraEmployees}
              onChange={(e) => setExtraEmployees(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Fin de période
            </label>
            <input
              type="datetime-local"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Fin de trial (laisser vide si non applicable)
            </label>
            <input
              type="datetime-local"
              value={trialEnd}
              onChange={(e) => setTrialEnd(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
