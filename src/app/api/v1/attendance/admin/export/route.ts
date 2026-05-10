import { type NextRequest, NextResponse } from "next/server";
import { GuardError, requireRole, requireActiveSubscription, requireFeature } from "@/lib/api/guards";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { ApiResponse } from "@/lib/api/response";

const repo = new AttendanceRepository();
const subscriptionService = new SubscriptionService();

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 404);
    await requireActiveSubscription(user.company_id);
    await requireFeature(user.company_id, "excel_export");

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const employeeId = searchParams.get("employeeId") ?? undefined;

    const date = dateParam ? new Date(dateParam) : new Date();

    // Enforce history limit
    const subWithStats = await subscriptionService.getSubscriptionWithStats(user.company_id);
    const historyMonths = subWithStats?.plan.history_months ?? null;
    if (historyMonths !== null) {
      const minDate = new Date();
      minDate.setMonth(minDate.getMonth() - historyMonths);
      minDate.setHours(0, 0, 0, 0);
      if (date < minDate) {
        return ApiResponse.error(
          `Votre plan limite l'historique à ${historyMonths} mois.`,
          403
        );
      }
    }

    const records = await repo.findByCompanyAndDate(user.company_id, date, employeeId);

    const headers = ["Employé", "Email", "Date", "Arrivée", "Départ", "Wi-Fi", "Latitude", "Longitude"];
    const rows = records.map((r) => [
      escapeCSV(r.user_name),
      escapeCSV(r.user_email),
      escapeCSV(new Date(r.check_in).toLocaleDateString("fr-FR")),
      escapeCSV(formatDate(r.check_in)),
      escapeCSV(formatDate(r.check_out)),
      escapeCSV(r.wifi_ssid),
      escapeCSV(String(r.latitude)),
      escapeCSV(String(r.longitude)),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const filename = `presences-${date.toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
