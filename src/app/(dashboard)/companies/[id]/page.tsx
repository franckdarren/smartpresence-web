import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  Wifi,
  WifiOff,
  Radius,
  CalendarDays,
  QrCode,
  UserCog,
} from "lucide-react";
import { db } from "@/lib/db";
import { companies, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { AddAdminModal } from "./components/AddAdminModal";

async function getCompany(id: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  return company ?? null;
}

async function getAdmins(companyId: string) {
  return db
    .select()
    .from(users)
    .where(and(eq(users.company_id, companyId), eq(users.role, "admin")))
    .orderBy(users.created_at);
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [company, admins] = await Promise.all([getCompany(id), getAdmins(id)]);

  if (!company) notFound();

  const createdAt = company.created_at
    ? new Date(company.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/companies" className="hover:text-foreground transition-colors">
            Entreprises
          </a>
          <span>/</span>
          <span className="text-foreground">{company.name}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          {company.name}
        </h1>
      </div>

      {/* Company detail card */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-card-foreground">
            Informations de l&apos;entreprise
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <dl className="divide-y divide-border">
            <div className="flex items-start gap-3 px-6 py-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Position GPS
                </dt>
                <dd className="mt-0.5 text-sm text-card-foreground">
                  {company.latitude.toFixed(6)}, {company.longitude.toFixed(6)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 px-6 py-4">
              <Radius className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rayon de présence
                </dt>
                <dd className="mt-0.5 text-sm text-card-foreground">
                  {company.radius} mètres
                </dd>
              </div>
            </div>
          </dl>
          <dl className="divide-y divide-border">
            <div className="flex items-start gap-3 px-6 py-4">
              {company.wifi_ssid ? (
                <>
                  <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Wi-Fi requis
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-emerald-600">
                      {company.wifi_ssid}
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Wi-Fi
                    </dt>
                    <dd className="mt-0.5 text-sm text-muted-foreground">
                      Non configuré
                    </dd>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-start gap-3 px-6 py-4">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date de création
                </dt>
                <dd className="mt-0.5 text-sm text-card-foreground">
                  {createdAt}
                </dd>
              </div>
            </div>
          </dl>
        </div>
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-start gap-3">
            <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Token QR Code
              </dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-card-foreground">
                {company.company_token}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Admins section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Administrateurs
            </h2>
            <p className="text-sm text-muted-foreground">
              {admins.length} admin{admins.length !== 1 ? "s" : ""} pour cette
              entreprise
            </p>
          </div>
          <AddAdminModal companyId={id} />
        </div>

        {admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
            <UserCog className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucun administrateur
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ajoutez un admin pour gérer cette entreprise.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ajouté le
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admins.map((admin) => {
                  const initials = admin.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={admin.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials}
                          </div>
                          <span className="font-medium text-card-foreground">
                            {admin.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {admin.created_at
                          ? new Date(admin.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
