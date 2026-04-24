import type { NextRequest } from "next/server";
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

function extractBearer(req: NextRequest): string | undefined {
  const auth = req.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
}

export async function requireAuth(req: NextRequest): Promise<User> {
  try {
    return await AuthService.getAuthenticatedUser(extractBearer(req));
  } catch {
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
