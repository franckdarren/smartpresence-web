"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  Inbox,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  ReviewPaymentModal,
  type PaymentRequestRow,
} from "./ReviewPaymentModal";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

const STATUS_CONFIG = {
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
} as const;

export function PaymentRequestsSection() {
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PaymentRequestRow | null>(null);
  const [filter, setFilter] = useState<"all" | "pending">("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/superadmin/payment-requests");
      const json = await res.json();
      if (json.success) setRequests(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleReviewed() {
    setSelected(null);
    load();
    router.refresh();
  }

  const filtered =
    filter === "pending"
      ? requests.filter((r) => r.status === "pending")
      : requests;

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">
              Demandes de paiement
            </h2>
            {pendingCount > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {pendingCount} en attente
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter(filter === "all" ? "pending" : "all")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              {filter === "pending" ? "Voir tout" : "Voir en attente"}
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-border bg-card py-12">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {filter === "pending"
                ? "Aucune demande en attente."
                : "Aucune demande de paiement."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Entreprise
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
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const cfg = STATUS_CONFIG[r.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-card-foreground">
                          {r.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.admin_email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-card-foreground">
                        {PLAN_NAMES[r.plan.name] ?? r.plan.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.billing_cycle === "monthly" ? "Mensuel" : "Annuel"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-card-foreground">
                        {r.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("fr-FR")
                          : "—"}
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
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(r)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {r.status === "pending" ? "Examiner" : "Détails"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ReviewPaymentModal
          request={selected}
          onClose={() => setSelected(null)}
          onReviewed={handleReviewed}
        />
      )}
    </>
  );
}
