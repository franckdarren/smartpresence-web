import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireAuth } from "@/lib/api/guards";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";

const service = new SubscriptionService();

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user.company_id) {
      return ApiResponse.error("Aucune entreprise associée", 404);
    }

    const data = await service.getSubscriptionWithStats(user.company_id);
    if (!data) {
      return ApiResponse.error("Aucun abonnement trouvé", 404);
    }

    return ApiResponse.success(data, "Abonnement récupéré");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
