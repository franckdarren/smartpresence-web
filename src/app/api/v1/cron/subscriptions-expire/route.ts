import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";

// Vercel Cron déclenche cette route chaque jour à minuit UTC
// Protection via Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return ApiResponse.error("Non autorisé", 401);
  }

  try {
    const service = new SubscriptionService();
    const result = await service.expireStaleSubscriptions();
    return ApiResponse.success(result, `${result.expired} abonnement(s) expiré(s)`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 500);
  }
}
