import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { requireRole, GuardError } from "@/lib/api/guards";
import { PaymentRequestService } from "@/modules/payment-requests/payment-request.service";

const service = new PaymentRequestService();

// GET /api/v1/superadmin/payment-requests — toutes les demandes avec signed URLs
export async function GET(req: NextRequest) {
  try {
    await requireRole(["superadmin"], req);
    const requests = await service.getAllWithProofUrls();
    return ApiResponse.success(requests, "Demandes récupérées");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
