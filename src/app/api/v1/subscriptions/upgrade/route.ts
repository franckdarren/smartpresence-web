import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { upgradeSubscriptionSchema } from "@/modules/subscriptions/subscription.validator";

const service = new SubscriptionService();

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["admin"], req);
    if (!user.company_id) {
      return ApiResponse.error("Aucune entreprise associée", 404);
    }

    const body = await req.json();
    const parsed = upgradeSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const subscription = await service.upgradePlan(
      user.company_id,
      parsed.data.plan_id,
      parsed.data.billing_cycle
    );
    return ApiResponse.success(subscription, "Plan mis à jour");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
