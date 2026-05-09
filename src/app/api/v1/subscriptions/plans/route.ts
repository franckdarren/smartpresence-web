import { ApiResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";

const service = new SubscriptionService();

export async function GET() {
  try {
    const plans = await service.getAllPlans();
    return ApiResponse.success(plans, "Plans récupérés");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
