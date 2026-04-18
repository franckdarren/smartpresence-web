import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, attendances } from "@/lib/db/schema";
import { eq, and, gte, lte, isNull, isNotNull, sql } from "drizzle-orm";

async function getDashboardStats(companyId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const [totalEmployees, presentToday] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.company_id, companyId), eq(users.role, "employee")))
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: sql<number>`count(distinct ${attendances.user_id})::int` })
      .from(attendances)
      .innerJoin(users, eq(attendances.user_id, users.id))
      .where(
        and(
          eq(users.company_id, companyId),
          gte(attendances.check_in, startOfDay),
          lte(attendances.check_in, endOfDay)
        )
      )
      .then((r) => r[0]?.count ?? 0),
  ]);

  const absentToday = Math.max(0, totalEmployees - presentToday);
  const attendanceRate =
    totalEmployees > 0
      ? Math.round((presentToday / totalEmployees) * 100)
      : 0;

  return { totalEmployees, presentToday, absentToday, attendanceRate };
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, name")
    .eq("id", user!.id)
    .single();

  const stats = profile?.company_id
    ? await getDashboardStats(profile.company_id)
    : { totalEmployees: 0, presentToday: 0, absentToday: 0, attendanceRate: 0 };

  const cards = [
    {
      title: "Total employés",
      value: stats.totalEmployees,
      description: "Employés enregistrés",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Présents aujourd'hui",
      value: stats.presentToday,
      description: "Ont pointé aujourd'hui",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Absents aujourd'hui",
      value: stats.absentToday,
      description: "N'ont pas encore pointé",
      icon: UserX,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Taux de présence",
      value: `${stats.attendanceRate}%`,
      description: "Ce jour",
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tableau de bord
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

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-card-foreground">
          Activité récente
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Les données d&apos;activité s&apos;afficheront ici.
        </p>
      </div>
    </div>
  );
}
