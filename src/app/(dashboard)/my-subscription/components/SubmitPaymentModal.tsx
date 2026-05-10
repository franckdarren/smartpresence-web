"use client";

import { useState, useRef } from "react";
import { X, Loader2, Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Plan } from "@/lib/db/schema";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

interface Props {
  plans: Plan[];
  currentPlanName: string;
  defaultPlanId?: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function formatAmount(price: number, cycle: "monthly" | "yearly") {
  const amount = cycle === "monthly" ? price : price * 10;
  return amount.toLocaleString("fr-FR") + " FCFA";
}

export function SubmitPaymentModal({ plans, currentPlanName, defaultPlanId, onClose, onSubmitted }: Props) {
  const [planId, setPlanId] = useState(defaultPlanId ?? plans[0]?.id ?? "");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedPlan = plans.find((p) => p.id === planId);

  async function handleSubmit() {
    if (!file) {
      setError("Veuillez joindre une preuve de paiement.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("plan_id", planId);
      form.append("billing_cycle", billingCycle);
      form.append("proof", file);

      const res = await fetch("/api/v1/payment-requests", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Erreur lors de la soumission");
        return;
      }
      toast.success("Demande de paiement soumise. Traitement sous 24h ouvrées.");
      onSubmitted();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Soumettre un paiement
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Plan */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Plan souhaité
            </label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className={inputClass}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {PLAN_NAMES[p.name] ?? p.name} —{" "}
                  {p.price_monthly.toLocaleString("fr-FR")} FCFA/mois
                </option>
              ))}
            </select>
          </div>

          {/* Cycle */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Cycle de facturation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["monthly", "yearly"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBillingCycle(c)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    billingCycle === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {c === "monthly" ? "Mensuel" : "Annuel (−17%)"}
                </button>
              ))}
            </div>
          </div>

          {/* Montant calculé */}
          {selectedPlan && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Montant à payer</p>
              <p className="text-xl font-bold text-card-foreground">
                {formatAmount(selectedPlan.price_monthly, billingCycle)}
              </p>
              {billingCycle === "yearly" && (
                <p className="text-xs text-emerald-600">
                  Économie de {(selectedPlan.price_monthly * 2).toLocaleString("fr-FR")} FCFA
                </p>
              )}
            </div>
          )}

          {/* Instructions de paiement */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300 space-y-1">
            <p className="font-semibold">Instructions de paiement</p>
            <p>Effectuez votre virement ou paiement mobile money, puis joignez la capture d&apos;écran ou le reçu ci-dessous.</p>
            <p className="font-medium">Référence à mentionner : SmartPresence + votre email admin</p>
          </div>

          {/* Upload preuve */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Preuve de paiement <span className="text-destructive">*</span>
            </label>
            <div
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                file
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                  : "border-border hover:border-primary hover:bg-primary/5"
              }`}
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <>
                  <CheckCircle className="h-7 w-7 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} Ko — cliquer pour changer
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquer pour choisir un fichier
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP ou PDF — max 5 Mo
                  </p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Note d'information */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Votre demande sera examinée par notre équipe sous 24h ouvrées.
              Vous serez notifié par email une fois validée.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !file}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Envoyer la preuve
          </button>
        </div>
      </div>
    </div>
  );
}
