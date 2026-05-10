import { redirect } from "next/navigation";
import { AuthService } from "@/modules/auth/auth.service";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { PaymentRequestService } from "@/modules/payment-requests/payment-request.service";
import { PaymentRequestsHistory } from "./components/PaymentRequestsHistory";
import { PlansGrid } from "./components/PlansGrid";
import { UpgradeButton } from "./components/UpgradeButton";
import {
  Clock,
  Users,
  CheckCircle,
  Mail,
  Building2,
  AlertCircle,
} from "lucide-react";

const service = new SubscriptionService();
const paymentService = new PaymentRequestService();

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

const PLAN_COLOR: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  business: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const STATUS_LABEL: Record<string, string> = {
  trial: "Essai gratuit",
  active: "Actif",
  expired: "Expiré",
  cancelled: "Annulé",
};

const STATUS_COLOR: Record<string, string> = {
  trial: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
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


export default async function MySubscriptionPage() {
  const user = await AuthService.getAuthenticatedUser();
  if (user.role !== "admin" || !user.company_id) redirect("/dashboard");

  const [data, plans, paymentRequests] = await Promise.all([
    service.getSubscriptionWithStats(user.company_id),
    service.getAllPlans(),
    paymentService.getByCompany(user.company_id),
  ]);

  if (!data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Aucun abonnement associé à votre entreprise.
        </p>
        <a
          href="mailto:support@smartpresence.app"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Mail className="h-4 w-4" />
          Contacter le support
        </a>
      </div>
    );
  }

  const { subscription, plan, stats } = data;
  const isTrial = subscription.status === "trial";
  const isExpired =
    subscription.status === "expired" || subscription.status === "cancelled";

  const endDate = isTrial ? subscription.trial_ends_at : subscription.current_period_end;
  const trialTotal = 30;
  const trialProgress = isTrial
    ? Math.max(0, Math.min(100, ((trialTotal - stats.days_remaining) / trialTotal) * 100))
    : 100;

  const employeeProgress =
    stats.max_employees !== null && stats.max_employees > 0
      ? Math.min(100, (stats.current_employees / stats.max_employees) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mon abonnement
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez votre plan SmartPresence.
        </p>
      </div>

      {/* Alerte expiration */}
      {isExpired && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-destructive">
              Votre abonnement est expiré
            </p>
            <p className="text-sm text-muted-foreground">
              Vos données sont conservées. Contactez-nous pour réactiver votre accès.
            </p>
          </div>
        </div>
      )}

      {/* Plan actuel */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-card-foreground">
          Plan actuel
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Plan + statut */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Plan
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  PLAN_COLOR[plan.name] ?? "bg-muted text-foreground"
                }`}
              >
                {PLAN_NAMES[plan.name] ?? plan.name}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  STATUS_COLOR[subscription.status] ?? "bg-muted text-foreground"
                }`}
              >
                {STATUS_LABEL[subscription.status] ?? subscription.status}
              </span>
            </div>
          </div>

          {/* Jours restants */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {isTrial ? "Essai" : "Période en cours"}
            </p>
            {isTrial ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-card-foreground">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <strong>{stats.days_remaining}j</strong> restants
                  </span>
                  <span className="text-xs text-muted-foreground">
                    sur {trialTotal} jours
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.days_remaining <= 5
                        ? "bg-destructive"
                        : "bg-orange-500"
                    }`}
                    style={{ width: `${trialProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-card-foreground">
                {endDate
                  ? new Date(endDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            )}
          </div>

          {/* Employés */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Employés
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-card-foreground">
                  <Users className="h-4 w-4 text-blue-500" />
                  <strong>{stats.current_employees}</strong>
                  {stats.max_employees !== null && (
                    <span className="text-muted-foreground">
                      / {stats.max_employees}
                    </span>
                  )}
                </span>
                {stats.max_employees === null && (
                  <span className="text-xs text-muted-foreground">illimités</span>
                )}
              </div>
              {stats.max_employees !== null && (
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      employeeProgress >= 90 ? "bg-destructive" : "bg-blue-500"
                    }`}
                    style={{ width: `${employeeProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA upgrade rapide */}
        {(isTrial || isExpired) && (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">
              {isTrial ? "Passez à un plan payant pour conserver l'accès." : "Réactivez votre abonnement pour retrouver l'accès."}
            </p>
            <UpgradeButton plans={plans} currentPlanName={plan.name} />
          </div>
        )}

        {/* Features incluses */}
        <div className={`${isTrial || isExpired ? "" : "mt-6 "}border-t border-border pt-5`}>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Fonctionnalités incluses
          </p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {(PLAN_FEATURES[plan.name] ?? []).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-card-foreground">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Plans disponibles */}
      <PlansGrid
        plans={plans}
        currentPlanName={plan.name}
        isTrial={isTrial}
        isExpired={isExpired}
      />

      {/* Paiements manuels */}
      <PaymentRequestsHistory
        requests={paymentRequests}
        plans={plans}
        currentPlanName={plan.name}
      />

      {/* CTA contact */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">
                Besoin d&apos;un plan sur mesure ?
              </p>
              <p className="text-xs text-muted-foreground">
                Nombre d&apos;employés important, plusieurs sites, facturation personnalisée…
              </p>
            </div>
          </div>
          <a
            href="mailto:support@smartpresence.app?subject=Demande plan sur mesure"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Mail className="h-4 w-4" />
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}
