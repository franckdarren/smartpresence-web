import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";

const repo = new AttendanceRepository();
const subscriptionService = new SubscriptionService();

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 404);
    await requireActiveSubscription(user.company_id);

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const employeeId = searchParams.get("employeeId") ?? undefined;

    const date = dateParam ? new Date(dateParam) : new Date();

    // Enforce history limit based on plan
    const subWithPlan = await subscriptionService.getSubscriptionWithStats(user.company_id);
    const historyMonths = subWithPlan?.plan.history_months ?? null;

    if (historyMonths !== null) {
      const minDate = new Date();
      minDate.setMonth(minDate.getMonth() - historyMonths);
      minDate.setHours(0, 0, 0, 0);
      if (date < minDate) {
        return ApiResponse.error(
          `Votre plan limite l'historique à ${historyMonths} mois. Passez à un plan supérieur pour accéder à un historique plus long.`,
          403
        );
      }
    }

    const records = await repo.findByCompanyAndDate(user.company_id, date, employeeId);
    return ApiResponse.success(records, "Présences récupérées");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
