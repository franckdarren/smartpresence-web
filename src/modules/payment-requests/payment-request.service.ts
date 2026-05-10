import { createClient } from "@supabase/supabase-js";
import {
  PaymentRequestRepository,
  type PaymentRequestWithDetails,
} from "./payment-request.repository";
import { SubscriptionRepository } from "@/modules/subscriptions/subscription.repository";
import type { PaymentRequest } from "@/lib/db/schema";

const repo = new PaymentRequestRepository();
const subRepo = new SubscriptionRepository();

function serviceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function calculateAmount(
  priceMonthly: number,
  billingCycle: "monthly" | "yearly"
): number {
  return billingCycle === "monthly" ? priceMonthly : priceMonthly * 10;
}

export class PaymentRequestService {
  // ── Soumettre une demande de paiement ─────────────────────

  async submit(
    companyId: string,
    planId: string,
    billingCycle: "monthly" | "yearly",
    proofFile: File
  ): Promise<PaymentRequest> {
    const plan = await subRepo.findPlanById(planId);
    if (!plan) throw new Error("Plan introuvable");

    const sub = await subRepo.findByCompanyId(companyId);
    if (!sub) throw new Error("Abonnement introuvable");

    // Upload proof to Supabase Storage
    const ext = proofFile.name.split(".").pop() ?? "jpg";
    const storagePath = `${companyId}/${Date.now()}.${ext}`;
    const supabase = serviceRoleClient();

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(storagePath, proofFile, {
        contentType: proofFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erreur lors de l'upload : ${uploadError.message}`);
    }

    const amount = calculateAmount(plan.price_monthly, billingCycle);

    return repo.create({
      company_id: companyId,
      subscription_id: sub.id,
      plan_id: planId,
      billing_cycle: billingCycle,
      amount,
      proof_storage_path: storagePath,
      status: "pending",
    });
  }

  // ── Liste pour l'admin ────────────────────────────────────

  async getByCompany(companyId: string): Promise<PaymentRequest[]> {
    return repo.findByCompanyId(companyId);
  }

  // ── Liste pour le superadmin (avec signed URLs) ───────────

  async getAllWithProofUrls(): Promise<
    (PaymentRequestWithDetails & { proof_url: string | null })[]
  > {
    const requests = await repo.findAll();
    const supabase = serviceRoleClient();

    return Promise.all(
      requests.map(async (r) => {
        const { data } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(r.proof_storage_path, 3600);
        return { ...r, proof_url: data?.signedUrl ?? null };
      })
    );
  }

  // ── Approuver ─────────────────────────────────────────────

  async approve(
    requestId: string,
    reviewerId: string,
    notes?: string
  ): Promise<PaymentRequest> {
    const request = await repo.findById(requestId);
    if (!request) throw new Error("Demande introuvable");
    if (request.status !== "pending") throw new Error("Demande déjà traitée");

    // Activer l'abonnement avec le plan et le cycle demandés
    const sub = request.subscription_id
      ? await subRepo.findById(request.subscription_id)
      : await subRepo.findByCompanyId(request.company_id);

    if (!sub) throw new Error("Abonnement introuvable");

    const now = new Date();
    const periodEnd = new Date(now);
    if (request.billing_cycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    await subRepo.update(sub.id, {
      plan_id: request.plan_id,
      billing_cycle: request.billing_cycle,
      status: "active",
      current_period_start: now,
      current_period_end: periodEnd,
      trial_ends_at: null,
    });

    return repo.update(requestId, {
      status: "approved",
      notes: notes ?? null,
      reviewed_by: reviewerId,
      reviewed_at: now,
    });
  }

  // ── Rejeter ───────────────────────────────────────────────

  async reject(
    requestId: string,
    reviewerId: string,
    notes?: string
  ): Promise<PaymentRequest> {
    const request = await repo.findById(requestId);
    if (!request) throw new Error("Demande introuvable");
    if (request.status !== "pending") throw new Error("Demande déjà traitée");

    return repo.update(requestId, {
      status: "rejected",
      notes: notes ?? null,
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
    });
  }
}
