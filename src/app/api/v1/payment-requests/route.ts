import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { requireRole, GuardError } from "@/lib/api/guards";
import { PaymentRequestService } from "@/modules/payment-requests/payment-request.service";
import { submitPaymentRequestSchema } from "@/modules/payment-requests/payment-request.validator";

const service = new PaymentRequestService();

// GET /api/v1/payment-requests — historique de l'admin connecté
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);

    const requests = await service.getByCompany(user.company_id);
    return ApiResponse.success(requests, "Demandes récupérées");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

// POST /api/v1/payment-requests — soumettre une preuve de paiement
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["admin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);

    const formData = await req.formData();
    const planId = formData.get("plan_id");
    const billingCycle = formData.get("billing_cycle");
    const proofFile = formData.get("proof");

    const parsed = submitPaymentRequestSchema.safeParse({ plan_id: planId, billing_cycle: billingCycle });
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    if (!(proofFile instanceof File) || proofFile.size === 0) {
      return ApiResponse.error("Fichier de preuve requis", 422);
    }

    if (proofFile.size > 5 * 1024 * 1024) {
      return ApiResponse.error("Le fichier ne doit pas dépasser 5 Mo", 422);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(proofFile.type)) {
      return ApiResponse.error("Format accepté : JPG, PNG, WebP ou PDF", 422);
    }

    const request = await service.submit(
      user.company_id,
      parsed.data.plan_id,
      parsed.data.billing_cycle,
      proofFile
    );

    return ApiResponse.success(request, "Demande soumise avec succès", 201);
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
