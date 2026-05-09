import {
  SubscriptionRepository,
  type SubscriptionWithPlan,
  type SubscriptionWithCompanyAndPlan,
} from "./subscription.repository";
import { EmployeesRepository } from "@/modules/employees/employees.repository";
import type { Plan, Subscription } from "@/lib/db/schema";

const repo = new SubscriptionRepository();
const employeeRepo = new EmployeesRepository();

export type SubscriptionStats = {
  current_employees: number;
  max_employees: number | null;
  current_sites: number;
  max_sites: number | null;
  is_active: boolean;
  days_remaining: number;
};

export type SubscriptionWithStats = {
  subscription: Subscription;
  plan: Plan;
  stats: SubscriptionStats;
};

export type PriceCalculation = {
  monthly_price: number;
  total_price: number;
  billing_cycle: "monthly" | "yearly";
  discount_amount: number;
};

export type EmployeeLimitCheck = {
  allowed: boolean;
  current: number;
  max: number | null;
};

function daysUntil(date: Date | null): number {
  if (!date) return 0;
  const diffMs = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}

export class SubscriptionService {
  // ── Plans ─────────────────────────────────────────────────

  async getAllPlans(): Promise<Plan[]> {
    return repo.findAllPlans();
  }

  // ── Création trial ────────────────────────────────────────

  async createTrialSubscription(
    companyId: string,
    planId: string
  ): Promise<Subscription> {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 30);

    return repo.create({
      company_id: companyId,
      plan_id: planId,
      status: "trial",
      billing_cycle: "monthly",
      current_period_start: now,
      current_period_end: trialEnd,
      trial_ends_at: trialEnd,
      extra_employees: 0,
    });
  }

  // ── Statut actif ──────────────────────────────────────────

  async isSubscriptionActive(companyId: string): Promise<boolean> {
    const sub = await repo.findByCompanyId(companyId);
    if (!sub) return false;
    if (sub.status === "active") return true;
    if (sub.status === "trial" && sub.trial_ends_at) {
      return new Date(sub.trial_ends_at) > new Date();
    }
    return false;
  }

  // ── Limites ───────────────────────────────────────────────

  async checkEmployeeLimit(companyId: string): Promise<EmployeeLimitCheck> {
    const subWithPlan = await repo.findByCompanyIdWithPlan(companyId);
    if (!subWithPlan) return { allowed: false, current: 0, max: 0 };

    const { plan, extra_employees } = subWithPlan;
    const current = await employeeRepo.countByCompanyId(companyId);

    if (plan.max_employees === null) {
      return { allowed: true, current, max: null };
    }

    const effectiveMax = plan.max_employees + extra_employees;
    return { allowed: current < effectiveMax, current, max: effectiveMax };
  }

  async checkSiteLimit(
    companyId: string
  ): Promise<{ allowed: boolean; current: number; max: number | null }> {
    const subWithPlan = await repo.findByCompanyIdWithPlan(companyId);
    if (!subWithPlan) return { allowed: false, current: 0, max: 0 };

    const { plan } = subWithPlan;
    // Dans le schéma actuel, une entreprise a toujours 1 site (1 QR code)
    const current = 1;

    if (plan.max_sites === null) {
      return { allowed: true, current, max: null };
    }

    return { allowed: current <= plan.max_sites, current, max: plan.max_sites };
  }

  // ── Calcul prix ───────────────────────────────────────────

  async calculateMonthlyPrice(
    planId: string,
    extraEmployees: number,
    billingCycle: "monthly" | "yearly"
  ): Promise<PriceCalculation> {
    const plan = await repo.findPlanById(planId);
    if (!plan) throw new Error("Plan not found");

    const baseMonthly =
      plan.price_monthly + extraEmployees * plan.extra_employee_price;

    if (billingCycle === "monthly") {
      return {
        monthly_price: baseMonthly,
        total_price: baseMonthly,
        billing_cycle: "monthly",
        discount_amount: 0,
      };
    }

    // Annuel : 10 mois payés pour 12
    const totalPrice = baseMonthly * 10;
    const discountAmount = baseMonthly * 2;
    return {
      monthly_price: baseMonthly,
      total_price: totalPrice,
      billing_cycle: "yearly",
      discount_amount: discountAmount,
    };
  }

  // ── Upgrade plan ──────────────────────────────────────────

  async upgradePlan(
    companyId: string,
    newPlanId: string,
    billingCycle: "monthly" | "yearly"
  ): Promise<Subscription> {
    const sub = await repo.findByCompanyId(companyId);
    if (!sub) throw new Error("Subscription not found");

    const plan = await repo.findPlanById(newPlanId);
    if (!plan) throw new Error("Plan not found");

    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    return repo.update(sub.id, {
      plan_id: newPlanId,
      billing_cycle: billingCycle,
      status: "active",
      current_period_start: now,
      current_period_end: periodEnd,
      trial_ends_at: null,
    });
  }

  // ── Stats complètes (pour /subscriptions/me) ──────────────

  async getSubscriptionWithStats(
    companyId: string
  ): Promise<SubscriptionWithStats | null> {
    const subWithPlan = await repo.findByCompanyIdWithPlan(companyId);
    if (!subWithPlan) return null;

    const { plan, extra_employees, ...sub } = subWithPlan;
    const currentEmployees = await employeeRepo.countByCompanyId(companyId);
    const isActive = await this.isSubscriptionActive(companyId);

    const endDate =
      sub.status === "trial" ? sub.trial_ends_at : sub.current_period_end;
    const daysRemaining = daysUntil(endDate);

    const maxEmployees =
      plan.max_employees !== null
        ? plan.max_employees + extra_employees
        : null;

    return {
      subscription: { ...sub, extra_employees },
      plan,
      stats: {
        current_employees: currentEmployees,
        max_employees: maxEmployees,
        current_sites: 1,
        max_sites: plan.max_sites,
        is_active: isActive,
        days_remaining: daysRemaining,
      },
    };
  }

  // ── Superadmin : liste complète ───────────────────────────

  async getAllSubscriptions(): Promise<SubscriptionWithCompanyAndPlan[]> {
    return repo.findAllWithCompanyAndPlan();
  }

  // ── Superadmin : mise à jour manuelle ─────────────────────

  async adminUpdate(
    subscriptionId: string,
    data: {
      status?: "trial" | "active" | "expired" | "cancelled";
      plan_id?: string;
      billing_cycle?: "monthly" | "yearly";
      trial_ends_at?: Date | null;
      current_period_end?: Date;
      extra_employees?: number;
    }
  ): Promise<Subscription> {
    const sub = await repo.findById(subscriptionId);
    if (!sub) throw new Error("Subscription not found");
    return repo.update(subscriptionId, data);
  }
}
