import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";

const service = new SubscriptionService();

export async function GET(req: NextRequest) {
  try {
    await requireRole(["superadmin"], req);
    const subscriptions = await service.getAllSubscriptions();
    return ApiResponse.success(subscriptions, "Abonnements récupérés");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
