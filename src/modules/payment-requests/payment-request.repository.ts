import { db } from "@/lib/db";
import {
  paymentRequests,
  plans,
  companies,
  users,
} from "@/lib/db/schema";
import type {
  PaymentRequest,
  NewPaymentRequest,
  Plan,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export type PaymentRequestWithDetails = PaymentRequest & {
  plan: Plan;
  company_name: string;
  admin_email: string;
};

export class PaymentRequestRepository {
  async findByCompanyId(companyId: string): Promise<PaymentRequest[]> {
    return db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.company_id, companyId))
      .orderBy(desc(paymentRequests.created_at));
  }

  async findAll(): Promise<PaymentRequestWithDetails[]> {
    const result = await db
      .select({
        id: paymentRequests.id,
        company_id: paymentRequests.company_id,
        subscription_id: paymentRequests.subscription_id,
        plan_id: paymentRequests.plan_id,
        billing_cycle: paymentRequests.billing_cycle,
        amount: paymentRequests.amount,
        proof_storage_path: paymentRequests.proof_storage_path,
        status: paymentRequests.status,
        notes: paymentRequests.notes,
        reviewed_by: paymentRequests.reviewed_by,
        reviewed_at: paymentRequests.reviewed_at,
        created_at: paymentRequests.created_at,
        plan: plans,
        company_name: companies.name,
        admin_email: users.email,
      })
      .from(paymentRequests)
      .innerJoin(plans, eq(paymentRequests.plan_id, plans.id))
      .innerJoin(companies, eq(paymentRequests.company_id, companies.id))
      .innerJoin(users, eq(users.company_id, paymentRequests.company_id))
      .where(eq(users.role, "admin"))
      .orderBy(desc(paymentRequests.created_at));

    return result.map(({ plan, company_name, admin_email, ...req }) => ({
      ...req,
      plan,
      company_name,
      admin_email,
    }));
  }

  async findById(id: string): Promise<PaymentRequest | undefined> {
    const [req] = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.id, id))
      .limit(1);
    return req;
  }

  async create(data: NewPaymentRequest): Promise<PaymentRequest> {
    const [req] = await db.insert(paymentRequests).values(data).returning();
    return req;
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        PaymentRequest,
        "status" | "notes" | "reviewed_by" | "reviewed_at"
      >
    >
  ): Promise<PaymentRequest> {
    const [req] = await db
      .update(paymentRequests)
      .set(data)
      .where(eq(paymentRequests.id, id))
      .returning();
    return req;
  }
}
