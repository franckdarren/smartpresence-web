import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { SitesService } from "@/modules/sites/sites.service";
import { updateSiteSchema } from "@/modules/sites/sites.validator";

const service = new SitesService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);
    await requireActiveSubscription(user.company_id);

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSiteSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.error(parsed.error.issues[0].message, 422);

    const site = await service.update(id, user.company_id, parsed.data);
    return ApiResponse.success(site, "Site mis à jour");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);
    await requireActiveSubscription(user.company_id);

    const { id } = await params;
    await service.delete(id, user.company_id);
    return ApiResponse.success(null, "Site supprimé");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
