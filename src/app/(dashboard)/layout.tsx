import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthService } from "@/modules/auth/auth.service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TrialBanner } from "@/components/dashboard/trial-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await AuthService.getAuthenticatedUser();
  const showTrialBanner = dbUser.role === "admin" && !!dbUser.company_id;

  return (
    <DashboardShell
      role={dbUser.role}
      name={dbUser.name}
      email={dbUser.email}
      trialBanner={
        showTrialBanner ? (
          <Suspense fallback={null}>
            <TrialBanner companyId={dbUser.company_id!} />
          </Suspense>
        ) : null
      }
    >
      {children}
    </DashboardShell>
  );
}
