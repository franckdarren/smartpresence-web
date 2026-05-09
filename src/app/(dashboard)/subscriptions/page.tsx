import { Building2, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { SubscriptionsTable } from "./components/SubscriptionsTable";

const service = new SubscriptionService();

function calculateMRR(
  subscriptions: Awaited<ReturnType<typeof service.getAllSubscriptions>>
): number {
  return subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .reduce((acc, s) => {
      const baseMonthly =
        s.plan.price_monthly + s.extra_employees * s.plan.extra_employee_price;
      return acc + baseMonthly;
    }, 0);
}

export default async function SubscriptionsPage() {
  const [subscriptions, plans] = await Promise.all([
    service.getAllSubscriptions(),
    service.getAllPlans(),
  ]);

  const total = subscriptions.length;
  const active = subscriptions.filter((s) => s.status === "active").length;
  const trial = subscriptions.filter((s) => s.status === "trial").length;
  const expired = subscriptions.filter(
    (s) => s.status === "expired" || s.status === "cancelled"
  ).length;
  const mrr = calculateMRR(subscriptions);

  const stats = [
    {
      label: "Total entreprises",
      value: total,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Abonnements actifs",
      value: active,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "En trial",
      value: trial,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Expirés / Annulés",
      value: expired,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "MRR estimé",
      value: `${mrr.toLocaleString("fr-FR")} FCFA`,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
      wide: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Abonnements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestion manuelle des abonnements de toutes les entreprises.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-xl border border-border bg-card p-5 shadow-sm ${
                "wide" in s && s.wide ? "sm:col-span-2 xl:col-span-1" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="text-xl font-bold text-card-foreground">
                    {s.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {subscriptions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Aucun abonnement enregistré.
          </p>
        </div>
      ) : (
        <SubscriptionsTable subscriptions={subscriptions} plans={plans} />
      )}
    </div>
  );
}
