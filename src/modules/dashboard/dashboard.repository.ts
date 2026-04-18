import { db } from "@/lib/db";
import { attendances, users } from "@/lib/db/schema";
import { and, count, eq, gte, lt } from "drizzle-orm";

export type DashboardStats = {
  total_employees: number;
  present_today: number;
  absent_today: number;
  attendance_rate: number;
};

export class DashboardRepository {
  async getStatsByCompany(companyId: string): Promise<DashboardStats> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.company_id, companyId));

    const [presentResult] = await db
      .select({ count: count() })
      .from(attendances)
      .innerJoin(users, eq(attendances.user_id, users.id))
      .where(
        and(
          eq(users.company_id, companyId),
          gte(attendances.check_in, startOfDay),
          lt(attendances.check_in, endOfDay)
        )
      );

    const total_employees = totalResult?.count ?? 0;
    const present_today = presentResult?.count ?? 0;
    const absent_today = total_employees - present_today;
    const attendance_rate =
      total_employees > 0
        ? Math.round((present_today / total_employees) * 100)
        : 0;

    return { total_employees, present_today, absent_today, attendance_rate };
  }
}
