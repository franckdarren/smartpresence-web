import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const SUPERADMIN_API_PREFIX = "/api/v1/superadmin";
const SUBSCRIPTION_EXPIRED_PATH = "/dashboard/subscription-expired";

// Routes dashboard où l'admin expiré est autorisé à accéder
const SUBSCRIPTION_EXEMPT_PATHS = [
  "/settings",
  "/my-subscription",
  SUBSCRIPTION_EXPIRED_PATH,
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user: cookieUser },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/v1");

  // Pour les routes API, accepte aussi les Bearer tokens (clients mobiles)
  let user = cookieUser;
  if (!user && isApiRoute) {
    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (bearer) {
      const bearerClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await bearerClient.auth.getUser(bearer);
      user = data.user ?? null;
    }
  }

  const isProtectedDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/companies") ||
    pathname.startsWith("/subscriptions") ||
    pathname.startsWith("/my-subscription");

  const isProtectedApi =
    pathname.startsWith("/api/v1") &&
    !pathname.startsWith("/api/v1/auth") &&
    !pathname.startsWith("/api/v1/demo-request");

  // 401 — non authentifié
  if ((isProtectedDashboard || isProtectedApi) && !user) {
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, message: "Non authentifié", data: null },
        { status: 401 }
      );
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 403 — routes superadmin API : vérifie le rôle via service role key
  if (user && pathname.startsWith(SUPERADMIN_API_PREFIX)) {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await serviceClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Accès réservé aux super administrateurs", data: null },
        { status: 403 }
      );
    }
  }

  // Vérification abonnement expiré — routes dashboard admin uniquement
  if (
    user &&
    isProtectedDashboard &&
    !SUBSCRIPTION_EXEMPT_PATHS.some((p) => pathname.startsWith(p))
  ) {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await serviceClient
      .from("users")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" && profile.company_id) {
      const { data: subscription } = await serviceClient
        .from("subscriptions")
        .select("status, trial_ends_at")
        .eq("company_id", profile.company_id)
        .single();

      if (subscription) {
        const now = new Date();
        const isExpired =
          subscription.status === "expired" ||
          subscription.status === "cancelled" ||
          (subscription.status === "trial" &&
            subscription.trial_ends_at &&
            new Date(subscription.trial_ends_at) < now);

        if (isExpired) {
          const expiredUrl = request.nextUrl.clone();
          expiredUrl.pathname = SUBSCRIPTION_EXPIRED_PATH;
          return NextResponse.redirect(expiredUrl);
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/attendance/:path*",
    "/settings/:path*",
    "/superadmin/:path*",
    "/companies/:path*",
    "/subscriptions/:path*",
    "/my-subscription/:path*",
    "/my-subscription",
    "/api/v1/:path*",
  ],
};
