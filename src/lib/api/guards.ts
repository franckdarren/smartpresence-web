import type { NextRequest } from "next/server";
import type { User } from "@/lib/db/schema";
import { AuthService } from "@/modules/auth/auth.service";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";

const subscriptionService = new SubscriptionService();

export class GuardError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "GuardError";
  }
}

function extractBearer(req: NextRequest): string | undefined {
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
}

export async function requireAuth(req: NextRequest): Promise<User> {
  try {
    return await AuthService.getAuthenticatedUser(extractBearer(req));
  } catch (err) {
    console.error("[requireAuth] authentication failed:", err);
    throw new GuardError(401, "Non authentifié");
  }
}

export async function requireRole(roles: string[], req: NextRequest): Promise<User> {
  const user = await requireAuth(req);
  if (!roles.includes(user.role)) {
    throw new GuardError(403, "Accès refusé");
  }
  return user;
}

export async function requireSameCompany(companyId: string, req: NextRequest): Promise<User> {
  const user = await requireAuth(req);
  if (user.company_id !== companyId) {
    throw new GuardError(403, "Accès refusé");
  }
  return user;
}

/**
 * Vérifie que l'abonnement de l'entreprise est actif (trial en cours ou active).
 * À appeler après requireAuth/requireRole en passant user.company_id.
 * Les superadmins (company_id = null) sont toujours exemptés.
 */
export async function requireActiveSubscription(
  companyId: string | null | undefined
): Promise<void> {
  if (!companyId) return; // superadmin ou pas d'entreprise
  const isActive = await subscriptionService.isSubscriptionActive(companyId);
  if (!isActive) {
    throw new GuardError(
      403,
      "Abonnement expiré. Veuillez renouveler votre abonnement."
    );
  }
}

/**
 * Vérifie qu'il reste des slots employés disponibles sur l'abonnement.
 * À appeler après requireAuth/requireRole en passant user.company_id.
 */
export async function requireEmployeeSlot(
  companyId: string | null | undefined
): Promise<void> {
  if (!companyId) return;
  const check = await subscriptionService.checkEmployeeLimit(companyId);
  if (!check.allowed) {
    throw new GuardError(
      403,
      "Limite d'employés atteinte. Passez à un plan supérieur."
    );
  }
}

/**
 * Vérifie qu'il reste des slots de sites disponibles sur l'abonnement.
 * À appeler après requireAuth/requireRole en passant user.company_id.
 */
export async function requireSiteSlot(
  companyId: string | null | undefined
): Promise<void> {
  if (!companyId) return;
  const check = await subscriptionService.checkSiteLimit(companyId);
  if (!check.allowed) {
    throw new GuardError(
      403,
      "Limite de sites atteinte. Passez à un plan supérieur."
    );
  }
}
