import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { NotificationService } from "@/modules/notifications/notification.service";

// Vercel Cron déclenche cette route chaque jour à 8h UTC
// Protection via Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return ApiResponse.error("Non autorisé", 401);
  }

  try {
    const service = new NotificationService();
    const result = await service.run();

    return ApiResponse.success(result, "Rappels traités");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 500);
  }
}
