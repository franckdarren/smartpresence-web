import { db } from "@/lib/db";
import { companies, notificationLogs, subscriptions, users } from "@/lib/db/schema";
import type { NotificationLog } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export type SubscriptionWithAdmin = {
  company_id: string;
  company_name: string;
  status: "trial" | "active" | "expired" | "cancelled";
  current_period_end: Date;
  trial_ends_at: Date | null;
  admin_email: string;
  admin_name: string;
};

export class NotificationRepository {
  async findActiveSubscriptionsWithAdmin(): Promise<SubscriptionWithAdmin[]> {
    const rows = await db
      .select({
        company_id: subscriptions.company_id,
        company_name: companies.name,
        status: subscriptions.status,
        current_period_end: subscriptions.current_period_end,
        trial_ends_at: subscriptions.trial_ends_at,
        admin_email: users.email,
        admin_name: users.name,
      })
      .from(subscriptions)
      .innerJoin(companies, eq(subscriptions.company_id, companies.id))
      .innerJoin(
        users,
        and(eq(users.company_id, companies.id), eq(users.role, "admin"))
      )
      .where(inArray(subscriptions.status, ["active", "trial"]));

    // Un seul admin par entreprise (le premier trouvé)
    const seen = new Set<string>();
    return rows.filter((row) => {
      if (seen.has(row.company_id)) return false;
      seen.add(row.company_id);
      return true;
    }) as SubscriptionWithAdmin[];
  }

  async hasBeenSent(
    companyId: string,
    type: string,
    periodRef: Date
  ): Promise<boolean> {
    const [existing] = await db
      .select({ id: notificationLogs.id })
      .from(notificationLogs)
      .where(
        and(
          eq(notificationLogs.company_id, companyId),
          eq(notificationLogs.type, type),
          eq(notificationLogs.period_ref, periodRef)
        )
      )
      .limit(1);
    return !!existing;
  }

  async logNotification(data: {
    company_id: string;
    type: string;
    email_to: string;
    period_ref: Date;
  }): Promise<NotificationLog> {
    const [log] = await db.insert(notificationLogs).values(data).returning();
    return log;
  }
}
