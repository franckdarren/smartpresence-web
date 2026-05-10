import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/db/schema";

type LoginResult = {
  access_token: string;
  refresh_token: string;
  user: User;
};

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResult> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error("Identifiants invalides");
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.user.id))
      .limit(1);

    if (!dbUser) {
      throw new Error("Utilisateur introuvable");
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: dbUser,
    };
  }

  static async getAuthenticatedUser(bearerToken?: string): Promise<User> {
    let authUserId: string | null = null;

    if (bearerToken) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase.auth.getUser(bearerToken);
      if (error || !data.user) {
        throw new Error("Non authentifié");
      }
      authUserId = data.user.id;
    } else {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
          },
        }
      );
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();
      if (error || !authUser) {
        throw new Error("Non authentifié");
      }
      authUserId = authUser.id;
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUserId))
      .limit(1);

    if (!dbUser) {
      throw new Error("Utilisateur introuvable");
    }

    return dbUser;
  }
}
