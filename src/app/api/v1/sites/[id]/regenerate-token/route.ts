import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { SitesService } from "@/modules/sites/sites.service";

const service = new SitesService();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);
    await requireActiveSubscription(user.company_id);

    const { id } = await params;
    const site = await service.regenerateToken(id, user.company_id);
    return ApiResponse.success(site, "QR Code régénéré");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
