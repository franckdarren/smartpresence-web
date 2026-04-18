import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CompaniesService } from "@/modules/companies/companies.service";
import { SettingsForm } from "./components/SettingsForm";

const service = new CompaniesService();

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

  const company = profile?.company_id
    ? await service.getById(profile.company_id).catch(() => null)
    : null;

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
    </div>
  );
}
