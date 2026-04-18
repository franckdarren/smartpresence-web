import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { users, companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/db/schema";

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export async function createAdminForCompany(
  companyId: string,
  data: CreateAdminInput
): Promise<User> {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) throw new Error("Entreprise introuvable");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "Échec de la création du compte");
  }

  const [admin] = await db
    .insert(users)
    .values({
      id: authData.user.id,
      name: data.name,
      email: data.email,
      role: "admin",
      company_id: companyId,
    })
    .returning();

  return admin;
}
