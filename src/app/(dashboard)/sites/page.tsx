import { redirect } from "next/navigation";
import { AuthService } from "@/modules/auth/auth.service";
import { SitesService } from "@/modules/sites/sites.service";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { SiteCard } from "./components/SiteCard";
import { AddSiteModal } from "./components/AddSiteModal";
import { MapPin, Lock } from "lucide-react";

const sitesService = new SitesService();
const subscriptionService = new SubscriptionService();

export default async function SitesPage() {
  const user = await AuthService.getAuthenticatedUser();
  if (user.role === "employee") redirect("/dashboard");
  if (!user.company_id) redirect("/dashboard");

  const [sitesList, subData] = await Promise.all([
    sitesService.listByCompany(user.company_id),
    subscriptionService.getSubscriptionWithStats(user.company_id),
  ]);

  const plan = subData?.plan;
  const maxSites = plan?.max_sites ?? null;
  const wifiEnabled = plan?.wifi_check_enabled ?? false;
  const currentSites = sitesList.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sites de pointage
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chaque site a son propre QR Code, rayon GPS et SSID Wi-Fi.
            {maxSites !== null && (
              <span className="ml-1 text-muted-foreground">
                ({currentSites}/{maxSites} sites utilisés)
              </span>
            )}
          </p>
        </div>

        <AddSiteModal
          maxSites={maxSites}
          currentSites={currentSites}
          wifiEnabled={wifiEnabled}
        />
      </div>

      {/* Plan info */}
      {!wifiEnabled && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Vérification Wi-Fi non disponible sur votre plan
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Passez au plan Business ou Enterprise pour activer la double vérification GPS + Wi-Fi.
            </p>
          </div>
        </div>
      )}

      {sitesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
          <div className="rounded-full bg-muted p-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">Aucun site configuré</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajoutez votre premier site pour générer un QR Code de pointage.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {sitesList.map((site) => (
            <SiteCard key={site.id} site={site} wifiEnabled={wifiEnabled} />
          ))}
        </div>
      )}
    </div>
  );
}
