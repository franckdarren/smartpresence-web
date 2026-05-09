import { redirect } from "next/navigation";
import { AuthService } from "@/modules/auth/auth.service";

export default async function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await AuthService.getAuthenticatedUser();
  if (user.role !== "superadmin") {
    redirect("/dashboard/unauthorized");
  }
  return <>{children}</>;
}
