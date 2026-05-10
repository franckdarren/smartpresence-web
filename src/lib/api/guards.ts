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
 * Les superadmins (company_id = null) sont toujours exemptés.
 */
export async function requireActiveSubscription(
  companyId: string | null | undefined
): Promise<void> {
  if (!companyId) return;
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

export type PlanFeature = "wifi_check" | "excel_export" | "advanced_reports" | "api_access";

const FEATURE_LABELS: Record<PlanFeature, string> = {
  wifi_check: "Vérification Wi-Fi",
  excel_export: "Export CSV/Excel",
  advanced_reports: "Rapports avancés",
  api_access: "Accès API REST",
};

const FEATURE_PLAN_HINT: Record<PlanFeature, string> = {
  wifi_check: "Business ou supérieur",
  excel_export: "Business ou supérieur",
  advanced_reports: "Enterprise",
  api_access: "Enterprise",
};

/**
 * Vérifie qu'une fonctionnalité est disponible sur le plan actuel.
 * Lance GuardError(403) si non disponible.
 */
export async function requireFeature(
  companyId: string | null | undefined,
  feature: PlanFeature
): Promise<void> {
  if (!companyId) return;

  const data = await subscriptionService.getSubscriptionWithStats(companyId);
  if (!data) {
    throw new GuardError(403, "Abonnement introuvable");
  }

  const { plan } = data;
  const featureMap: Record<PlanFeature, boolean> = {
    wifi_check: plan.wifi_check_enabled,
    excel_export: plan.excel_export_enabled,
    advanced_reports: plan.advanced_reports_enabled,
    api_access: plan.api_access_enabled,
  };

  if (!featureMap[feature]) {
    throw new GuardError(
      403,
      `${FEATURE_LABELS[feature]} est disponible à partir du plan ${FEATURE_PLAN_HINT[feature]}.`
    );
  }
}
