import Link from "next/link";
import { Clock, Zap } from "lucide-react";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";

const service = new SubscriptionService();

interface Props {
  companyId: string;
}

export async function TrialBanner({ companyId }: Props) {
  let daysRemaining = 0;
  let isTrial = false;

  try {
    const data = await service.getSubscriptionWithStats(companyId);
    if (!data) return null;
    isTrial = data.subscription.status === "trial";
    daysRemaining = data.stats.days_remaining;
  } catch {
    return null;
  }

  if (!isTrial) return null;

  const isUrgent = daysRemaining <= 5;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-6 py-3 text-sm ${
        isUrgent
          ? "bg-destructive/10 text-destructive"
          : "bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          {daysRemaining === 0 ? (
            <strong>Votre essai gratuit expire aujourd&apos;hui.</strong>
          ) : (
            <>
              <strong>Essai gratuit —</strong> il vous reste{" "}
              <strong>{daysRemaining} jour{daysRemaining > 1 ? "s" : ""}</strong>.
            </>
          )}
          {" "}Passez à un plan payant pour conserver l&apos;accès.
        </span>
      </div>
      <Link
        href="/my-subscription"
        className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 ${
          isUrgent
            ? "bg-destructive text-destructive-foreground"
            : "bg-orange-600 text-white dark:bg-orange-500"
        }`}
      >
        <Zap className="h-3 w-3" />
        Mettre à niveau
      </Link>
    </div>
  );
}
