import type { User } from "@/lib/db/schema";
import { AuthService } from "@/modules/auth/auth.service";

export class GuardError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "GuardError";
  }
}

export async function requireAuth(): Promise<User> {
  try {
    return await AuthService.getAuthenticatedUser();
  } catch {
    throw new GuardError(401, "Non authentifié");
  }
}

export async function requireRole(roles: string[]): Promise<User> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new GuardError(403, "Accès refusé");
  }
  return user;
}

export async function requireSameCompany(companyId: string): Promise<User> {
  const user = await requireAuth();
  if (user.company_id !== companyId) {
    throw new GuardError(403, "Accès refusé");
  }
  return user;
}
