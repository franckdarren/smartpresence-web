import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthService } from "@/modules/auth/auth.service";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={dbUser.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar name={dbUser.name} email={dbUser.email} role={dbUser.role} />
        {showTrialBanner && (
          <Suspense fallback={null}>
            <TrialBanner companyId={dbUser.company_id!} />
          </Suspense>
        )}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
