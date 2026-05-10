import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { ApiResponse } from "@/lib/api/response";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { CompaniesService } from "@/modules/companies/companies.service";

const registerSchema = z.object({
  name:         z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email:        z.string().email("Adresse e-mail invalide"),
  password:     z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
  company_name: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères").max(100),
  latitude:     z.number().min(-90).max(90),
  longitude:    z.number().min(-180).max(180),
  radius:       z.number().min(50).max(5000).default(100),
});

const companiesService = new CompaniesService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const { name, email, password, company_name, latitude, longitude, radius } = parsed.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      const msg = authError?.message ?? "Échec de la création du compte";
      if (msg.toLowerCase().includes("already registered")) {
        return ApiResponse.error("Cette adresse e-mail est déjà utilisée", 409);
      }
      return ApiResponse.error(msg, 400);
    }

    const authUserId = authData.user.id;

    // 2. Créer l'entreprise (auto-démarre le trial de 30 jours)
    const company = await companiesService.create({
      name: company_name,
      latitude,
      longitude,
      radius,
      wifi_ssid: null,
    });

    // 3. Créer l'utilisateur admin dans la table users
    await db.insert(users).values({
      id:         authUserId,
      name,
      email,
      role:       "admin",
      company_id: company.id,
    });

    return ApiResponse.success(
      { email },
      "Compte créé. Connectez-vous pour accéder à votre dashboard.",
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 500);
  }
}
