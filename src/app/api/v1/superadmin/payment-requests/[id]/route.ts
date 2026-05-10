import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { requireRole, GuardError } from "@/lib/api/guards";
import { PaymentRequestService } from "@/modules/payment-requests/payment-request.service";
import { reviewPaymentRequestSchema } from "@/modules/payment-requests/payment-request.validator";

const service = new PaymentRequestService();

// PATCH /api/v1/superadmin/payment-requests/[id] — approuver ou rejeter
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reviewer = await requireRole(["superadmin"], req);
    const { id } = await params;

    const body = await req.json();
    const parsed = reviewPaymentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const { action, notes } = parsed.data;

    const updated =
      action === "approve"
        ? await service.approve(id, reviewer.id, notes)
        : await service.reject(id, reviewer.id, notes);

    const message =
      action === "approve" ? "Paiement approuvé — abonnement activé" : "Demande rejetée";

    return ApiResponse.success(updated, message);
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
