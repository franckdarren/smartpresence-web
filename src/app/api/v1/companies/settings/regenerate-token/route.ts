import { randomUUID } from "crypto";
import { type NextRequest } from "next/server";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { CompaniesService } from "@/modules/companies/companies.service";
import { ApiResponse } from "@/lib/api/response";

const service = new CompaniesService();

// Legacy endpoint: regenerates the company-level token (kept for backward compat).
// For multi-site token regeneration, use POST /api/v1/sites/[id]/regenerate-token.
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 404);
    await requireActiveSubscription(user.company_id);

    const company = await service.update(user.company_id, {
      company_token: randomUUID(),
    });
    return ApiResponse.success(company, "QR Code régénéré");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
