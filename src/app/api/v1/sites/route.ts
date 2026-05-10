import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { SitesService } from "@/modules/sites/sites.service";
import { createSiteSchema } from "@/modules/sites/sites.validator";

const service = new SitesService();

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);
    await requireActiveSubscription(user.company_id);

    const sitesList = await service.listByCompany(user.company_id);
    return ApiResponse.success(sitesList, "Sites récupérés");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);
    await requireActiveSubscription(user.company_id);

    const body = await req.json();
    const parsed = createSiteSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.error(parsed.error.issues[0].message, 422);

    const site = await service.create(parsed.data, user.company_id);
    return ApiResponse.success(site, "Site créé", 201);
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
