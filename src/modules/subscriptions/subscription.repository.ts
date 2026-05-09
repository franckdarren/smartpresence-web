import { db } from "@/lib/db";
import { plans, subscriptions, companies } from "@/lib/db/schema";
import type {
  Plan,
  Subscription,
  NewSubscription,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type SubscriptionWithPlan = Subscription & { plan: Plan };

export type SubscriptionWithCompanyAndPlan = Subscription & {
  plan: Plan;
  company_name: string;
};

export class SubscriptionRepository {
  // ── Plans ─────────────────────────────────────────────────

  async findAllPlans(): Promise<Plan[]> {
    return db.select().from(plans).orderBy(plans.price_monthly);
  }

  async findPlanById(id: string): Promise<Plan | undefined> {
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);
    return plan;
  }

  async findPlanByName(name: "starter" | "business" | "enterprise"): Promise<Plan | undefined> {
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.name, name))
      .limit(1);
    return plan;
  }

  // ── Subscriptions ─────────────────────────────────────────

  async findByCompanyId(companyId: string): Promise<Subscription | undefined> {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.company_id, companyId))
      .limit(1);
    return sub;
  }

  async findByCompanyIdWithPlan(
    companyId: string
  ): Promise<SubscriptionWithPlan | undefined> {
    const result = await db
      .select({
        // subscription fields
        id: subscriptions.id,
        company_id: subscriptions.company_id,
        plan_id: subscriptions.plan_id,
        status: subscriptions.status,
        billing_cycle: subscriptions.billing_cycle,
        current_period_start: subscriptions.current_period_start,
        current_period_end: subscriptions.current_period_end,
        trial_ends_at: subscriptions.trial_ends_at,
        extra_employees: subscriptions.extra_employees,
        created_at: subscriptions.created_at,
        updated_at: subscriptions.updated_at,
        // plan fields nested
        plan: plans,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.plan_id, plans.id))
      .where(eq(subscriptions.company_id, companyId))
      .limit(1);

    if (!result[0]) return undefined;
    const { plan, ...sub } = result[0];
    return { ...sub, plan };
  }

  async findAllWithCompanyAndPlan(): Promise<SubscriptionWithCompanyAndPlan[]> {
    const result = await db
      .select({
        id: subscriptions.id,
        company_id: subscriptions.company_id,
        plan_id: subscriptions.plan_id,
        status: subscriptions.status,
        billing_cycle: subscriptions.billing_cycle,
        current_period_start: subscriptions.current_period_start,
        current_period_end: subscriptions.current_period_end,
        trial_ends_at: subscriptions.trial_ends_at,
        extra_employees: subscriptions.extra_employees,
        created_at: subscriptions.created_at,
        updated_at: subscriptions.updated_at,
        plan: plans,
        company_name: companies.name,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.plan_id, plans.id))
      .innerJoin(companies, eq(subscriptions.company_id, companies.id))
      .orderBy(subscriptions.created_at);

    return result.map(({ plan, company_name, ...sub }) => ({
      ...sub,
      plan,
      company_name,
    }));
  }

  async findById(id: string): Promise<Subscription | undefined> {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);
    return sub;
  }

  async create(data: NewSubscription): Promise<Subscription> {
    const [sub] = await db.insert(subscriptions).values(data).returning();
    return sub;
  }

  async update(
    id: string,
    data: Partial<Omit<NewSubscription, "id" | "company_id" | "created_at">>
  ): Promise<Subscription> {
    const [sub] = await db
      .update(subscriptions)
      .set({ ...data, updated_at: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return sub;
  }
}
