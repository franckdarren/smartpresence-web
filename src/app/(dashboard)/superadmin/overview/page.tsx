import { Building2, Users, CalendarCheck, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { users, companies, attendances } from "@/lib/db/schema";
import { gte, lte, and, sql } from "drizzle-orm";

async function getGlobalStats() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const [totalCompanies, totalUsers, totalEmployees, checkInsToday] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(companies).then((r) => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)::int` }).from(users).then((r) => r[0]?.count ?? 0),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(sql`${users.role} = 'employee'`)
      .then((r) => r[0]?.count ?? 0),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(attendances)
      .where(and(gte(attendances.check_in, startOfDay), lte(attendances.check_in, endOfDay)))
      .then((r) => r[0]?.count ?? 0),
  ]);

  return { totalCompanies, totalUsers, totalEmployees, checkInsToday };
}

export default async function SuperadminOverviewPage() {
  const stats = await getGlobalStats();

  const now = new Date();
  const dateLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cards = [
    {
      title: "Entreprises",
      value: stats.totalCompanies,
      description: "Entreprises enregistrées",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      description: "Tous rôles confondus",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Employés",
      value: stats.totalEmployees,
      description: "Rôle employé uniquement",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pointages aujourd'hui",
      value: stats.checkInsToday,
      description: "Sur toutes les entreprises",
      icon: CalendarCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Vue globale
        </h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {dateLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-card-foreground">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className={`rounded-lg p-2.5 ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
