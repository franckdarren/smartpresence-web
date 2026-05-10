"use client";

import { useState } from "react";
import { Zap, CheckCircle } from "lucide-react";
import type { Plan } from "@/lib/db/schema";
import { SubmitPaymentModal } from "./SubmitPaymentModal";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    "Jusqu'à 15 employés",
    "1 site / 1 QR Code",
    "Pointage GPS + Wi-Fi",
    "Dashboard admin basique",
    "Support email",
  ],
  business: [
    "Jusqu'à 50 employés",
    "Jusqu'à 3 sites / 3 QR Codes",
    "Pointage GPS + Wi-Fi",
    "Dashboard complet + exports Excel",
    "Historique 12 mois",
    "Support WhatsApp",
  ],
  enterprise: [
    "Employés illimités",
    "Sites & QR Codes illimités",
    "API REST complète",
    "Rapports avancés + exports personnalisés",
    "Historique illimité",
    "Support téléphonique dédié + onboarding",
  ],
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

interface Props {
  plans: Plan[];
  currentPlanName: string;
  isTrial: boolean;
  isExpired: boolean;
}

export function PlansGrid({ plans, currentPlanName, isTrial, isExpired }: Props) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Cache le plan actuel sauf si l'abonnement est expiré (pour permettre de re-souscrire)
  const visiblePlans = isExpired
    ? plans
    : plans.filter((p) => p.name !== currentPlanName);

  // Plans filtrés pour le dropdown du modal (sans le plan actuel)
  const upgradeablePlans = plans.filter((p) => p.name !== currentPlanName);

  function openModal(planId: string) {
    setSubmitted(false);
    setSelectedPlanId(planId);
  }

  function handleSubmitted() {
    setSelectedPlanId(null);
    setSubmitted(true);
  }

  return (
    <>
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          {isExpired ? "Choisir un plan pour réactiver" : "Passer à un autre plan"}
        </h2>

        {submitted && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Demande envoyée. Retrouvez son statut dans la section &quot;Paiements manuels&quot; ci-dessous.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((p) => {
            const isHighlighted = p.name === "business";
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
                  isHighlighted ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                {isHighlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Recommandé
                  </span>
                )}
                <div className="mb-4 space-y-1">
                  <h3 className="font-semibold text-card-foreground">
                    {PLAN_NAMES[p.name] ?? p.name}
                  </h3>
                  <p className="text-2xl font-bold text-card-foreground">
                    {fmt(p.price_monthly)}
                    <span className="text-sm font-normal text-muted-foreground">/mois</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ou {fmt(p.price_monthly * 10)}/an
                    <span className="ml-1 text-emerald-600">(−2 mois offerts)</span>
                  </p>
                </div>

                <ul className="mb-5 flex-1 space-y-1.5">
                  {(PLAN_FEATURES[p.name] ?? []).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => openModal(p.id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${
                    isHighlighted
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  {isExpired ? "Choisir" : "Passer à"} {PLAN_NAMES[p.name] ?? p.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPlanId !== null && (
        <SubmitPaymentModal
          plans={upgradeablePlans}
          currentPlanName={currentPlanName}
          defaultPlanId={selectedPlanId}
          onClose={() => setSelectedPlanId(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </>
  );
}
