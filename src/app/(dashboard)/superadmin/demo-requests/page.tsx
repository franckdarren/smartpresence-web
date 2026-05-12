import { Inbox } from "lucide-react";
import { db } from "@/lib/db";
import { demoRequests } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  new:       "Nouveau",
  contacted: "Contacté",
  converted: "Converti",
};

const statusStyles: Record<string, string> = {
  new:       "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  converted: "bg-emerald-50 text-emerald-700",
};

const employeeCountLabels: Record<string, string> = {
  "<15":    "< 15 employés",
  "15-50":  "15 – 50",
  "50-200": "50 – 200",
  "200+":   "200+",
};

export default async function DemoRequestsPage() {
  const requests = await db
    .select()
    .from(demoRequests)
    .orderBy(desc(demoRequests.created_at));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Demandes de démo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {requests.length} demande{requests.length !== 1 ? "s" : ""} reçue{requests.length !== 1 ? "s" : ""}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Aucune demande de démo pour l'instant
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Taille</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Reçu le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-card-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                    {r.phone && (
                      <p className="text-xs text-muted-foreground">{r.phone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{r.company_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {employeeCountLabels[r.employee_count] ?? r.employee_count}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[r.status] ?? "bg-gray-50 text-gray-700")}>
                      {statusLabels[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
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
