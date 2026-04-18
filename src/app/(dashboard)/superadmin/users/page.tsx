import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { users, companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  employee: "Employé",
};

const roleStyles: Record<string, string> = {
  superadmin: "bg-violet-50 text-violet-700",
  admin: "bg-blue-50 text-blue-700",
  employee: "bg-emerald-50 text-emerald-700",
};

export default async function SuperadminUsersPage() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
      company_name: companies.name,
    })
    .from(users)
    .leftJoin(companies, eq(users.company_id, companies.id))
    .orderBy(users.created_at);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Utilisateurs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allUsers.length} utilisateur{allUsers.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      {allUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Aucun utilisateur enregistré
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          roleStyles[user.role] ?? "bg-gray-50 text-gray-700"
                        )}
                      >
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.company_name ?? (
                        <span className="text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
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
  );
}
