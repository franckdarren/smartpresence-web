import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CompaniesService } from "@/modules/companies/companies.service";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { SettingsForm } from "./components/SettingsForm";
import { SubscriptionSection } from "./components/SubscriptionSection";

const companyService = new CompaniesService();
const subscriptionService = new SubscriptionService();

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role")
    .eq("id", user!.id)
    .single();

  const companyId = profile?.company_id ?? null;

  const [company, subscriptionData, allPlans] = await Promise.all([
    companyId
      ? companyService.getById(companyId).catch(() => null)
      : Promise.resolve(null),
    companyId
      ? subscriptionService.getSubscriptionWithStats(companyId).catch(() => null)
      : Promise.resolve(null),
    subscriptionService.getAllPlans().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configurez les informations et la géolocalisation de votre entreprise.
        </p>
      </div>

      {company ? (
        <SettingsForm company={company} />
      ) : (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Aucune entreprise associée à votre compte.
          </p>
        </div>
      )}

      <SubscriptionSection
        subscription={subscriptionData?.subscription ?? null}
        plan={subscriptionData?.plan ?? null}
        stats={subscriptionData?.stats ?? null}
        allPlans={allPlans}
      />
    </div>
  );
}
