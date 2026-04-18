import { Building2, MapPin, Wifi } from "lucide-react";
import { CompaniesRepository } from "@/modules/companies/companies.repository";

export default async function SuperadminCompaniesPage() {
  const repo = new CompaniesRepository();
  const allCompanies = await repo.findAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Entreprises
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allCompanies.length} entreprise{allCompanies.length !== 1 ? "s" : ""} enregistrée{allCompanies.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {allCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-16 text-center">
          <Building2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Aucune entreprise enregistrée
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Position GPS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rayon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Wi-Fi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Créée le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-card-foreground">
                        {company.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {company.latitude.toFixed(4)}, {company.longitude.toFixed(4)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {company.radius} m
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {company.wifi_ssid ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Wifi className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{company.wifi_ssid}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {company.created_at
                      ? new Date(company.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
