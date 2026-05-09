import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { adminUpdateSubscriptionSchema } from "@/modules/subscriptions/subscription.validator";

const service = new SubscriptionService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["superadmin"], req);

    const { id } = await params;
    const body = await req.json();
    const parsed = adminUpdateSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const { trial_ends_at, current_period_end, ...rest } = parsed.data;

    const subscription = await service.adminUpdate(id, {
      ...rest,
      trial_ends_at:
        trial_ends_at !== undefined
          ? trial_ends_at
            ? new Date(trial_ends_at)
            : null
          : undefined,
      current_period_end: current_period_end
        ? new Date(current_period_end)
        : undefined,
    });
    return ApiResponse.success(subscription, "Abonnement mis à jour");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
