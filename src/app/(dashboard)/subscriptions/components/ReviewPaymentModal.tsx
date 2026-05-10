"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import type { Plan } from "@/lib/db/schema";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

export interface PaymentRequestRow {
  id: string;
  company_id: string;
  plan_id: string;
  billing_cycle: "monthly" | "yearly";
  amount: number;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  proof_url: string | null;
  created_at: string | Date | null;
  plan: Plan;
  company_name: string;
  admin_email: string;
}

interface Props {
  request: PaymentRequestRow;
  onClose: () => void;
  onReviewed: () => void;
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function ReviewPaymentModal({ request, onClose, onReviewed }: Props) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: "approve" | "reject") {
    if (action === "reject" && !notes.trim()) {
      setError("Veuillez indiquer la raison du rejet.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/superadmin/payment-requests/${request.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, notes: notes.trim() || undefined }),
        }
      );
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Erreur lors du traitement");
        return;
      }
      onReviewed();
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
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Examiner la demande — {request.company_name}
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

          {/* Détails de la demande */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Entreprise</p>
              <p className="font-medium text-card-foreground">{request.company_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admin</p>
              <p className="font-medium text-card-foreground">{request.admin_email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan demandé</p>
              <p className="font-medium text-card-foreground">
                {PLAN_NAMES[request.plan.name] ?? request.plan.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cycle</p>
              <p className="font-medium text-card-foreground">
                {request.billing_cycle === "monthly" ? "Mensuel" : "Annuel"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Montant</p>
              <p className="text-lg font-bold text-card-foreground">
                {request.amount.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date de soumission</p>
              <p className="font-medium text-card-foreground">
                {request.created_at
                  ? new Date(request.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Preuve de paiement */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-card-foreground">
              Preuve de paiement
            </p>
            {request.proof_url ? (
              <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                {request.proof_url.endsWith(".pdf") ? (
                  <a
                    href={request.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir le PDF dans un nouvel onglet
                  </a>
                ) : (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={request.proof_url}
                      alt="Preuve de paiement"
                      className="max-h-64 w-full object-contain"
                    />
                    <a
                      href={request.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Agrandir
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Impossible de charger la preuve.
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-card-foreground">
              Notes <span className="text-muted-foreground">(obligatoire si rejet)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex : paiement reçu, ou raison du rejet…"
              className={inputClass + " resize-none"}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Fermer
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Rejeter
          </button>
          <button
            onClick={() => handleAction("approve")}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Approuver et activer
          </button>
        </div>
      </div>
    </div>
  );
}
